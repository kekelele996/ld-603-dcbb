from src.seed import seed
class InspectionTaskRepository:
    def find_all(self):
        return seed["inspectionTask"]

    def find_by_id(self, task_id):
        return next((row for row in seed["inspectionTask"] if row["id"] == task_id), None)

    def find_by_device(self, device_id):
        return [row for row in seed["inspectionTask"] if row.get("device_id") == device_id]

    def migrate_snapshot(self, task, building_id, floor, location_desc):
        # 未开始的任务直接跟随设备换到新位置
        task["snapshot_building_id"] = building_id
        task["snapshot_floor"] = floor
        task["snapshot_location_desc"] = location_desc
        task["building_id"] = building_id
        return task

    def mark_pending(self, task):
        task["location_resolution"] = "PENDING"
        return task

    def update(self, task, **changes):
        task.update(changes)
        return task
