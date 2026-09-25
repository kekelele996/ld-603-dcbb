class ServiceError(Exception):
    """service 层业务异常，controller 必须再次包装后返回错误码。"""

    def __init__(self, code: str, message: str, status_code: int = 409):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
