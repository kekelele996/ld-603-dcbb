def create_inspection_task_dto(**overrides):
    row = {
        "id": 1,
        "building_id": 1,
        "device_id": 1,
        "inspector_id": 1,
        "plan_date": "2026-09-20T09:00:00Z",
        "task_type": "HYDRANT",
        "status": "PLANNED",
        "checklist_version": "v1.0",
        "finished_at": "",
        # 任务下发时保存的位置快照
        "snapshot_building_id": 1,
        "snapshot_floor": "1F",
        "snapshot_location_desc": "A 座东侧楼梯口",
        "current_building_id": 1,
        "current_floor": "1F",
        "current_location_desc": "A 座东侧楼梯口",
        "location_state": "SYNCED",
        "location_conflict_type": "NONE",
        "location_resolution": "",
        "location_resolved_by": "",
        "location_resolved_at": "",
        "location_resolution_note": "",
        "moved_at": "",
        "conflict_at": "",
        "history": [],
    }
    row.update(overrides)
    return row


def create_task_dispatch_form(**overrides):
    form = {
        "device_id": 1,
        "building_id": 1,
        "inspector_id": 1,
        "plan_date": "2026-09-20T09:00:00Z",
        "task_type": "HYDRANT",
        "checklist_version": "v1.0",
    }
    form.update(overrides)
    return form


def create_task_history_item(**overrides):
    item = {"at": "", "action": "", "detail": "", "operator_role": ""}
    item.update(overrides)
    return item
