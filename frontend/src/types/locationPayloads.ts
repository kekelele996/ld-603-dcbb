export interface RelocateDevicePayload {
  building_id: number;
  floor: string;
  location_desc: string;
  operator_role?: string;
}

export interface SubmitResultPayload {
  task_id: number;
  device_id?: number;
  item_code: string;
  result_status: string;
  measured_value?: string;
  note?: string;
  submit_building_id: number;
  submit_floor: string;
  submit_location_desc: string;
  operator_role?: string;
}

export interface DispatchTaskPayload {
  device_id: number;
  inspector_id: number;
  plan_date?: string;
  task_type?: string;
  checklist_version?: string;
  operator_role?: string;
}

export interface ResolveLocationPayload {
  resolution: "KEEP_OLD" | "REINSPECT_NEW";
  note?: string;
  operator_role?: string;
}

export interface LocationConflictDetails {
  task_id: number;
  conflict_type: string;
  snapshot: { building_id: number; floor: string; location_desc: string };
  submitted: { building_id: number; floor: string; location_desc: string };
  device_current: { building_id: number; floor: string; location_desc: string };
}
