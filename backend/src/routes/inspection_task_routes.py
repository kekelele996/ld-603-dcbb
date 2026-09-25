from fastapi import APIRouter, Request
from src.controllers.inspection_task_controller import list_inspection_task, resolve_task_location
router = APIRouter(prefix="/api/inspection-task", tags=["InspectionTask"])
router.get("")(list_inspection_task)


@router.post("/{task_id}/location-resolution")
async def resolve_location(task_id: int, payload: dict, request: Request):
    # 主管确认原位置有效（KEEP_ORIGINAL）或要求按新位置重检（REINSPECT_NEW）
    return resolve_task_location(task_id, payload, getattr(request.state, "user", None))
