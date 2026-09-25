import type { Building } from "../types/Building";
import type { FireDevice } from "../types/FireDevice";
import type { InspectionResult } from "../types/InspectionResult";
import type { InspectionTask } from "../types/InspectionTask";

// 前端离线 mock：结构与后端 seed 保持一致，api 层在后端不可达时兜底
export const mockData: {
  building: Building[];
  fireDevice: FireDevice[];
  inspectionTask: InspectionTask[];
  inspectionResult: InspectionResult[];
  hazardTicket: Array<Record<string, unknown>>;
} = {
  building: [
    { id: 1, name: "A 座研发楼", campus: "东湖科技园", floor_count: 6, fire_grade: "一级", manager_id: 1, address_code: "DH-A" },
    { id: 2, name: "B 座综合楼", campus: "东湖科技园", floor_count: 4, fire_grade: "二级", manager_id: 2, address_code: "DH-B" },
    { id: 3, name: "C 座仓储楼", campus: "东湖科技园", floor_count: 2, fire_grade: "二级", manager_id: 3, address_code: "DH-C" }
  ],
  fireDevice: [
    { id: 1, building_id: 1, device_code: "HYD-001", device_type: "HYDRANT", floor: "3F", location_desc: "A 座 3F 西侧走廊", install_date: "2025-01-10", status: "IN_SERVICE", next_maintenance_at: "2026-12-01" },
    { id: 2, building_id: 1, device_code: "SDET-002", device_type: "SMOKE_DETECTOR", floor: "2F", location_desc: "A 座 2F 配电间旁", install_date: "2025-03-22", status: "IN_SERVICE", next_maintenance_at: "2026-11-15" },
    { id: 3, building_id: 2, device_code: "SPR-003", device_type: "SPRINKLER", floor: "1F", location_desc: "B 座 1F 车库入口", install_date: "2025-05-08", status: "IN_SERVICE", next_maintenance_at: "2027-01-20" },
    { id: 4, building_id: 1, device_code: "EXT-004", device_type: "EXIT_LIGHT", floor: "2F", location_desc: "A 座 2F 东侧安全出口", install_date: "2024-11-30", status: "IN_SERVICE", next_maintenance_at: "2026-10-30" },
    { id: 5, building_id: 2, device_code: "HYD-005", device_type: "HYDRANT", floor: "2F", location_desc: "B 座 2F 会议区茶水间旁", install_date: "2025-02-14", status: "IN_SERVICE", next_maintenance_at: "2026-12-05" }
  ],
  inspectionTask: [
    {
      id: 1, building_id: 1, device_id: 1, inspector_id: 1,
      plan_date: "2026-09-24T09:00:00Z", task_type: "HYDRANT", status: "IN_PROGRESS",
      checklist_version: "v2.1", finished_at: "",
      snapshot_building_id: 1, snapshot_floor: "1F", snapshot_location_desc: "A 座 1F 东侧楼梯口",
      current_building_id: 1, current_floor: "3F", current_location_desc: "A 座 3F 西侧走廊",
      location_state: "CONFLICT", location_conflict_type: "MOVED_DEVICE",
      location_resolution: "", location_resolved_by: "", location_resolved_at: "", location_resolution_note: "",
      moved_at: "2026-09-22T10:30:00Z", conflict_at: "2026-09-25T08:50:00Z",
      history: [
        { at: "2026-09-20T14:00:00Z", action: "任务下发", detail: "下发位置：A 座研发楼 1F / A 座 1F 东侧楼梯口", operator_role: "admin" },
        { at: "2026-09-22T10:30:00Z", action: "设备换位", detail: "设备 HYD-001 改到 A 座研发楼 3F / A 座 3F 西侧走廊；任务进行中，保留旧位置并标出差异", operator_role: "admin" },
        { at: "2026-09-25T08:50:00Z", action: "提交被拦截", detail: "巡检员在设备新位置 3F 提交，与任务位置 1F 不一致，结果未写入，等待主管处理", operator_role: "inspector" }
      ]
    },
    {
      id: 2, building_id: 1, device_id: 1, inspector_id: 2,
      plan_date: "2026-09-28T09:00:00Z", task_type: "HYDRANT", status: "PLANNED",
      checklist_version: "v2.1", finished_at: "",
      snapshot_building_id: 1, snapshot_floor: "3F", snapshot_location_desc: "A 座 3F 西侧走廊",
      current_building_id: 1, current_floor: "3F", current_location_desc: "A 座 3F 西侧走廊",
      location_state: "MOVED_PENDING", location_conflict_type: "NONE",
      location_resolution: "", location_resolved_by: "", location_resolved_at: "", location_resolution_note: "",
      moved_at: "2026-09-22T10:30:00Z", conflict_at: "",
      history: [
        { at: "2026-09-18T14:00:00Z", action: "任务下发", detail: "下发位置：A 座研发楼 1F / A 座 1F 东侧楼梯口", operator_role: "admin" },
        { at: "2026-09-22T10:30:00Z", action: "设备换位", detail: "任务尚未开始，自动改派到新位置：A 座研发楼 3F / A 座 3F 西侧走廊", operator_role: "admin" }
      ]
    },
    {
      id: 3, building_id: 1, device_id: 2, inspector_id: 1,
      plan_date: "2026-09-23T09:00:00Z", task_type: "SMOKE_DETECTOR", status: "REVIEWED",
      checklist_version: "v2.1", finished_at: "2026-09-23T10:05:00Z",
      snapshot_building_id: 1, snapshot_floor: "2F", snapshot_location_desc: "A 座 2F 配电间旁",
      current_building_id: 1, current_floor: "2F", current_location_desc: "A 座 2F 配电间旁",
      location_state: "SYNCED", location_conflict_type: "NONE",
      location_resolution: "", location_resolved_by: "", location_resolved_at: "", location_resolution_note: "",
      moved_at: "", conflict_at: "",
      history: [
        { at: "2026-09-16T14:00:00Z", action: "任务下发", detail: "下发位置：A 座研发楼 2F / A 座 2F 配电间旁", operator_role: "admin" }
      ]
    },
    {
      id: 4, building_id: 1, device_id: 4, inspector_id: 3,
      plan_date: "2026-09-21T09:00:00Z", task_type: "EXIT_LIGHT", status: "REVIEWED",
      checklist_version: "v2.1", finished_at: "2026-09-24T16:00:00Z",
      snapshot_building_id: 1, snapshot_floor: "1F", snapshot_location_desc: "A 座 1F 东侧安全出口",
      current_building_id: 1, current_floor: "2F", current_location_desc: "A 座 2F 东侧安全出口",
      location_state: "CONFIRMED_OLD", location_conflict_type: "MOVED_DEVICE",
      location_resolution: "KEEP_OLD", location_resolved_by: "supervisor", location_resolved_at: "2026-09-24T15:30:00Z",
      location_resolution_note: "经现场核实，检查时指示灯确实安装在 1F 旧位置，原位置结果有效，台账另行记录 2F 新装设备。",
      moved_at: "2026-09-23T11:00:00Z", conflict_at: "2026-09-24T09:10:00Z",
      history: [
        { at: "2026-09-15T14:00:00Z", action: "任务下发", detail: "下发位置：A 座研发楼 1F / A 座 1F 东侧安全出口", operator_role: "admin" },
        { at: "2026-09-23T11:00:00Z", action: "设备换位", detail: "设备 EXT-004 改到 A 座研发楼 2F / A 座 2F 东侧安全出口；任务待复核，保留旧位置并标出差异", operator_role: "admin" },
        { at: "2026-09-24T09:10:00Z", action: "提交被拦截", detail: "提交位置 2F 与任务位置 1F 不一致，结果未写入，等待主管处理", operator_role: "inspector" },
        { at: "2026-09-24T15:30:00Z", action: "主管确认原位置有效", detail: "维持任务旧位置 1F；巡检员按旧位置补交结果并通过复核，结果与台账各归其位", operator_role: "supervisor" }
      ]
    },
    {
      id: 5, building_id: 2, device_id: 5, inspector_id: 2,
      plan_date: "2026-09-22T09:00:00Z", task_type: "HYDRANT", status: "REVIEWED",
      checklist_version: "v2.1", finished_at: "2026-09-25T11:20:00Z",
      snapshot_building_id: 2, snapshot_floor: "2F", snapshot_location_desc: "B 座 2F 会议区茶水间旁",
      current_building_id: 2, current_floor: "2F", current_location_desc: "B 座 2F 会议区茶水间旁",
      location_state: "REINSPECT_NEW", location_conflict_type: "MOVED_DEVICE",
      location_resolution: "REINSPECT_NEW", location_resolved_by: "supervisor", location_resolved_at: "2026-09-24T17:00:00Z",
      location_resolution_note: "设备已迁到 2F 茶水间旁，旧位置提交的结果作废，按新位置重新巡检后再复核。",
      moved_at: "2026-09-23T09:40:00Z", conflict_at: "2026-09-23T16:20:00Z",
      history: [
        { at: "2026-09-16T14:00:00Z", action: "任务下发", detail: "下发位置：B 座综合楼 1F / B 座 1F 大堂西侧", operator_role: "admin" },
        { at: "2026-09-23T09:40:00Z", action: "设备换位", detail: "设备 HYD-005 改到 B 座综合楼 2F / B 座 2F 会议区茶水间旁；任务进行中，保留旧位置并标出差异", operator_role: "admin" },
        { at: "2026-09-23T16:20:00Z", action: "提交被拦截", detail: "提交位置与任务旧位置不一致，结果未写入，等待主管处理", operator_role: "inspector" },
        { at: "2026-09-24T17:00:00Z", action: "主管要求按新位置重检", detail: "任务改到新位置 2F / 茶水间旁，旧位置结果标记作废", operator_role: "supervisor" },
        { at: "2026-09-25T11:20:00Z", action: "重检完成并复核", detail: "按新位置重新提交，结果与设备新台账一致", operator_role: "inspector" }
      ]
    }
  ],
  inspectionResult: [
    { id: 1, task_id: 3, device_id: 2, item_code: "SMOKE_TEST", result_status: "NORMAL", measured_value: "正常响应", photo_url: "/mock/sdet-002.png", note: "月度烟感测试通过", submit_building_id: 1, submit_floor: "2F", submit_location_desc: "A 座 2F 配电间旁", conflict_flag: false, is_superseded: false, created_at: "2026-09-23T10:00:00Z" },
    { id: 2, task_id: 4, device_id: 4, item_code: "EXIT_INDICATOR", result_status: "NORMAL", measured_value: "点亮正常", photo_url: "/mock/ext-004.png", note: "主管确认原位置有效后，按任务旧位置 1F 补交", submit_building_id: 1, submit_floor: "1F", submit_location_desc: "A 座 1F 东侧安全出口", conflict_flag: false, is_superseded: false, created_at: "2026-09-24T15:50:00Z" },
    { id: 3, task_id: 5, device_id: 5, item_code: "HYDRANT_PRESSURE", result_status: "NORMAL", measured_value: "1.1MPa", photo_url: "/mock/hyd-005-old.png", note: "旧位置首次提交，因设备已换位被作废", submit_building_id: 2, submit_floor: "1F", submit_location_desc: "B 座 1F 大堂西侧", conflict_flag: true, is_superseded: true, created_at: "2026-09-23T16:20:00Z" },
    { id: 4, task_id: 5, device_id: 5, item_code: "HYDRANT_PRESSURE", result_status: "NORMAL", measured_value: "1.15MPa", photo_url: "/mock/hyd-005-new.png", note: "按主管要求在新位置 2F 重检", submit_building_id: 2, submit_floor: "2F", submit_location_desc: "B 座 2F 会议区茶水间旁", conflict_flag: false, is_superseded: false, created_at: "2026-09-25T11:00:00Z" }
  ],
  hazardTicket: [
    { id: 1, result_id: 1, severity: "LOW", owner_id: 1, deadline: "2026-10-01", rectify_status: "CLOSED", rectify_note: "清洁后恢复", closed_at: "2026-09-26T09:00:00Z" },
    { id: 2, result_id: 2, severity: "LOW", owner_id: 2, deadline: "2026-10-05", rectify_status: "CLOSED", rectify_note: "无需整改", closed_at: "2026-09-24T16:00:00Z" },
    { id: 3, result_id: 4, severity: "MEDIUM", owner_id: 2, deadline: "2026-10-10", rectify_status: "OPEN", rectify_note: "", closed_at: "" }
  ]
};
