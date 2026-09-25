import { mockData } from "../mocks/seedData";
import { MockLocationConflictError, mockSubmitResult } from "../mocks/mockEngine";
import { ApiError } from "./InspectionTask";
import type { InspectionResult } from "../types/InspectionResult";
import type { SubmitResultPayload } from "../types/locationPayloads";

const endpoint = "/api/inspection-result";

export async function listInspectionResult(): Promise<InspectionResult[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return mockData.inspectionResult.map((row) => ({ ...row }));
}

export async function submitInspectionResult(payload: SubmitResultPayload): Promise<InspectionResult> {
  try {
    const res = await fetch(`${endpoint}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Role": payload.operator_role ?? "inspector" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
    const body = await res.json().catch(() => ({}));
    const error = new ApiError(body.code ?? "VALIDATION_FAILED", res.status, body.message);
    (error as ApiError & { details?: unknown }).details = body.details;
    throw error;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return mockSubmitResult(payload);
  }
}

export async function saveInspectionResult(payload: InspectionResult) {
  console.info("save InspectionResult", payload);
  return payload;
}

export { MockLocationConflictError };
