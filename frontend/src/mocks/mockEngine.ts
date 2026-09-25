import { mockData } from "../mocks/seedData";
import type { FireDevice } from "../types/FireDevice";
import type { InspectionTask } from "../types/InspectionTask";
import type { InspectionResult } from "../types/InspectionResult";
import type { LocationEvent } from "../types/LocationEvent";
import {
  RELOCATION_MIGRATE_STATUSES,
  RELOCATION_PENDING_STATUSES,
  RELOCATION_ARCHIVE_STATUSES
} from "../constants/LocationResolution";

// 后端不可达时的本地兜底：深拷贝一份种子数据，在会话内模拟换位/冲突/裁决，
// 逻辑与 backend services 保持一致，保证离线评审也能走通完整流程。
type DB = {
  building: typeof mockData.building;
  fireDevice: FireDevice[];
  inspectionTask: InspectionTask[];
  inspectionResult: InspectionResult[];
  hazardTicket: typeof mockData.hazardTicket;
  locationEvent: LocationEvent[];
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let db: DB | null = null;

export const getMockDb = (): DB => {
  if (!db) {
    db = {
      building: clone(mockData.building),
      fireDevice: clone(mockData.fireDevice) as unknown as FireDevice[],
      inspectionTask: clone(mockData.inspectionTask) as unknown as InspectionTask[],
      inspectionResult: clone(mockData.inspectionResult) as unknown as InspectionResult[],
      hazardTicket: clone(mockData.hazardTicket),
      locationEvent: clone(mockData.locationEvent) as unknown as LocationEvent[]
    };
  }
  return db;
};

export class MockApiError extends Error {
  code: string;
  statusCode: number;
  constructor(code: string, message: string, statusCode = 409) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const nowIso = () => new Date().toISOString();

const addEvent = (event: Omit<LocationEvent, "id" | "created_at"> & { created_at?: string }): LocationEvent => {
  const database = getMockDb();
  const row: LocationEvent = {
    ...event,
    id: database.locationEvent.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    created_at: event.created_at ?? nowIso()
  };
  database.locationEvent.push(row);
  return row;
};

export const mockRelocateDevice = (
  deviceId: number,
  payload: { building_id: number; floor: string; location_desc: string; note?: string; actor_id?: number; actor_role?: string }
): FireDevice => {
  const database = getMockDb();
  const device = database.fireDevice.find((item) => item.id === deviceId);
  if (!device) throw new MockApiError("ENTITY_NOT_FOUND", "target entity not found", 404);

  const from = { building_id: device.building_id, floor: device.floor, location_desc: device.location_desc };
  const to = { building_id: payload.building_id, floor: payload.floor, location_desc: payload.location_desc };
  device.building_id = payload.building_id;
  device.floor = payload.floor;
  device.location_desc = payload.location_desc;
  addEvent({
    device_id: deviceId,
    event_type: "DEVICE_RELOCATED",
    actor_id: payload.actor_id ?? 0,
    actor_role: payload.actor_role ?? "admin",
    from_building_id: from.building_id,
    from_floor: from.floor,
    from_location_desc: from.location_desc,
    to_building_id: to.building_id,
    to_floor: to.floor,
    to_location_desc: to.location_desc,
    note: payload.note ?? ""
  });

  database.inspectionTask.filter((task) => task.device_id === deviceId).forEach((task) => {
    if (RELOCATION_MIGRATE_STATUSES.includes(task.status)) {
      task.snapshot_building_id = to.building_id;
      task.snapshot_floor = to.floor;
      task.snapshot_location_desc = to.location_desc;
      task.building_id = to.building_id;
      addEvent({
        device_id: deviceId, task_id: task.id, event_type: "TASK_MIGRATED",
        actor_id: payload.actor_id ?? 0, actor_role: payload.actor_role ?? "admin",
        from_building_id: from.building_id, from_floor: from.floor, from_location_desc: from.location_desc,
        to_building_id: to.building_id, to_floor: to.floor, to_location_desc: to.location_desc
      });
    } else if (RELOCATION_PENDING_STATUSES.includes(task.status)) {
      task.location_resolution = "PENDING";
      addEvent({
        device_id: deviceId, task_id: task.id, event_type: "TASK_CONFLICTED",
        actor_id: payload.actor_id ?? 0, actor_role: payload.actor_role ?? "admin",
        from_building_id: from.building_id, from_floor: from.floor, from_location_desc: from.location_desc,
        to_building_id: to.building_id, to_floor: to.floor, to_location_desc: to.location_desc
      });
    } else if (RELOCATION_ARCHIVE_STATUSES.includes(task.status)) {
      addEvent({
        device_id: deviceId, task_id: task.id, event_type: "TASK_ARCHIVED",
        actor_id: payload.actor_id ?? 0, actor_role: payload.actor_role ?? "admin",
        from_building_id: from.building_id, from_floor: from.floor, from_location_desc: from.location_desc,
        to_building_id: to.building_id, to_floor: to.floor, to_location_desc: to.location_desc
      });
    }
  });
  return device;
};

const sameLocation = (a: Record<string, unknown>, b: Record<string, unknown>) =>
  a.building_id === b.building_id && String(a.floor ?? "") === String(b.floor ?? "") && String(a.location_desc ?? "") === String(b.location_desc ?? "");

export const mockSubmitResult = (payload: {
  task_id: number;
  item_code: string;
  result_status?: string;
  measured_value?: string;
  photo_url?: string;
  note?: string;
  building_id?: number;
  floor?: string;
  location_desc?: string;
  actor_id?: number;
  actor_role?: string;
}): InspectionResult => {
  const database = getMockDb();
  const task = database.inspectionTask.find((item) => item.id === payload.task_id);
  if (!task) throw new MockApiError("ENTITY_NOT_FOUND", "target entity not found", 404);
  const device = database.fireDevice.find((item) => item.id === task.device_id);

  const taskLocation = {
    building_id: task.snapshot_building_id,
    floor: task.snapshot_floor,
    location_desc: task.snapshot_location_desc
  };
  const submitted = {
    building_id: payload.building_id ?? taskLocation.building_id,
    floor: payload.floor ?? taskLocation.floor,
    location_desc: payload.location_desc ?? taskLocation.location_desc
  };

  if (!sameLocation(submitted, taskLocation as Record<string, unknown>)) {
    addEvent({
      device_id: task.device_id ?? 0, task_id: task.id, event_type: "RESULT_CONFLICT",
      actor_id: payload.actor_id ?? 0, actor_role: payload.actor_role ?? "inspector",
      from_building_id: submitted.building_id as number, from_floor: submitted.floor, from_location_desc: submitted.location_desc,
      to_building_id: taskLocation.building_id ?? undefined, to_floor: taskLocation.floor, to_location_desc: taskLocation.location_desc,
      note: "提交位置与任务位置不一致，已拦截"
    });
    throw new MockApiError("LOCATION_CONFLICT", "submitted location does not match task snapshot location", 409);
  }

  const row: InspectionResult = {
    id: database.inspectionResult.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    task_id: task.id,
    device_id: task.device_id ?? 0,
    item_code: payload.item_code,
    result_status: payload.result_status ?? "SUBMITTED",
    measured_value: payload.measured_value ?? "",
    photo_url: payload.photo_url ?? "",
    note: payload.note ?? "",
    building_id: taskLocation.building_id ?? undefined,
    floor: taskLocation.floor,
    location_desc: taskLocation.location_desc,
    superseded: false
  };
  database.inspectionResult.push(row);

  if (task.location_resolution === "REINSPECT_NEW") {
    task.location_resolution = "SUPERSEDED";
    addEvent({
      device_id: row.device_id, task_id: task.id, result_id: row.id, event_type: "RESULT_RESUBMITTED",
      actor_id: payload.actor_id ?? 0, actor_role: payload.actor_role ?? "inspector",
      from_building_id: taskLocation.building_id ?? undefined, from_floor: taskLocation.floor, from_location_desc: taskLocation.location_desc,
      to_building_id: device?.building_id, to_floor: device?.floor ?? "", to_location_desc: device?.location_desc ?? "",
      note: "已按新位置重新提交"
    });
  }
  return row;
};

export const mockResolveTaskLocation = (
  taskId: number,
  payload: { decision: "KEEP_ORIGINAL" | "REINSPECT_NEW"; note?: string; actor_id?: number; actor_role?: string }
): InspectionTask => {
  const database = getMockDb();
  const task = database.inspectionTask.find((item) => item.id === taskId);
  if (!task) throw new MockApiError("ENTITY_NOT_FOUND", "target entity not found", 404);
  if (task.location_resolution !== "PENDING") throw new MockApiError("TASK_NOT_PENDING", "task location difference is not pending", 409);

  const device = database.fireDevice.find((item) => item.id === task.device_id);
  const actorId = payload.actor_id ?? 0;
  const actorRole = payload.actor_role ?? "supervisor";

  if (payload.decision === "KEEP_ORIGINAL") {
    task.location_resolution = "KEEP_ORIGINAL";
    task.location_resolved_by = actorId;
    task.location_resolved_at = nowIso();
    task.location_resolved_note = payload.note ?? "";
    addEvent({
      device_id: task.device_id ?? 0, task_id: task.id, event_type: "RESOLUTION_KEEP",
      actor_id: actorId, actor_role: actorRole,
      to_building_id: device?.building_id, to_floor: device?.floor ?? "", to_location_desc: device?.location_desc ?? "",
      note: payload.note ?? ""
    });
  } else {
    database.inspectionResult
      .filter((result) => result.task_id === taskId && !result.superseded)
      .forEach((result) => {
        result.superseded = true;
        addEvent({
          device_id: task.device_id ?? 0, task_id: taskId, result_id: result.id, event_type: "RESULT_SUPERSEDED",
          actor_id: actorId, actor_role: actorRole, note: "主管要求按新位置重检"
        });
      });
    task.location_resolution = "REINSPECT_NEW";
    task.location_resolved_by = actorId;
    task.location_resolved_at = nowIso();
    task.location_resolved_note = payload.note ?? "";
    if (device) {
      task.snapshot_building_id = device.building_id;
      task.snapshot_floor = device.floor;
      task.snapshot_location_desc = device.location_desc;
      task.building_id = device.building_id;
    }
    addEvent({
      device_id: task.device_id ?? 0, task_id: task.id, event_type: "RESOLUTION_REINSPECT",
      actor_id: actorId, actor_role: actorRole,
      to_building_id: device?.building_id, to_floor: device?.floor ?? "", to_location_desc: device?.location_desc ?? "",
      note: payload.note ?? ""
    });
  }
  return task;
};
