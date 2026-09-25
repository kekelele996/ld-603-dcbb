from fastapi import APIRouter, Request
from src.controllers.fire_device_controller import list_fire_device, relocate_fire_device

router = APIRouter(prefix="/api/fire-device", tags=["FireDevice"])
router.get("")(list_fire_device)


@router.patch("/{device_id}/relocate")
async def relocate(device_id: int, request: Request):
    payload = await request.json()
    payload.setdefault("operator_role", getattr(request.state, "user", {}).get("role", "admin"))
    return relocate_fire_device(device_id, payload)
