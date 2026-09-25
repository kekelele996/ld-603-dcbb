import { mockData } from "../mocks/seedData";
import { mockRelocate } from "../mocks/mockEngine";
import type { FireDevice } from "../types/FireDevice";
import type { RelocateDevicePayload } from "../types/locationPayloads";
import { ApiError } from "./InspectionTask";

const endpoint = "/api/fire-device";

export async function listFireDevice(): Promise<FireDevice[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return mockData.fireDevice.map((row) => ({ ...row }));
}

export async function relocateFireDevice(deviceId: number, payload: RelocateDevicePayload): Promise<{ device: FireDevice }> {
  try {
    const res = await fetch(`${endpoint}/${deviceId}/relocate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Role": payload.operator_role ?? "admin" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.code ?? "VALIDATION_FAILED", res.status, body.message);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return mockRelocate(deviceId, payload);
  }
}

export async function saveFireDevice(payload: FireDevice) {
  console.info("save FireDevice", payload);
  return payload;
}
