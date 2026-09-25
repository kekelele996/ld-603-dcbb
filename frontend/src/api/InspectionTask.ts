import { ERROR_MESSAGES } from "../constants/errorMessages";
import { mockData } from "../mocks/seedData";
import { MockApiError, MockLocationConflictError, mockDispatch, mockResolveLocation } from "../mocks/mockEngine";
import type { DispatchTaskPayload } from "../types/locationPayloads";
import type { InspectionTask } from "../types/InspectionTask";

const endpoint = "/api/inspection-task";

async function readError(res: Response): Promise<{ code: string; message: string; details?: unknown }> {
  try {
    const body = await res.json();
    return { code: body.code ?? "VALIDATION_FAILED", message: body.message, details: body.details };
  } catch {
    return { code: "VALIDATION_FAILED", message: ERROR_MESSAGES.VALIDATION_FAILED };
  }
}

export async function listInspectionTask(): Promise<InspectionTask[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return mockData.inspectionTask.map((row) => ({ ...row }));
}

export async function dispatchInspectionTask(payload: DispatchTaskPayload): Promise<InspectionTask> {
  try {
    const res = await fetch(`${endpoint}/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Role": payload.operator_role ?? "admin" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
    const err = await readError(res);
    throw new ApiError(err.code, res.status, err.message);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return mockDispatch(payload);
  }
}

export async function resolveLocationConflict(taskId: number, payload: {
  resolution: "KEEP_OLD" | "REINSPECT_NEW";
  note?: string;
  operator_role?: string;
}): Promise<InspectionTask> {
  try {
    const res = await fetch(`${endpoint}/${taskId}/resolve-location`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Role": payload.operator_role ?? "supervisor" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
    const err = await readError(res);
    throw new ApiError(err.code, res.status, err.message);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return mockResolveLocation(taskId, payload);
  }
}

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;
  constructor(code: string, statusCode: number, message?: string) {
    super(message ?? ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] ?? code);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export { MockApiError, MockLocationConflictError };

export async function saveInspectionTask(payload: InspectionTask) {
  console.info("save InspectionTask", payload);
  return payload;
}
