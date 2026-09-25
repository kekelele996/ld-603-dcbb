from datetime import datetime, timezone

from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.services.location_event_service import LocationEventService
from src.constructors.inspection_result_factory import create_inspection_result_dto
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.utils.service_error import ServiceError


class InspectionResultService:
    def __init__(self):
        self.repo = InspectionResultRepository()
        self.task_repo = InspectionTaskRepository()
        self.device_repo = FireDeviceRepository()
        self.event_service = LocationEventService()

    def list(self):
        return self.repo.find_all()

    @staticmethod
    def _same_location(left, right):
        return (
            left.get("building_id") == right.get("building_id")
            and str(left.get("floor", "")) == str(right.get("floor", ""))
            and str(left.get("location_desc", "")) == str(right.get("location_desc", ""))
        )

    def submit(self, payload):
        # 巡检员只按自己拿到的任务位置提交；设备被换位后，任务快照仍指向旧位置
        task = self.task_repo.find_by_id(payload["task_id"])
        if task is None:
            raise ServiceError(
                ERROR_CODES["ENTITY_NOT_FOUND"],
                ERROR_MESSAGES["ENTITY_NOT_FOUND"],
                status_code=404,
            )

        device = self.device_repo.find_by_id(task.get("device_id") or payload.get("device_id"))
        task_location = {
            "building_id": task.get("snapshot_building_id"),
            "floor": task.get("snapshot_floor", ""),
            "location_desc": task.get("snapshot_location_desc", ""),
        }
        submitted_location = {
            "building_id": payload.get("building_id", task_location["building_id"]),
            "floor": payload.get("floor", task_location["floor"]),
            "location_desc": payload.get("location_desc", task_location["location_desc"]),
        }
        device_location = {
            "building_id": device["building_id"] if device else None,
            "floor": device.get("floor", "") if device else "",
            "location_desc": device.get("location_desc", "") if device else "",
        }

        # 对不上任务位置就提示冲突，结果绝不写入新位置
        if not self._same_location(submitted_location, task_location):
            self.event_service.record(
                "RESULT_CONFLICT",
                device_id=task.get("device_id") or payload.get("device_id"),
                actor_id=payload.get("actor_id", 0),
                actor_role=payload.get("actor_role", "inspector"),
                task_id=task["id"],
                from_location=submitted_location,
                to_location=task_location,
                note="提交位置与任务位置不一致，已拦截",
            )
            raise ServiceError(
                ERROR_CODES["LOCATION_CONFLICT"],
                ERROR_MESSAGES["LOCATION_CONFLICT"],
                status_code=409,
            )

        row = create_inspection_result_dto(
            id=self.repo.next_id(),
            task_id=task["id"],
            device_id=task.get("device_id") or payload.get("device_id"),
            item_code=payload["item_code"],
            result_status=payload.get("result_status", "SUBMITTED"),
            measured_value=payload.get("measured_value", ""),
            photo_url=payload.get("photo_url", ""),
            note=payload.get("note", ""),
            building_id=task_location["building_id"],
            floor=task_location["floor"],
            location_desc=task_location["location_desc"],
            superseded=False,
        )
        self.repo.add(row)

        # 主管已要求按新位置重检：在新位置提交后任务闭环，差异状态置为 SUPERSEDED
        if task.get("location_resolution") == "REINSPECT_NEW":
            self.task_repo.update(task, location_resolution="SUPERSEDED")
            self.event_service.record(
                "RESULT_RESUBMITTED",
                device_id=row["device_id"],
                actor_id=payload.get("actor_id", 0),
                actor_role=payload.get("actor_role", "inspector"),
                task_id=task["id"],
                result_id=row["id"],
                from_location=task_location,
                to_location=device_location if not self._same_location(task_location, device_location) else task_location,
                note="已按新位置重新提交",
            )

        return row
