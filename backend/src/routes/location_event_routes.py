from fastapi import APIRouter
from src.controllers.location_event_controller import list_location_event
router = APIRouter(prefix="/api/location-event", tags=["LocationEvent"])


@router.get("")
def list_location_events(device_id: int | None = None, task_id: int | None = None):
    # 位置差异处理时间线：重开页面仍可看到换位、冲突与裁决经过
    return list_location_event(device_id=device_id, task_id=task_id)
