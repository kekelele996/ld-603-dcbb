from typing import TypedDict


class DispatchTaskPayload(TypedDict, total=False):
    device_id: int
    building_id: int
    inspector_id: int
    plan_date: str
    task_type: str
    checklist_version: str
    operator_role: str


class ResolveLocationPayload(TypedDict, total=False):
    resolution: str  # KEEP_OLD / REINSPECT_NEW
    note: str
    operator_role: str


InspectionTaskPayload = dict
DispatchInspectionTaskPayload = DispatchTaskPayload
ResolveLocationConflictPayload = ResolveLocationPayload
