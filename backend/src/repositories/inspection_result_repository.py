from src.seed import seed


class InspectionResultRepository:
    def find_all(self):
        return seed["inspectionResult"]

    def find_by_id(self, result_id):
        for row in seed["inspectionResult"]:
            if str(row["id"]) == str(result_id):
                return row
        return None

    def add(self, row):
        row["id"] = max((int(item["id"]) for item in seed["inspectionResult"]), default=0) + 1
        seed["inspectionResult"].append(row)
        return row

    def supersede_task_results(self, task_id):
        """REINSPECT_NEW：旧位置结果全部作废，保留记录可追溯。"""
        changed = []
        for row in seed["inspectionResult"]:
            if str(row.get("task_id")) == str(task_id) and not row.get("is_superseded"):
                row["is_superseded"] = True
                row["conflict_flag"] = True
                changed.append(row)
        return changed
