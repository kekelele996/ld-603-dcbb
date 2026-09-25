from src.constants.log_templates import LOG_TEMPLATES
from src.middlewares.rbac_middleware import DEVICE_MANAGE_ROLES, require_role
from src.services.fire_device_service import FireDeviceService

service = FireDeviceService()


def list_fire_device():
    return service.list()


def relocate_fire_device(device_id: int, payload: dict):
    require_role(payload.get("operator_role", "admin"), DEVICE_MANAGE_ROLES)
    result = service.relocate(device_id, payload)
    print("audit", LOG_TEMPLATES["FireDevice"][4], "device", device_id, "tasks", len(result["tasks"]))
    return result
