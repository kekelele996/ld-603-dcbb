from fastapi import APIRouter, Request
from src.controllers.inspection_task_controller import (
    dispatch_inspection_task,
    list_inspection_task,
    resolve_location_conflict,
)

router = APIRouter(prefix="/api/inspection-task", tags=["InspectionTask"])
router.get("")(list_inspection_task)


@router.post("/dispatch")
async def dispatch(request: Request):
    payload = await request.json()
    payload.setdefault("operator_role", getattr(request.state, "user", {}).get("role", "admin"))
    return dispatch_inspection_task(payload)


@router.post("/{task_id}/resolve-location")
async def resolve_location(task_id: int, request: Request):
    payload = await request.json()
    payload.setdefault("operator_role", getattr(request.state, "user", {}).get("role", "supervisor"))
    return resolve_location_conflict(task_id, payload)
