from src.constants.error_codes import ERROR_CODES
from src.services.errors import ValidationError

# 平台角色：巡检员 / 维保商 / 物业主管 / 系统管理员 / 审计员
ROLE_INSPECTOR = "inspector"
ROLE_VENDOR = "vendor"
ROLE_SUPERVISOR = "supervisor"
ROLE_ADMIN = "admin"
ROLE_AUDITOR = "auditor"

ALL_ROLES = {ROLE_INSPECTOR, ROLE_VENDOR, ROLE_SUPERVISOR, ROLE_ADMIN, ROLE_AUDITOR}

# 主管确认原位置有效 / 要求按新位置重检；管理员可代行
LOCATION_CONFLICT_ROLES = {ROLE_SUPERVISOR, ROLE_ADMIN}
# 管理员修改设备位置
DEVICE_MANAGE_ROLES = {ROLE_ADMIN}
# 巡检员提交巡检结果
RESULT_SUBMIT_ROLES = {ROLE_INSPECTOR, ROLE_SUPERVISOR, ROLE_ADMIN}


def require_role(role, allowed):
    if role not in allowed:
        raise ValidationError(
            ERROR_CODES["RBAC_DENIED"] + f": role={role}",
            code=ERROR_CODES["RBAC_DENIED"],
            status_code=403,
        )


def allow_roles(*roles):
    """保留旧的装饰式写法：返回一个角色集合判定函数。"""
    allowed = set(roles) or ALL_ROLES

    def checker(role):
        return role in allowed

    return checker
