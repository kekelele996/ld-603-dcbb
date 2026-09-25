import type { InspectionResult } from "../types/InspectionResult";

export const createDefaultInspectionResult = (overrides: Partial<InspectionResult> = {}): InspectionResult => ({
  id: 1 as never,
  task_id: 1 as never,
  device_id: 1 as never,
  item_code: "PRESSURE" as never,
  result_status: "SUBMITTED" as never,
  measured_value: "0.35MPa" as never,
  photo_url: "/mock/photo_url-1.png" as never,
  note: "" as never,
  building_id: 1,
  floor: "1F",
  location_desc: "1F 东门内消火栓",
  superseded: false,
  ...overrides
});

export const createInspectionResultForm = createDefaultInspectionResult;
export const createInspectionResultResponse = createDefaultInspectionResult;
