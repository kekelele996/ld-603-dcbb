import { mockData } from "./seedData";
import type { LocationConflictDetails, RelocateDevicePayload, ResolveLocationPayload, SubmitResultPayload } from "../types/locationPayloads";
import type { InspectionTask } from "../types/InspectionTask";

// 离线 mock 引擎：与后端 location_policy / service 保持同一套规则
const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

export class MockLocationConflictError extends Error {
  code = "LOCATION_CONFLICT";
  statusCode = 409;
  details: LocationConflictDetails;
  constructor(details: LocationConflictDetails) {
    super("LOCATION_CONFLICT");
    this.details = details;
  }
}

export class MockApiError extends Error {
  code: string;
  statusCode: number;
  constructor(code: string, statusCode: number, message: string) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const AUTO_MOVE = ["PLANNED"];
const KEEP_SNAPSHOT = ["IN_PROGRESS", "SUBMITTED", "OVERDUE"];

const nextId = (rows: Array<{ id: number }>) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export function mockRelocate(deviceId: number, payload: RelocateDevicePayload) {
  const device = mockData.fireDevice.find((row) => row.id === deviceId);
  if (!device) throw new MockApiError("DEVICE_NOT_FOUND", 404, "设备不存在");
  const operator = payload.operator_role ?? "admin";
  const ts = nowIso();

  mockData.inspectionTask.filter((task) => task.device_id === deviceId).forEach((task) => {
    task.current_building_id = payload.building_id;
    task.current_floor = payload.floor;
    task.current_location_desc = payload.location_desc;
    task.moved_at = ts;
    const oldDesc = `楼栋#${task.snapshot_building_id} ${task.snapshot_floor} / ${task.snapshot_location_desc}`;
    const newDesc = `楼栋#${payload.building_id} ${payload.floor} / ${payload.location_desc}`;
    if (AUTO_MOVE.includes(task.status)) {
      task.snapshot_building_id = payload.building_id;
      task.snapshot_floor = payload.floor;
      task.snapshot_location_desc = payload.location_desc;
      task.location_state = "MOVED_PENDING";
      task.location_conflict_type = "NONE";
      task.history.push({ at: ts, action: "设备换位-任务改派", detail: `任务尚未开始，位置由旧位置（${oldDesc}）改到新位置（${newDesc}）`, operator_role: operator });
    } else if (KEEP_SNAPSHOT.includes(task.status)) {
      task.location_state = "DIVERGED";
      task.location_conflict_type = "MOVED_DEVICE";
      task.history.push({ at: ts, action: "设备换位-保留旧位置", detail: `任务${task.status}，保留任务旧位置（${oldDesc}），设备新位置（${newDesc}）已标出差异`, operator_role: operator });
    }
  });

  device.building_id = payload.building_id;
  device.floor = payload.floor;
  device.location_desc = payload.location_desc;
  return { device, tasks: mockData.inspectionTask.filter((task) => task.device_id === deviceId) };
}

export function mockDispatch(payload: { device_id: number; inspector_id: number; task_type?: string; checklist_version?: string }): InspectionTask {
  const device = mockData.fireDevice.find((row) => row.id === payload.device_id);
  if (!device) throw new MockApiError("DEVICE_NOT_FOUND", 404, "设备不存在");
  const ts = nowIso();
  const id = nextId(mockData.inspectionTask);
  const task: InspectionTask = {
    id,
    building_id: device.building_id,
    device_id: device.id,
    inspector_id: payload.inspector_id,
    plan_date: ts,
    task_type: payload.task_type ?? device.device_type,
    status: "PLANNED",
    checklist_version: payload.checklist_version ?? "v2.1",
    finished_at: "",
    snapshot_building_id: device.building_id,
    snapshot_floor: device.floor,
    snapshot_location_desc: device.location_desc,
    current_building_id: device.building_id,
    current_floor: device.floor,
    current_location_desc: device.location_desc,
    location_state: "SYNCED",
    location_conflict_type: "NONE",
    location_resolution: "",
    location_resolved_by: "",
    location_resolved_at: "",
    location_resolution_note: "",
    moved_at: "",
    conflict_at: "",
    history: [{ at: ts, action: "任务下发", detail: `下发位置：楼栋#${device.building_id} ${device.floor} / ${device.location_desc}`, operator_role: "admin" }]
  };
  mockData.inspectionTask.push(task);
  return task;
}

function detectMismatch(task: InspectionTask, payload: SubmitResultPayload) {
  if (Number(payload.submit_building_id) !== Number(task.snapshot_building_id)) return "BUILDING_MISMATCH";
  if (payload.submit_floor.trim() !== task.snapshot_floor.trim()) return "FLOOR_MISMATCH";
  if (payload.submit_location_desc.trim() !== task.snapshot_location_desc.trim()) return "LOCATION_MISMATCH";
  return "NONE";
}

export function mockSubmitResult(payload: SubmitResultPayload) {
  const task = mockData.inspectionTask.find((row) => row.id === payload.task_id);
  if (!task) throw new MockApiError("TASK_NOT_FOUND", 404, "任务不存在");

  const block = (conflictType: string) => {
    const ts = nowIso();
    task.location_state = "CONFLICT";
    task.location_conflict_type = conflictType as InspectionTask["location_conflict_type"];
    task.conflict_at = ts;
    task.history.push({
      at: ts,
      action: "提交被拦截",
      detail: `提交位置 楼栋#${payload.submit_building_id} ${payload.submit_floor} / ${payload.submit_location_desc} 与任务位置 楼栋#${task.snapshot_building_id} ${task.snapshot_floor} / ${task.snapshot_location_desc} 不一致（${conflictType}），结果未写入，等待主管处理`,
      operator_role: payload.operator_role ?? "inspector"
    });
    throw new MockLocationConflictError({
      task_id: task.id,
      conflict_type: conflictType,
      snapshot: { building_id: task.snapshot_building_id, floor: task.snapshot_floor, location_desc: task.snapshot_location_desc },
      submitted: { building_id: payload.submit_building_id, floor: payload.submit_floor, location_desc: payload.submit_location_desc },
      device_current: {
        building_id: task.current_building_id ?? task.snapshot_building_id,
        floor: task.current_floor,
        location_desc: task.current_location_desc
      }
    });
  };

  const mismatch = detectMismatch(task, payload);
  if (task.location_state === "CONFLICT") block(task.location_conflict_type !== "NONE" ? task.location_conflict_type : mismatch || "MOVED_DEVICE");
  if (mismatch !== "NONE") {
    const device = mockData.fireDevice.find((row) => row.id === task.device_id);
    const pointsToNew = device && Number(device.building_id) === Number(payload.submit_building_id) && device.floor === payload.submit_floor && device.location_desc === payload.submit_location_desc;
    block(pointsToNew ? "MOVED_DEVICE" : mismatch);
  }

  const ts = nowIso();
  const result = {
    id: nextId(mockData.inspectionResult),
    task_id: task.id,
    device_id: task.device_id,
    item_code: payload.item_code,
    result_status: payload.result_status,
    measured_value: payload.measured_value ?? "",
    photo_url: "",
    note: payload.note ?? "",
    submit_building_id: payload.submit_building_id,
    submit_floor: payload.submit_floor,
    submit_location_desc: payload.submit_location_desc,
    conflict_flag: false,
    is_superseded: false,
    created_at: ts
  };
  mockData.inspectionResult.push(result);

  if (task.location_state === "CONFIRMED_OLD") {
    task.history.push({ at: ts, action: "按处置意见重新提交", detail: "按确认的原位置提交，结果有效", operator_role: payload.operator_role ?? "inspector" });
  } else if (task.location_state === "REINSPECT_NEW") {
    task.location_state = "SYNCED";
    task.status = "SUBMITTED";
    task.history.push({ at: ts, action: "按处置意见重新提交", detail: "按新位置重检提交，结果有效，任务、结果与新台账对应", operator_role: payload.operator_role ?? "inspector" });
  } else if (task.location_state === "DIVERGED") {
    task.history.push({ at: ts, action: "按任务位置提交", detail: "设备已换位，但结果按任务下发位置提交，未写入设备新位置", operator_role: payload.operator_role ?? "inspector" });
  }
  return result;
}

export function mockResolveLocation(taskId: number, payload: ResolveLocationPayload) {
  const task = mockData.inspectionTask.find((row) => row.id === taskId);
  if (!task) throw new MockApiError("TASK_NOT_FOUND", 404, "任务不存在");
  if (task.location_state !== "CONFLICT") throw new MockApiError("CONFLICT_ALREADY_RESOLVED", 409, "冲突已处理");
  const ts = nowIso();
  task.location_resolution = payload.resolution;
  task.location_resolved_by = payload.operator_role ?? "supervisor";
  task.location_resolved_at = ts;
  task.location_resolution_note = payload.note ?? "";

  const oldDesc = `楼栋#${task.snapshot_building_id} ${task.snapshot_floor} / ${task.snapshot_location_desc}`;
  const newDesc = `楼栋#${task.current_building_id} ${task.current_floor} / ${task.current_location_desc}`;
  if (payload.resolution === "KEEP_OLD") {
    task.location_state = "CONFIRMED_OLD";
    task.history.push({ at: ts, action: "主管确认原位置有效", detail: `维持任务位置（${oldDesc}）；巡检员按任务位置补交结果。说明：${payload.note || "无"}`, operator_role: task.location_resolved_by });
  } else {
    mockData.inspectionResult.filter((row) => row.task_id === taskId).forEach((row) => {
      row.is_superseded = true;
      row.conflict_flag = true;
    });
    task.snapshot_building_id = task.current_building_id ?? task.snapshot_building_id;
    task.snapshot_floor = task.current_floor;
    task.snapshot_location_desc = task.current_location_desc;
    task.location_state = "REINSPECT_NEW";
    task.location_conflict_type = "NONE";
    task.status = "IN_PROGRESS";
    task.history.push({ at: ts, action: "主管要求按新位置重检", detail: `任务改到新位置（${newDesc}），旧位置（${oldDesc}）结果已标记作废，等待重新巡检。说明：${payload.note || "无"}`, operator_role: task.location_resolved_by });
  }
  return task;
}
