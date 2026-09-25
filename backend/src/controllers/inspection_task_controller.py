from src.constants.log_templates import LOG_TEMPLATES
from src.middlewares.rbac_middleware import (
    DEVICE_MANAGE_ROLES,
    LOCATION_CONFLICT_ROLES,
    require_role,
)
from src.services.inspection_task_service import InspectionTaskService

service = InspectionTaskService()


def list_inspection_task():
    return service.list()


def dispatch_inspection_task(payload: dict):
    require_role(payload.get("operator_role", "admin"), DEVICE_MANAGE_ROLES | LOCATION_CONFLICT_ROLES)
    row = service.dispatch(payload)
    print("audit", LOG_TEMPLATES["InspectionTask"][4], "task", row["id"])
    return row


def resolve_location_conflict(task_id: int, payload: dict):
    require_role(payload.get("operator_role", "supervisor"), LOCATION_CONFLICT_ROLES)
    row = service.resolve_location_conflict(task_id, payload)
    template = LOG_TEMPLATES["InspectionTask"][6 if row["location_resolution"] == "KEEP_OLD" else 7]
    print("audit", template, "task", task_id, "by", payload.get("operator_role"))
    return row
