from datetime import datetime, timezone

from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.services.location_event_service import LocationEventService
from src.constants.location_resolution import RESOLUTION_KEEP, RESOLUTION_REINSPECT
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.utils.service_error import ServiceError


class InspectionTaskService:
    def __init__(self):
        self.repo = InspectionTaskRepository()
        self.device_repo = FireDeviceRepository()
        self.event_service = LocationEventService()

    def list(self):
        return self.repo.find_all()

    def resolve_location(self, task_id, payload):
        task = self.repo.find_by_id(task_id)
        if task is None:
            raise ServiceError(
                ERROR_CODES["ENTITY_NOT_FOUND"],
                ERROR_MESSAGES["ENTITY_NOT_FOUND"],
                status_code=404,
            )
        if task.get("location_resolution") != "PENDING":
            # 只有保留旧位置、等待裁决的任务能走这里
            raise ServiceError(
                ERROR_CODES["TASK_NOT_PENDING"],
                ERROR_MESSAGES["TASK_NOT_PENDING"],
                status_code=409,
            )

        decision = payload["decision"]
        actor_id = payload.get("actor_id", 0)
        actor_role = payload.get("actor_role", "supervisor")
        note = payload.get("note", "")
        resolved_at = datetime.now(timezone.utc).isoformat()
        device = self.device_repo.find_by_id(task.get("device_id"))
        new_location = {
            "building_id": device["building_id"] if device else task.get("snapshot_building_id"),
            "floor": device.get("floor", "") if device else "",
            "location_desc": device.get("location_desc", "") if device else "",
        }

        if decision == RESOLUTION_KEEP:
            # 确认原位置有效：任务、结果维持旧位置快照，新台账记录在旧位置下
            self.repo.update(
                task,
                location_resolution=RESOLUTION_KEEP,
                location_resolved_by=actor_id,
                location_resolved_at=resolved_at,
                location_resolved_note=note,
            )
            self.event_service.record(
                "RESOLUTION_KEEP", task.get("device_id"), actor_id, actor_role,
                task_id=task_id, to_location=new_location, note=note,
            )
        elif decision == RESOLUTION_REINSPECT:
            # 要求按新位置重检：旧结果作废，任务快照切到设备当前的新位置
            from src.repositories.inspection_result_repository import InspectionResultRepository
            result_repo = InspectionResultRepository()
            for result in result_repo.supersede_task_results(task_id):
                self.event_service.record(
                    "RESULT_SUPERSEDED", task.get("device_id"), actor_id, actor_role,
                    task_id=task_id, result_id=result["id"], note="主管要求按新位置重检",
                )
            self.repo.update(
                task,
                location_resolution=RESOLUTION_REINSPECT,
                location_resolved_by=actor_id,
                location_resolved_at=resolved_at,
                location_resolved_note=note,
                snapshot_building_id=new_location["building_id"],
                snapshot_floor=new_location["floor"],
                snapshot_location_desc=new_location["location_desc"],
                building_id=new_location["building_id"],
            )
            self.event_service.record(
                "RESOLUTION_REINSPECT", task.get("device_id"), actor_id, actor_role,
                task_id=task_id, to_location=new_location, note=note,
            )
        else:
            raise ServiceError(
                ERROR_CODES["VALIDATION_FAILED"],
                ERROR_MESSAGES["VALIDATION_FAILED"],
                status_code=400,
            )

        return task
