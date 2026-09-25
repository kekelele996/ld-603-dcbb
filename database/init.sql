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
  inspector_id TEXT,
  plan_date TEXT,
  task_type TEXT,
  status TEXT,
  checklist_version TEXT,
  finished_at TEXT,
  -- 任务下发时锁定的设备位置快照（楼栋/楼层/位置）
  device_id TEXT,
  snapshot_building_id TEXT,
  snapshot_floor TEXT,
  snapshot_location_desc TEXT,
  -- NONE / PENDING / KEEP_ORIGINAL / REINSPECT_NEW / SUPERSEDED
  location_resolution TEXT DEFAULT 'NONE',
  location_resolved_by TEXT,
  location_resolved_at TEXT,
  location_resolved_note TEXT
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
  -- 提交时按任务位置快照记录，旧记录能看出检查的是哪一处
  building_id TEXT,
  floor TEXT,
  location_desc TEXT,
  -- 主管要求按新位置重检后，旧位置结果作废
  superseded INTEGER DEFAULT 0
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

-- 设备换位 / 任务迁移 / 提交冲突 / 主管裁决的处理经过，重开页面仍可回溯
CREATE TABLE IF NOT EXISTS location_event (
  id INTEGER PRIMARY KEY,
  device_id TEXT,
  task_id TEXT,
  result_id TEXT,
  event_type TEXT,
  actor_id TEXT,
  actor_role TEXT,
  from_building_id TEXT,
  from_floor TEXT,
  from_location_desc TEXT,
  to_building_id TEXT,
  to_floor TEXT,
  to_location_desc TEXT,
  note TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
