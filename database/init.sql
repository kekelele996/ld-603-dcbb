CREATE TABLE IF NOT EXISTS building (
  id INTEGER PRIMARY KEY,
  name TEXT,
  campus TEXT,
  floor_count TEXT,
  fire_grade TEXT,
  manager_id TEXT,
  address_code TEXT
);

CREATE TABLE IF NOT EXISTS fire_device (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  device_code TEXT,
  device_type TEXT,
  floor TEXT,
  location_desc TEXT,
  install_date TEXT,
  status TEXT,
  next_maintenance_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_task (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  device_id TEXT,
  inspector_id TEXT,
  plan_date TEXT,
  task_type TEXT,
  status TEXT,
  checklist_version TEXT,
  finished_at TEXT,
  -- 任务下发时保存的位置快照：楼栋 / 楼层 / 具体位置
  snapshot_building_id TEXT,
  snapshot_floor TEXT,
  snapshot_location_desc TEXT,
  -- 设备换位后的新位置
  current_building_id TEXT,
  current_floor TEXT,
  current_location_desc TEXT,
  -- 位置差异、冲突与主管处置状态
  location_state TEXT,                  -- SYNCED / MOVED_PENDING / DIVERGED / CONFLICT / CONFIRMED_OLD / REINSPECT_NEW
  location_conflict_type TEXT,          -- NONE / BUILDING_MISMATCH / FLOOR_MISMATCH / LOCATION_MISMATCH / MOVED_DEVICE
  location_resolution TEXT,             -- KEEP_OLD / REINSPECT_NEW
  location_resolved_by TEXT,
  location_resolved_at TEXT,
  location_resolution_note TEXT,
  moved_at TEXT,
  conflict_at TEXT
);

-- 任务位置处理经过：换位、拦截、主管确认/重检、重提全程留痕，重开页面仍可追溯
CREATE TABLE IF NOT EXISTS task_location_history (
  id INTEGER PRIMARY KEY,
  task_id TEXT,
  action TEXT,
  detail TEXT,
  operator_role TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_result (
  id INTEGER PRIMARY KEY,
  task_id TEXT,
  device_id TEXT,
  item_code TEXT,
  result_status TEXT,
  measured_value TEXT,
  photo_url TEXT,
  note TEXT,
  -- 巡检员现场实际提交的位置；与任务快照不一致会被拦截
  submit_building_id TEXT,
  submit_floor TEXT,
  submit_location_desc TEXT,
  conflict_flag INTEGER DEFAULT 0,
  -- 主管要求按新位置重检后，旧位置结果作废但保留记录
  is_superseded INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS hazard_ticket (
  id INTEGER PRIMARY KEY,
  result_id TEXT,
  severity TEXT,
  owner_id TEXT,
  deadline TEXT,
  rectify_status TEXT,
  rectify_note TEXT,
  closed_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
