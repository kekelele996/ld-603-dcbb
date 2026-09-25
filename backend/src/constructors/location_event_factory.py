def create_location_event_dto(**overrides):
    row = {
        "id": 1,
        "device_id": 1,
        "task_id": None,
        "result_id": None,
        "event_type": "DEVICE_RELOCATED",
        "actor_id": 1,
        "actor_role": "admin",
        "from_building_id": None,
        "from_floor": "",
        "from_location_desc": "",
        "to_building_id": None,
        "to_floor": "",
        "to_location_desc": "",
        "note": "",
        "created_at": "2026-06-11T09:00:00Z",
    }
    row.update(overrides)
    return row
