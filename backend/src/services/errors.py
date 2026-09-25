class DomainError(Exception):
    """service 层统一抛出的领域异常，controller 层负责翻译成 HTTP 响应。"""

    code = "VALIDATION_FAILED"
    status_code = 400

    def __init__(self, message: str, *, code: str | None = None, status_code: int | None = None, details=None):
        super().__init__(message)
        if code:
            self.code = code
        if status_code:
            self.status_code = status_code
        self.details = details or {}


class LocationConflictError(DomainError):
    code = "LOCATION_CONFLICT"
    status_code = 409


class ValidationError(DomainError):
    code = "VALIDATION_FAILED"
    status_code = 400


class NotFoundError(DomainError):
    code = "VALIDATION_FAILED"
    status_code = 404


class ConflictStateError(DomainError):
    code = "CONFLICT_ALREADY_RESOLVED"
    status_code = 409
