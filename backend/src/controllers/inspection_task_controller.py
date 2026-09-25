from fastapi.responses import JSONResponse

from src.services.inspection_task_service import InspectionTaskService
from src.constants.error_codes import ERROR_CODES
from src.utils.service_error import ServiceError

service = InspectionTaskService()


def _error_response(exc: ServiceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message},
    )


def list_inspection_task():
    return service.list()


def resolve_task_location(task_id: int, payload: dict, actor: dict | None = None):
    # 位置差异裁决是物业主管动作，巡检员无权确认
    if actor and actor.get("role") not in ("admin", "supervisor"):
        return _error_response(ServiceError(ERROR_CODES["RBAC_DENIED"], "role denied", 403))
    payload = dict(payload)
    if actor:
        payload.setdefault("actor_id", actor.get("id", 0))
        payload.setdefault("actor_role", actor.get("role", "supervisor"))
    try:
        return service.resolve_location(task_id, payload)
    except ServiceError as exc:
        return _error_response(exc)
    except Exception as exc:  # pragma: no cover
        return JSONResponse(status_code=500, content={"code": "INTERNAL_ERROR", "message": str(exc)})
