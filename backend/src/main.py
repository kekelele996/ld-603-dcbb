from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from src.middlewares.auth_middleware import auth_middleware
from src.middlewares.audit_log_middleware import audit_log_middleware
from src.middlewares.error_handler_middleware import to_error_payload
from src.services.errors import DomainError
from src.routes.building_routes import router as building_router
from src.routes.fire_device_routes import router as fire_device_router
from src.routes.inspection_task_routes import router as inspection_task_router
from src.routes.inspection_result_routes import router as inspection_result_router
from src.routes.hazard_ticket_routes import router as hazard_ticket_router

app = FastAPI(title="消防设施巡检维保平台")
app.middleware("http")(auth_middleware)
app.middleware("http")(audit_log_middleware)


@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError):
    # service 抛领域异常，controller/路由层不吞错，统一在这里翻译成错误码响应
    return JSONResponse(status_code=exc.status_code, content=to_error_payload(exc) | {"details": exc.details})


@app.get("/health")
def health():
    return {"status": "ok", "service": "fire-inspect"}


app.include_router(building_router)
app.include_router(fire_device_router)
app.include_router(inspection_task_router)
app.include_router(inspection_result_router)
app.include_router(hazard_ticket_router)
