import type { LocationState } from "../constants/LocationState";
import type { LocationConflictType, LocationResolution } from "../constants/LocationConflict";

export interface TaskLocationHistoryItem {
  at: string;
  action: string;
  detail: string;
  operator_role: string;
}

export interface InspectionTask {
  id: number;
  building_id: number;
  device_id: number;
  inspector_id: number;
  plan_date: string;
  task_type: string;
  status: string;
  checklist_version: string;
  finished_at: string;
  // 任务下发时保存的位置快照
  snapshot_building_id: number;
  snapshot_floor: string;
  snapshot_location_desc: string;
  // 设备当前位置（台账新位置）
  current_building_id?: number;
  current_floor: string;
  current_location_desc: string;
  location_state: LocationState;
  location_conflict_type: LocationConflictType;
  location_resolution: "" | LocationResolution;
  location_resolved_by: string;
  location_resolved_at: string;
  location_resolution_note: string;
  moved_at: string;
  conflict_at: string;
  history: TaskLocationHistoryItem[];
}
