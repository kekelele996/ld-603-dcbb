from datetime import datetime, timezone

from src.repositories.location_event_repository import LocationEventRepository
from src.constructors.location_event_factory import create_location_event_dto


class LocationEventService:
    def __init__(self):
        self.repo = LocationEventRepository()

    def list(self, device_id=None, task_id=None):
        rows = self.repo.find_all()
        if device_id is not None:
            rows = self.repo.find_by_device(device_id)
        if task_id is not None:
            rows = self.repo.find_by_task(task_id)
        return sorted(rows, key=lambda row: row["created_at"])

    def record(self, event_type, device_id, actor_id, actor_role="",
               task_id=None, result_id=None, from_location=None, to_location=None, note=""):
        from_location = from_location or {}
        to_location = to_location or {}
        row = create_location_event_dto(
            id=self.repo.next_id(),
            device_id=device_id,
            task_id=task_id,
            result_id=result_id,
            event_type=event_type,
            actor_id=actor_id,
            actor_role=actor_role,
            from_building_id=from_location.get("building_id"),
            from_floor=from_location.get("floor", ""),
            from_location_desc=from_location.get("location_desc", ""),
            to_building_id=to_location.get("building_id"),
            to_floor=to_location.get("floor", ""),
            to_location_desc=to_location.get("location_desc", ""),
            note=note,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        return self.repo.add(row)
