import { getMockDb, mockSubmitResult, MockApiError } from "../mocks/mockEngine";
import type { InspectionResult } from "../types/InspectionResult";

const endpoint = "/api/inspection-result";

export async function listInspectionResult(): Promise<InspectionResult[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(getMockDb().inspectionResult as InspectionResult[])];
}

export async function saveInspectionResult(payload: InspectionResult) {
  console.info("save InspectionResult", payload);
  return payload;
}

export type SubmitResultPayload = {
  task_id: number;
  item_code: string;
  measured_value?: string;
  photo_url?: string;
  note?: string;
  // 巡检员扫码/选择的实际位置；必须与任务位置快照一致
  building_id: number;
  floor: string;
  location_desc: string;
};

// 巡检员按任务位置提交；位置对不上时抛出 LOCATION_CONFLICT，结果不会写到新位置
export async function submitInspectionResult(payload: SubmitResultPayload): Promise<InspectionResult> {
  try {
    const res = await fetch(`${endpoint}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, actor_id: 20, actor_role: "inspector" })
    });
    if (res.ok) return await res.json();
    const error = await res.json().catch(() => null);
    if (error?.code) throw new MockApiError(error.code, error.message, res.status);
  } catch (error) {
    if (error instanceof MockApiError) throw error;
  }
  return mockSubmitResult({ ...payload, actor_id: 20, actor_role: "inspector" });
}
