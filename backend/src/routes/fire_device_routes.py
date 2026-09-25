from fastapi import APIRouter, Request
from src.controllers.fire_device_controller import list_fire_device, relocate_fire_device
router = APIRouter(prefix="/api/fire-device", tags=["FireDevice"])
router.get("")(list_fire_device)


@router.patch("/{device_id}/relocation")
async def relocate(device_id: int, payload: dict, request: Request):
    # 管理员改位置：未开始任务迁到新位置，进行中/待复核保留旧位置并标出差异
    return relocate_fire_device(device_id, payload, getattr(request.state, "user", None))
