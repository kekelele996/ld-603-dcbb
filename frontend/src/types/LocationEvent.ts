export type LocationEventType =
  | "DEVICE_RELOCATED"
  | "TASK_MIGRATED"
  | "TASK_CONFLICTED"
  | "TASK_ARCHIVED"
  | "RESULT_CONFLICT"
  | "RESULT_SUPERSEDED"
  | "RESULT_RESUBMITTED"
  | "RESOLUTION_KEEP"
  | "RESOLUTION_REINSPECT";

export interface LocationEvent {
  id: number;
  device_id: number;
  task_id?: number | null;
  result_id?: number | null;
  event_type: LocationEventType | string;
  actor_id: number;
  actor_role: string;
  from_building_id?: number | null;
  from_floor?: string;
  from_location_desc?: string;
  to_building_id?: number | null;
  to_floor?: string;
  to_location_desc?: string;
  note?: string;
  created_at: string;
}
