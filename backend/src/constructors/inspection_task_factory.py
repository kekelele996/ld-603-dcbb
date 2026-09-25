def create_inspection_task_dto(**overrides):
    row = {
        "id": 1,
        "building_id": 1,
        "inspector_id": 1,
        "plan_date": "2026-06-11T09:00:00Z",
        "task_type": "HYDRANT",
        "status": "IN_PROGRESS",
        "checklist_version": "checklist version 1",
        "finished_at": "2026-06-11T09:00:00Z",
        "device_id": 1,
        "snapshot_building_id": 1,
        "snapshot_floor": "1F",
        "snapshot_location_desc": "东门内消火栓",
        "location_resolution": "NONE",
        "location_resolved_by": None,
        "location_resolved_at": "",
        "location_resolved_note": "",
    }
    row.update(overrides)
    return row
