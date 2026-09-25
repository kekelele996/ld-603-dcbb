from fastapi.responses import JSONResponse

from src.services.fire_device_service import FireDeviceService
from src.constants.error_codes import ERROR_CODES
from src.utils.service_error import ServiceError

service = FireDeviceService()


def _error_response(exc: ServiceError):
    # controller 层统一把 service 业务异常翻译成 HTTP 错误码
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message},
    )


def list_fire_device():
    return service.list()


def relocate_fire_device(device_id: int, payload: dict, actor: dict | None = None):
    # 仅管理员/主管可以改设备位置；鉴权中间件解析出的操作人在这里补进 payload
    if actor and actor.get("role") not in ("admin", "supervisor"):
        return _error_response(ServiceError(ERROR_CODES["RBAC_DENIED"], "role denied", 403))
    payload = dict(payload)
    if actor:
        payload.setdefault("actor_id", actor.get("id", 0))
        payload.setdefault("actor_role", actor.get("role", "admin"))
    try:
        return service.relocate(device_id, payload)
    except ServiceError as exc:
        return _error_response(exc)
    except Exception as exc:  # pragma: no cover - controller 兜底，禁止静默吞掉
        return JSONResponse(status_code=500, content={"code": "INTERNAL_ERROR", "message": str(exc)})
