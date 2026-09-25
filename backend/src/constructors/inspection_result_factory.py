def create_inspection_result_dto(**overrides):
    row = {
        "id": 1,
        "task_id": 1,
        "device_id": 1,
        "item_code": "PRESSURE",
        "result_status": "NORMAL",
        "measured_value": "1.2MPa",
        "photo_url": "/mock/photo_url-1.png",
        "note": "",
        "submit_building_id": 1,
        "submit_floor": "1F",
        "submit_location_desc": "A 座东侧楼梯口",
        "conflict_flag": False,
        "is_superseded": False,
        "created_at": "",
    }
    row.update(overrides)
    return row


def create_result_submit_form(**overrides):
    form = {
        "task_id": 1,
        "device_id": 1,
        "item_code": "PRESSURE",
        "result_status": "NORMAL",
        "measured_value": "",
        "photo_url": "",
        "note": "",
        "submit_building_id": 1,
        "submit_floor": "1F",
        "submit_location_desc": "A 座东侧楼梯口",
    }
    form.update(overrides)
    return form
