export interface InspectionTask {
  id: number;
  building_id: number;
  inspector_id: number;
  plan_date: string;
  task_type: string;
  status: string;
  checklist_version: string;
  finished_at: string;
  // 任务下发时锁定的设备位置快照
  device_id?: number;
  snapshot_building_id?: number;
  snapshot_floor: string;
  snapshot_location_desc: string;
  // 换位差异处理状态
  location_resolution: LocationResolution;
  location_resolved_by?: number | null;
  location_resolved_at?: string;
  location_resolved_note?: string;
}

export type LocationResolution =
  | "NONE"
  | "PENDING"
  | "KEEP_ORIGINAL"
  | "REINSPECT_NEW"
  | "SUPERSEDED";
