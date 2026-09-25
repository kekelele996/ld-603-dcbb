from pydantic import BaseModel
class InspectionTask(BaseModel):
    id: int | float
    building_id: int | float
    inspector_id: int | float
    plan_date: str
    task_type: str
    status: str
    checklist_version: str
    finished_at: str
    # 任务下发时锁定的设备与位置快照（楼栋/楼层/位置），设备换位后作为巡检与裁决依据
    device_id: int | float | None = None
    snapshot_building_id: int | float | None = None
    snapshot_floor: str = ""
    snapshot_location_desc: str = ""
    # 换位差异处理状态：NONE / PENDING / KEEP_ORIGINAL / REINSPECT_NEW / SUPERSEDED
    location_resolution: str = "NONE"
    location_resolved_by: int | float | None = None
    location_resolved_at: str = ""
    location_resolved_note: str = ""
