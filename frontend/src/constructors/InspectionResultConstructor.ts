import type { InspectionResult } from "../types/InspectionResult";

export const createDefaultInspectionResult = (overrides: Partial<InspectionResult> = {}): InspectionResult => ({
  id: 1,
  task_id: 1,
  device_id: 1,
  item_code: "HYDRANT_PRESSURE",
  result_status: "NORMAL",
  measured_value: "",
  photo_url: "",
  note: "",
  submit_building_id: 1,
  submit_floor: "1F",
  submit_location_desc: "A 座 1F 东侧楼梯口",
  conflict_flag: false,
  is_superseded: false,
  created_at: "",
  ...overrides
});

export const createInspectionResultForm = createDefaultInspectionResult;
export const createInspectionResultResponse = createDefaultInspectionResult;
