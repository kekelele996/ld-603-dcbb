export interface InspectionResult {
  id: number;
  task_id: number;
  device_id: number;
  item_code: string;
  result_status: string;
  measured_value: string;
  photo_url: string;
  note: string;
  // 提交时按任务位置快照记录
  building_id?: number;
  floor: string;
  location_desc: string;
  // 重检后旧位置结果作废
  superseded: boolean;
}
