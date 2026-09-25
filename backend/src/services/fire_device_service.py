from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.services.location_event_service import LocationEventService
from src.constants.location_resolution import (
    RELOCATION_MIGRATE_STATUSES,
    RELOCATION_PENDING_STATUSES,
    RELOCATION_ARCHIVE_STATUSES,
)
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.utils.service_error import ServiceError


class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()
        self.task_repo = InspectionTaskRepository()
        self.event_service = LocationEventService()

    def list(self):
        return self.repo.find_all()

    def relocate(self, device_id, payload):
        device = self.repo.find_by_id(device_id)
        if device is None:
            raise ServiceError(
                ERROR_CODES["ENTITY_NOT_FOUND"],
                ERROR_MESSAGES["ENTITY_NOT_FOUND"],
                status_code=404,
            )

        new_building_id = payload["building_id"]
        new_floor = payload["floor"]
        new_location_desc = payload["location_desc"]
        actor_id = payload.get("actor_id", 0)
        actor_role = payload.get("actor_role", "admin")
        note = payload.get("note", "")

        old_location = {
            "building_id": device["building_id"],
            "floor": device.get("floor", ""),
            "location_desc": device.get("location_desc", ""),
        }
        new_location = {
            "building_id": new_building_id,
            "floor": new_floor,
            "location_desc": new_location_desc,
        }

        # 1. 设备台账本身更新到新位置
        self.repo.update_location(device, new_building_id, new_floor, new_location_desc)
        self.event_service.record(
            "DEVICE_RELOCATED", device_id, actor_id, actor_role,
            from_location=old_location, to_location=new_location, note=note,
        )

        # 2. 按任务状态分流：未开始跟随迁移；进行中/待复核保留旧位置标冲突；已复核只留痕
        for task in self.task_repo.find_by_device(device_id):
            if task["status"] in RELOCATION_MIGRATE_STATUSES:
                self.task_repo.migrate_snapshot(task, new_building_id, new_floor, new_location_desc)
                self.event_service.record(
                    "TASK_MIGRATED", device_id, actor_id, actor_role,
                    task_id=task["id"], from_location=old_location, to_location=new_location,
                )
            elif task["status"] in RELOCATION_PENDING_STATUSES:
                self.task_repo.mark_pending(task)
                self.event_service.record(
                    "TASK_CONFLICTED", device_id, actor_id, actor_role,
                    task_id=task["id"], from_location=old_location, to_location=new_location,
                )
            elif task["status"] in RELOCATION_ARCHIVE_STATUSES:
                self.event_service.record(
                    "TASK_ARCHIVED", device_id, actor_id, actor_role,
                    task_id=task["id"], from_location=old_location, to_location=new_location,
                )

        return device
