from src.constructors.fire_device_factory import create_fire_device_dto
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.services.errors import NotFoundError, ValidationError
from src.services.location_policy import is_auto_move_task, is_keep_snapshot_task
from src.utils.clock import now_iso


class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()
        self.task_repo = InspectionTaskRepository()

    def list(self):
        return self.repo.find_all()

    def relocate(self, device_id, payload):
        """管理员修改设备位置。

        - 未开始的任务换到新位置（MOVED_PENDING）；
        - 进行中 / 待复核任务保留旧位置并标出差异（DIVERGED）。
        """
        device = self.repo.find_by_id(device_id)
        if not device:
            raise NotFoundError(
                ERROR_MESSAGES["DEVICE_NOT_FOUND"].format(device_id=device_id),
                code=ERROR_CODES["DEVICE_NOT_FOUND"],
            )

        building_id = payload.get("building_id")
        floor = (payload.get("floor") or "").strip()
        location_desc = (payload.get("location_desc") or "").strip()
        if building_id in (None, "") or not floor or not location_desc:
            raise ValidationError(ERROR_MESSAGES["LOCATION_REQUIRED"], code=ERROR_CODES["LOCATION_REQUIRED"])

        operator = payload.get("operator_role") or "admin"
        old = create_fire_device_dto(**device)
        touched = []
        for task in self.repo.find_tasks(device_id):
            touched.append(self._apply_task_location_change(task, building_id, floor, location_desc, operator))

        self.repo.update_location(device, building_id, floor, location_desc)
        return {"device": device, "old_location": old, "tasks": touched}

    def _apply_task_location_change(self, task, building_id, floor, location_desc, operator):
        timestamp = now_iso()
        task["current_building_id"] = building_id
        task["current_floor"] = floor
        task["current_location_desc"] = location_desc
        task["moved_at"] = timestamp

        old_desc = f"楼栋#{task.get('snapshot_building_id')} {task.get('snapshot_floor')} / {task.get('snapshot_location_desc')}"
        new_desc = f"楼栋#{building_id} {floor} / {location_desc}"

        if is_auto_move_task(task.get("status")):
            # 未开始：任务直接换到新位置，快照同步更新
            task["snapshot_building_id"] = building_id
            task["snapshot_floor"] = floor
            task["snapshot_location_desc"] = location_desc
            task["location_state"] = "MOVED_PENDING"
            task["location_conflict_type"] = "NONE"
            task.setdefault("history", []).append(
                {
                    "at": timestamp,
                    "action": "设备换位-任务改派",
                    "detail": f"任务尚未开始，位置由旧位置（{old_desc}）改到新位置（{new_desc}）",
                    "operator_role": operator,
                }
            )
        elif is_keep_snapshot_task(task.get("status")):
            # 进行中 / 待复核：保留旧位置并标出差异
            task["location_state"] = "DIVERGED"
            task["location_conflict_type"] = "MOVED_DEVICE"
            task.setdefault("history", []).append(
                {
                    "at": timestamp,
                    "action": "设备换位-保留旧位置",
                    "detail": f"任务{task.get('status')}，保留任务旧位置（{old_desc}），设备新位置（{new_desc}）已标出差异",
                    "operator_role": operator,
                }
            )
        else:
            task.setdefault("history", []).append(
                {
                    "at": timestamp,
                    "action": "设备换位",
                    "detail": f"任务已复核，设备位置更新为（{new_desc}），历史任务位置不变",
                    "operator_role": operator,
                }
            )
        return task
