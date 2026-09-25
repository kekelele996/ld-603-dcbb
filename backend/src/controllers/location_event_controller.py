from src.services.location_event_service import LocationEventService

service = LocationEventService()


def list_location_event(device_id: int | None = None, task_id: int | None = None):
    return service.list(device_id=device_id, task_id=task_id)
