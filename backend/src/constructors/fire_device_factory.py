def create_fire_device_dto(**overrides):
    row = {"id": 1, "building_id": 1, "device_code": "HYD-001", "device_type": "HYDRANT", "floor": "1F", "location_desc": "A 座东侧楼梯口", "install_date": "2025-01-10", "status": "IN_SERVICE", "next_maintenance_at": "2026-12-01"}
    row.update(overrides)
    return row


def create_device_relocate_form(**overrides):
    form = {"building_id": 1, "floor": "1F", "location_desc": "A 座东侧楼梯口"}
    form.update(overrides)
    return form
