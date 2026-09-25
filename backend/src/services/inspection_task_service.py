from src.constructors.inspection_task_factory import (
    create_inspection_task_dto,
    create_task_dispatch_form,
)
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.constants.location_resolution import LocationResolution
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.services.errors import ConflictStateError, NotFoundError, ValidationError
from src.utils.clock import now_iso


class InspectionTaskService:
    def __init__(self):
        self.repo = InspectionTaskRepository()
        self.device_repo = FireDeviceRepository()
        self.result_repo = InspectionResultRepository()

    def list(self):
        return self.repo.find_all()

    def dispatch(self, payload):
        """任务下发：保存楼栋、楼层和具体位置快照。"""
        form = create_task_dispatch_form(**(payload or {}))
        device_id = form.get("device_id")
        device = self.device_repo.find_by_id(device_id)
        if not device:
            raise NotFoundError(
                ERROR_MESSAGES["DEVICE_NOT_FOUND"].format(device_id=device_id),
                code=ERROR_CODES["DEVICE_NOT_FOUND"],
            )

        timestamp = now_iso()
        row = create_inspection_task_dto(
            device_id=device["id"],
            building_id=device["building_id"],
            inspector_id=form.get("inspector_id", 1),
            plan_date=form.get("plan_date", timestamp),
            task_type=form.get("task_type", device["device_type"]),
            status="PLANNED",
            checklist_version=form.get("checklist_version", "v2.1"),
            finished_at="",
            # 下发时冻结设备当前位置
            snapshot_building_id=device["building_id"],
            snapshot_floor=device["floor"],
            snapshot_location_desc=device["location_desc"],
            current_building_id=device["building_id"],
            current_floor=device["floor"],
            current_location_desc=device["location_desc"],
            location_state="SYNCED",
            location_conflict_type="NONE",
            moved_at="",
            conflict_at="",
        )
        row["history"] = [
            {
                "at": timestamp,
                "action": "任务下发",
                "detail": f"下发位置：楼栋#{device['building_id']} {device['floor']} / {device['location_desc']}",
                "operator_role": payload.get("operator_role") or "admin",
            }
        ]
        return self.repo.add(row)

    def resolve_location_conflict(self, task_id, payload):
        """主管处理位置冲突：确认原位置有效，或要求按新位置重检。"""
        task = self.repo.find_by_id(task_id)
        if not task:
            raise NotFoundError(
                ERROR_MESSAGES["TASK_NOT_FOUND"].format(task_id=task_id),
                code=ERROR_CODES["TASK_NOT_FOUND"],
            )
        if task.get("location_state") != "CONFLICT":
            raise ConflictStateError(
                ERROR_MESSAGES["CONFLICT_ALREADY_RESOLVED"].format(task_id=task_id),
                code=ERROR_CODES["CONFLICT_ALREADY_RESOLVED"],
            )

        resolution = (payload or {}).get("resolution")
        if resolution not in LocationResolution:
            raise ValidationError(
                ERROR_MESSAGES["VALIDATION_FAILED"] + f": resolution={resolution}",
                code=ERROR_CODES["VALIDATION_FAILED"],
            )

        operator = payload.get("operator_role") or "supervisor"
        note = (payload.get("note") or "").strip()
        timestamp = now_iso()
        task["location_resolved_by"] = operator
        task["location_resolved_at"] = timestamp
        task["location_resolution_note"] = note
        task["location_resolution"] = resolution

        old_desc = f"楼栋#{task.get('snapshot_building_id')} {task.get('snapshot_floor')} / {task.get('snapshot_location_desc')}"
        new_desc = f"楼栋#{task.get('current_building_id')} {task.get('current_floor')} / {task.get('current_location_desc')}"

        if resolution == "KEEP_OLD":
            # 确认原位置有效：任务、结果继续按旧位置对应，差异保留可追溯
            task["location_state"] = "CONFIRMED_OLD"
            task["history"].append(
                {
                    "at": timestamp,
                    "action": "主管确认原位置有效",
                    "detail": f"维持任务位置（{old_desc}）；巡检员按任务位置补交结果。说明：{note or '无'}",
                    "operator_role": operator,
                }
            )
        else:
            # 要求按新位置重检：任务换到新位置，旧结果作废
            self.result_repo.supersede_task_results(task_id)
            task["snapshot_building_id"] = task["current_building_id"]
            task["snapshot_floor"] = task["current_floor"]
            task["snapshot_location_desc"] = task["current_location_desc"]
            task["location_state"] = "REINSPECT_NEW"
            task["location_conflict_type"] = "NONE"
            task["status"] = "IN_PROGRESS"
            task["history"].append(
                {
                    "at": timestamp,
                    "action": "主管要求按新位置重检",
                    "detail": f"任务改到新位置（{new_desc}），旧位置（{old_desc}）结果已标记作废，等待重新巡检。说明：{note or '无'}",
                    "operator_role": operator,
                }
            )
        return task
