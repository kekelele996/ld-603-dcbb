from src.seed import seed


class FireDeviceRepository:
    def find_all(self):
        return seed["fireDevice"]

    def find_by_id(self, device_id):
        for row in seed["fireDevice"]:
            if str(row["id"]) == str(device_id):
                return row
        return None

    def update_location(self, device, building_id, floor, location_desc):
        device["building_id"] = building_id
        device["floor"] = floor
        device["location_desc"] = location_desc
        return device

    def find_tasks(self, device_id):
        return [row for row in seed["inspectionTask"] if str(row.get("device_id")) == str(device_id)]
