from typing import List, Optional

from pydantic import BaseModel


class TaskLocationHistoryItem(BaseModel):
    at: str
    action: str
    detail: str
    operator_role: str


class InspectionTask(BaseModel):
    id: int | float
    building_id: int | float
    device_id: int | float
    inspector_id: int | float
    plan_date: str
    task_type: str
    status: str
    checklist_version: str
    finished_at: str
    # 任务下发时保存的设备位置快照：楼栋 / 楼层 / 具体位置
    snapshot_building_id: int | float
    snapshot_floor: str
    snapshot_location_desc: str
    # 设备换位后的新位置（与快照相同则为空）
    current_building_id: Optional[int | float] = None
    current_floor: str = ""
    current_location_desc: str = ""
    # 位置差异、冲突与主管处置状态
    location_state: str = "SYNCED"
    location_conflict_type: str = "NONE"
    location_resolution: str = ""
    location_resolved_by: str = ""
    location_resolved_at: str = ""
    location_resolution_note: str = ""
    moved_at: str = ""
    conflict_at: str = ""
    history: List[TaskLocationHistoryItem] = []
