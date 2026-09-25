export interface InspectionResult {
  id: number;
  task_id: number;
  device_id: number;
  item_code: string;
  result_status: string;
  measured_value: string;
  photo_url: string;
  note: string;
  // 巡检员现场实际提交的检查位置
  submit_building_id: number;
  submit_floor: string;
  submit_location_desc: string;
  conflict_flag: boolean;
  // 主管要求按新位置重检后，旧位置结果作废但保留
  is_superseded: boolean;
  created_at: string;
}
