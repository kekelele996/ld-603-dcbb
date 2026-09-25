from typing import TypedDict


class SubmitResultPayload(TypedDict, total=False):
    task_id: int
    device_id: int
    item_code: str
    result_status: str
    measured_value: str
    photo_url: str
    note: str
    # 巡检员现场提交的检查位置（扫码/手动选择）
    submit_building_id: int
    submit_floor: str
    submit_location_desc: str
    operator_role: str


InspectionResultPayload = dict
SubmitInspectionResultPayload = SubmitResultPayload
