import type { InspectionTask } from "../types/InspectionTask";

export const createDefaultInspectionTask = (overrides: Partial<InspectionTask> = {}): InspectionTask => ({
  id: 1 as never,
  building_id: 1 as never,
  inspector_id: 1 as never,
  plan_date: "2026-09-24T02:00:00Z" as never,
  task_type: "HYDRANT" as never,
  status: "IN_PROGRESS" as never,
  checklist_version: "v3.2" as never,
  finished_at: "" as never,
  device_id: 1,
  snapshot_building_id: 1,
  snapshot_floor: "1F",
  snapshot_location_desc: "1F 东门内消火栓",
  location_resolution: "NONE",
  location_resolved_by: null,
  location_resolved_at: "",
  location_resolved_note: "",
  ...overrides
});

export const createInspectionTaskForm = createDefaultInspectionTask;
export const createInspectionTaskResponse = createDefaultInspectionTask;
