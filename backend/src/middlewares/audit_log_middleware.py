from src.seed import seed
from src.utils.clock import now_iso

# 写操作统一记录审计日志：巡检提交、隐患派单、复验关闭，以及设备换位/位置冲突处置
WRITE_METHODS = {"POST", "PATCH", "PUT", "DELETE"}


async def audit_log_middleware(request, call_next):
    response = await call_next(request)
    if request.method in WRITE_METHODS and request.url.path.startswith("/api") and response.status_code < 400:
        user = getattr(request.state, "user", {}) or {}
        entry = {
            "actor": user.get("role", "anonymous"),
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "created_at": now_iso(),
        }
        seed.setdefault("auditLog", []).append(entry)
        print("audit", entry["actor"], entry["method"], entry["path"])
    return response
