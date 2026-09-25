from src.constructors.inspection_result_factory import create_inspection_result_dto, create_result_submit_form
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.services.errors import LocationConflictError, NotFoundError, ValidationError
from src.services.location_policy import detect_conflict_type, submitted_location_matches_device
from src.utils.clock import now_iso


class InspectionResultService:
    def __init__(self):
        self.repo = InspectionResultRepository()
        self.task_repo = InspectionTaskRepository()
        self.device_repo = FireDeviceRepository()

    def list(self):
        return self.repo.find_all()

    def submit(self, payload):
        """巡检员按任务位置提交结果。

        - 提交位置与任务下发位置快照对不上：提示冲突，结果不写入、不挂到设备新位置；
        - 主管确认原位置有效（CONFIRMED_OLD）：按旧位置快照提交才放行；
        - 主管要求按新位置重检（REINSPECT_NEW）：任务快照已更新到新位置，按新位置提交放行。
        """
        form = create_result_submit_form(**(payload or {}))
        task = self.task_repo.find_by_id(form.get("task_id"))
        if not task:
            raise NotFoundError(
                ERROR_MESSAGES["TASK_NOT_FOUND"].format(task_id=form.get("task_id")),
                code=ERROR_CODES["TASK_NOT_FOUND"],
            )

        submit_building_id = form.get("submit_building_id")
        submit_floor = (form.get("submit_floor") or "").strip()
        submit_location = (form.get("submit_location_desc") or "").strip()
        if submit_building_id in (None, "") or not submit_floor or not submit_location:
            raise ValidationError(ERROR_MESSAGES["LOCATION_REQUIRED"], code=ERROR_CODES["LOCATION_REQUIRED"])

        mismatch = detect_conflict_type(submit_building_id, submit_floor, submit_location, task)
        # 冲突挂起期间（主管尚未确认原位置或要求重检）一律禁止提交，避免结果写进任一台账
        if task.get("location_state") == "CONFLICT":
            self._block_submission(
                task,
                task.get("location_conflict_type") or mismatch or "MOVED_DEVICE",
                submit_building_id,
                submit_floor,
                submit_location,
                form,
            )
        if mismatch != "NONE":
            self._block_submission(task, mismatch, submit_building_id, submit_floor, submit_location, form)

        timestamp = now_iso()
        row = create_inspection_result_dto(
            task_id=task["id"],
            device_id=task["device_id"],
            item_code=form.get("item_code", "CHECK"),
            result_status=form.get("result_status", "NORMAL"),
            measured_value=form.get("measured_value", ""),
            photo_url=form.get("photo_url", ""),
            note=form.get("note", ""),
            submit_building_id=submit_building_id,
            submit_floor=submit_floor,
            submit_location_desc=submit_location,
            conflict_flag=False,
            is_superseded=False,
            created_at=timestamp,
        )
        saved = self.repo.add(row)

        # 冲突处理后重新提交成功：任务回到与位置一致的状态
        if task.get("location_state") in ("CONFIRMED_OLD", "REINSPECT_NEW"):
            task["history"].append(
                {
                    "at": timestamp,
                    "action": "按处置意见重新提交",
                    "detail": (
                        "按确认的原位置提交，结果有效"
                        if task["location_state"] == "CONFIRMED_OLD"
                        else "按新位置重检提交，结果有效，任务、结果与新台账对应"
                    ),
                    "operator_role": payload.get("operator_role") or "inspector",
                }
            )
            if task["location_state"] == "REINSPECT_NEW":
                task["location_state"] = "SYNCED"
                task["status"] = "SUBMITTED"
        elif task.get("location_state") == "DIVERGED":
            # 与快照一致的正常提交，即使设备已经换位，也只写到任务旧位置
            task["history"].append(
                {
                    "at": timestamp,
                    "action": "按任务位置提交",
                    "detail": "设备已换位，但结果按任务下发位置提交，未写入设备新位置",
                    "operator_role": payload.get("operator_role") or "inspector",
                }
            )
        return saved

    def _block_submission(self, task, mismatch, submit_building_id, submit_floor, submit_location, form):
        timestamp = now_iso()
        device = self.device_repo.find_by_id(task.get("device_id"))
        points_to_new = bool(device) and submitted_location_matches_device(
            submit_building_id, submit_floor, submit_location, device
        )
        conflict_type = "MOVED_DEVICE" if points_to_new else mismatch
        # DIVERGED 场景下首次发现对不上，同样升级为 CONFLICT 等待主管处理
        task["location_state"] = "CONFLICT"
        task["location_conflict_type"] = conflict_type
        task["conflict_at"] = timestamp
        task["history"].append(
            {
                "at": timestamp,
                "action": "提交被拦截",
                "detail": (
                    f"提交位置 楼栋#{submit_building_id} {submit_floor} / {submit_location} "
                    f"与任务位置 楼栋#{task.get('snapshot_building_id')} {task.get('snapshot_floor')} / "
                    f"{task.get('snapshot_location_desc')} 不一致（{conflict_type}），结果未写入，等待主管处理"
                ),
                "operator_role": form.get("operator_role") or "inspector",
            }
        )
        raise LocationConflictError(
            ERROR_MESSAGES["LOCATION_CONFLICT"].format(field=conflict_type),
            details={
                "task_id": task["id"],
                "conflict_type": conflict_type,
                "snapshot": {
                    "building_id": task.get("snapshot_building_id"),
                    "floor": task.get("snapshot_floor"),
                    "location_desc": task.get("snapshot_location_desc"),
                },
                "submitted": {
                    "building_id": submit_building_id,
                    "floor": submit_floor,
                    "location_desc": submit_location,
                },
                "device_current": {
                    "building_id": device.get("building_id") if device else None,
                    "floor": device.get("floor") if device else None,
                    "location_desc": device.get("location_desc") if device else None,
                },
            },
        )
