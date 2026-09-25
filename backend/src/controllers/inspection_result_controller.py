from fastapi.responses import JSONResponse

from src.services.inspection_result_service import InspectionResultService
from src.utils.service_error import ServiceError

service = InspectionResultService()


def list_inspection_result():
    return service.list()


def submit_inspection_result(payload: dict, actor: dict | None = None):
    payload = dict(payload)
    if actor:
        payload.setdefault("actor_id", actor.get("id", 0))
        payload.setdefault("actor_role", actor.get("role", "inspector"))
    try:
        return service.submit(payload)
    except ServiceError as exc:
        # 位置冲突在此返回 409 + LOCATION_CONFLICT，前端据此提示而不是写入新位置
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "message": exc.message},
        )
    except Exception as exc:  # pragma: no cover
        return JSONResponse(status_code=500, content={"code": "INTERNAL_ERROR", "message": str(exc)})
