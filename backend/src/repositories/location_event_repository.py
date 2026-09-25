from src.seed import seed
class LocationEventRepository:
    def find_all(self):
        return seed["locationEvent"]

    def find_by_device(self, device_id):
        return [row for row in seed["locationEvent"] if row["device_id"] == device_id]

    def find_by_task(self, task_id):
        return [row for row in seed["locationEvent"] if row.get("task_id") == task_id]

    def add(self, row):
        seed["locationEvent"].append(row)
        return row

    def next_id(self):
        return max((row["id"] for row in seed["locationEvent"]), default=0) + 1
