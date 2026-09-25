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
    # 提交时按任务位置快照记录，旧记录因此能看出检查的是哪一处
    building_id: int | float | None = None
    floor: str = ""
    location_desc: str = ""
    # REINSPECT_NEW 重检后，旧位置结果标记作废，不再进入新台账
    superseded: bool = False
