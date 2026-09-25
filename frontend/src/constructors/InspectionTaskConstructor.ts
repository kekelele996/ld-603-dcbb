import type { InspectionTask } from "../types/InspectionTask";
import type { TaskLocationHistoryItem } from "../types/InspectionTask";

export const createTaskLocationHistoryItem = (overrides: Partial<TaskLocationHistoryItem> = {}): TaskLocationHistoryItem => ({
  at: "",
  action: "",
  detail: "",
  operator_role: "",
  ...overrides
});

export const createDefaultInspectionTask = (overrides: Partial<InspectionTask> = {}): InspectionTask => ({
  id: 1,
  building_id: 1,
  device_id: 1,
  inspector_id: 1,
  plan_date: "2026-09-20T09:00:00Z",
  task_type: "HYDRANT",
  status: "PLANNED",
  checklist_version: "v2.1",
  finished_at: "",
  snapshot_building_id: 1,
  snapshot_floor: "1F",
  snapshot_location_desc: "A 座 1F 东侧楼梯口",
  current_building_id: 1,
  current_floor: "1F",
  current_location_desc: "A 座 1F 东侧楼梯口",
  location_state: "SYNCED",
  location_conflict_type: "NONE",
  location_resolution: "",
  location_resolved_by: "",
  location_resolved_at: "",
  location_resolution_note: "",
  moved_at: "",
  conflict_at: "",
  history: [],
  ...overrides
});

export const createInspectionTaskForm = createDefaultInspectionTask;
export const createInspectionTaskResponse = createDefaultInspectionTask;
