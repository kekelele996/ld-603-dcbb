from src.seed import seed
class InspectionResultRepository:
    def find_all(self):
        return seed["inspectionResult"]

    def find_by_id(self, result_id):
        return next((row for row in seed["inspectionResult"] if row["id"] == result_id), None)

    def find_active_by_task(self, task_id):
        return [row for row in seed["inspectionResult"]
                if row["task_id"] == task_id and not row.get("superseded")]

    def add(self, row):
        seed["inspectionResult"].append(row)
        return row

    def next_id(self):
        return max((row["id"] for row in seed["inspectionResult"]), default=0) + 1

    def supersede_task_results(self, task_id):
        changed = []
        for row in seed["inspectionResult"]:
            if row["task_id"] == task_id and not row.get("superseded"):
                row["superseded"] = True
                changed.append(row)
        return changed
