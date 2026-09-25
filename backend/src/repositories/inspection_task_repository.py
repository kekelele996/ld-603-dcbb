from src.seed import seed


class InspectionTaskRepository:
    def find_all(self):
        return seed["inspectionTask"]

    def find_by_id(self, task_id):
        for row in seed["inspectionTask"]:
            if str(row["id"]) == str(task_id):
                return row
        return None

    def add(self, row):
        row["id"] = max((int(item["id"]) for item in seed["inspectionTask"]), default=0) + 1
        seed["inspectionTask"].append(row)
        return row

    def find_results(self, task_id):
        return [row for row in seed["inspectionResult"] if str(row.get("task_id")) == str(task_id)]
