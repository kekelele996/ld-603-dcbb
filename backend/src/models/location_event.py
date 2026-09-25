from pydantic import BaseModel
class LocationEvent(BaseModel):
    id: int | float
    # 时间线可按设备或任务回溯，重开页面仍能看到完整处理经过
    device_id: int | float
    task_id: int | float | None = None
    result_id: int | float | None = None
    event_type: str
    actor_id: int | float
    actor_role: str = ""
    # 事件发生时的旧位置与新位置快照
    from_building_id: int | float | None = None
    from_floor: str = ""
    from_location_desc: str = ""
    to_building_id: int | float | None = None
    to_floor: str = ""
    to_location_desc: str = ""
    note: str = ""
    created_at: str = ""
