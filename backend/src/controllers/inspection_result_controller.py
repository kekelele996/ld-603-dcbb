from src.constants.log_templates import LOG_TEMPLATES
from src.middlewares.rbac_middleware import RESULT_SUBMIT_ROLES, require_role
from src.services.inspection_result_service import InspectionResultService

service = InspectionResultService()


def list_inspection_result():
    return service.list()


def submit_inspection_result(payload: dict):
    require_role(payload.get("operator_role", "inspector"), RESULT_SUBMIT_ROLES)
    row = service.submit(payload)
    print("audit", LOG_TEMPLATES["InspectionResult"][5], "result", row["id"], "task", row["task_id"])
    return row
