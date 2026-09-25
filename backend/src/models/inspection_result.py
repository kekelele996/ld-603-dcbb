from pydantic import BaseModel


class InspectionResult(BaseModel):
    id: int | float
    task_id: int | float
    device_id: int | float
    item_code: str
    result_status: str
    measured_value: str
    photo_url: str
    note: str
    # 巡检员现场实际提交的位置；用于和任务下发时的位置快照比对
    submit_building_id: int | float = 0
    submit_floor: str = ""
    submit_location_desc: str = ""
    conflict_flag: bool = False
    # REINSPECT_NEW 后旧结果作废；CONFIRMED_OLD 后旧结果保持有效
    is_superseded: bool = False
    created_at: str = ""
