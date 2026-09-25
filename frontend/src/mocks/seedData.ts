export const mockData = {
  "building": [
    {
      "id": 1,
      "name": "1号研发楼",
      "campus": "东区园区",
      "floor_count": 6,
      "fire_grade": "一级",
      "manager_id": 10,
      "address_code": "EAST-A1"
    },
    {
      "id": 2,
      "name": "2号研发楼",
      "campus": "东区园区",
      "floor_count": 8,
      "fire_grade": "一级",
      "manager_id": 11,
      "address_code": "EAST-A2"
    },
    {
      "id": 3,
      "name": "综合楼",
      "campus": "西区园区",
      "floor_count": 4,
      "fire_grade": "二级",
      "manager_id": 12,
      "address_code": "WEST-B1"
    }
  ],
  "fireDevice": [
    {
      "id": 1,
      "building_id": 2,
      "device_code": "HD-0001",
      "device_type": "HYDRANT",
      "floor": "3F",
      "location_desc": "3F 电梯厅西侧消火栓",
      "install_date": "2024-03-11T09:00:00Z",
      "status": "NORMAL",
      "next_maintenance_at": "2026-12-01T09:00:00Z"
    },
    {
      "id": 2,
      "building_id": 1,
      "device_code": "SD-0017",
      "device_type": "SMOKE_DETECTOR",
      "floor": "2F",
      "location_desc": "2F 会议室烟感",
      "install_date": "2024-05-08T09:00:00Z",
      "status": "NORMAL",
      "next_maintenance_at": "2026-11-20T09:00:00Z"
    },
    {
      "id": 3,
      "building_id": 3,
      "device_code": "SP-0103",
      "device_type": "SPRINKLER",
      "floor": "B1",
      "location_desc": "地下车库喷淋分区阀",
      "install_date": "2023-11-02T09:00:00Z",
      "status": "MAINTENANCE",
      "next_maintenance_at": "2026-10-10T09:00:00Z"
    }
  ],
  "inspectionTask": [
    {
      "id": 1,
      "building_id": 1,
      "inspector_id": 20,
      "plan_date": "2026-09-24T02:00:00Z",
      "task_type": "HYDRANT",
      "status": "IN_PROGRESS",
      "checklist_version": "v3.2",
      "finished_at": "",
      "device_id": 1,
      "snapshot_building_id": 1,
      "snapshot_floor": "1F",
      "snapshot_location_desc": "1F 东门内消火栓",
      "location_resolution": "PENDING",
      "location_resolved_by": null,
      "location_resolved_at": "",
      "location_resolved_note": ""
    },
    {
      "id": 2,
      "building_id": 2,
      "inspector_id": 21,
      "plan_date": "2026-09-28T02:00:00Z",
      "task_type": "HYDRANT",
      "status": "PLANNED",
      "checklist_version": "v3.2",
      "finished_at": "",
      "device_id": 1,
      "snapshot_building_id": 2,
      "snapshot_floor": "3F",
      "snapshot_location_desc": "3F 电梯厅西侧消火栓",
      "location_resolution": "NONE",
      "location_resolved_by": null,
      "location_resolved_at": "",
      "location_resolved_note": ""
    },
    {
      "id": 3,
      "building_id": 1,
      "inspector_id": 20,
      "plan_date": "2026-09-20T02:00:00Z",
      "task_type": "SMOKE_DETECTOR",
      "status": "SUBMITTED",
      "checklist_version": "v3.1",
      "finished_at": "2026-09-23T08:30:00Z",
      "device_id": 2,
      "snapshot_building_id": 1,
      "snapshot_floor": "2F",
      "snapshot_location_desc": "2F 会议室烟感",
      "location_resolution": "NONE",
      "location_resolved_by": null,
      "location_resolved_at": "",
      "location_resolved_note": ""
    }
  ],
  "inspectionResult": [
    {
      "id": 1,
      "task_id": 1,
      "device_id": 1,
      "item_code": "PRESSURE",
      "result_status": "SUBMITTED",
      "measured_value": "0.35MPa",
      "photo_url": "/mock/photo_url-1.png",
      "note": "水压正常（旧位置检查）",
      "building_id": 1,
      "floor": "1F",
      "location_desc": "1F 东门内消火栓",
      "superseded": false
    },
    {
      "id": 2,
      "task_id": 3,
      "device_id": 2,
      "item_code": "SMOKE_TEST",
      "result_status": "SUBMITTED",
      "measured_value": "正常报警",
      "photo_url": "/mock/photo_url-2.png",
      "note": "吹烟测试通过",
      "building_id": 1,
      "floor": "2F",
      "location_desc": "2F 会议室烟感",
      "superseded": false
    }
  ],
  "hazardTicket": [
    {
      "id": 1,
      "result_id": 2,
      "severity": "LOW",
      "owner_id": 30,
      "deadline": "2026-10-10T00:00:00Z",
      "rectify_status": "OPEN",
      "rectify_note": "",
      "closed_at": ""
    }
  ],
  "locationEvent": [
    {
      "id": 1,
      "device_id": 1,
      "task_id": null,
      "result_id": null,
      "event_type": "DEVICE_RELOCATED",
      "actor_id": 10,
      "actor_role": "admin",
      "from_building_id": 1,
      "from_floor": "1F",
      "from_location_desc": "1F 东门内消火栓",
      "to_building_id": 2,
      "to_floor": "3F",
      "to_location_desc": "3F 电梯厅西侧消火栓",
      "note": "楼层装修，消火栓移位",
      "created_at": "2026-09-24T06:10:00Z"
    },
    {
      "id": 2,
      "device_id": 1,
      "task_id": 1,
      "result_id": null,
      "event_type": "TASK_CONFLICTED",
      "actor_id": 10,
      "actor_role": "admin",
      "from_building_id": 1,
      "from_floor": "1F",
      "from_location_desc": "1F 东门内消火栓",
      "to_building_id": 2,
      "to_floor": "3F",
      "to_location_desc": "3F 电梯厅西侧消火栓",
      "note": "",
      "created_at": "2026-09-24T06:10:00Z"
    },
    {
      "id": 3,
      "device_id": 1,
      "task_id": 2,
      "result_id": null,
      "event_type": "TASK_MIGRATED",
      "actor_id": 10,
      "actor_role": "admin",
      "from_building_id": 1,
      "from_floor": "1F",
      "from_location_desc": "1F 东门内消火栓",
      "to_building_id": 2,
      "to_floor": "3F",
      "to_location_desc": "3F 电梯厅西侧消火栓",
      "note": "",
      "created_at": "2026-09-24T06:10:00Z"
    }
  ]
} as const;
