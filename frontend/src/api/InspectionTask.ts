import { getMockDb, mockResolveTaskLocation, MockApiError } from "../mocks/mockEngine";
import type { InspectionTask } from "../types/InspectionTask";

const endpoint = "/api/inspection-task";

export async function listInspectionTask(): Promise<InspectionTask[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(getMockDb().inspectionTask as InspectionTask[])];
}

export async function saveInspectionTask(payload: InspectionTask) {
  console.info("save InspectionTask", payload);
  return payload;
}

export type LocationDecision = "KEEP_ORIGINAL" | "REINSPECT_NEW";

// 主管裁决：确认原位置有效，或要求按新位置重检
export async function resolveTaskLocation(
  taskId: number,
  decision: LocationDecision,
  note = ""
): Promise<InspectionTask> {
  try {
    const res = await fetch(`${endpoint}/${taskId}/location-resolution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note, actor_id: 40, actor_role: "supervisor" })
    });
    if (res.ok) return await res.json();
    const error = await res.json().catch(() => null);
    if (error?.code) throw new MockApiError(error.code, error.message, res.status);
  } catch (error) {
    if (error instanceof MockApiError) throw error;
  }
  return mockResolveTaskLocation(taskId, { decision, note, actor_id: 40, actor_role: "supervisor" });
}
