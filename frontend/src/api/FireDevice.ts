import { getMockDb, mockRelocateDevice, MockApiError } from "../mocks/mockEngine";
import type { FireDevice } from "../types/FireDevice";

const endpoint = "/api/fire-device";

export async function listFireDevice(): Promise<FireDevice[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(getMockDb().fireDevice as unknown as FireDevice[])];
}

export async function saveFireDevice(payload: FireDevice) {
  console.info("save FireDevice", payload);
  return payload;
}

export type DeviceRelocationPayload = {
  building_id: number;
  floor: string;
  location_desc: string;
  note?: string;
};

// 管理员改位置：未开始任务迁到新位置，进行中/待复核保留旧位置并标出差异
export async function relocateFireDevice(deviceId: number, payload: DeviceRelocationPayload): Promise<FireDevice> {
  try {
    const res = await fetch(`${endpoint}/${deviceId}/relocation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, actor_id: 1, actor_role: "admin" })
    });
    if (res.ok) return await res.json();
    const error = await res.json().catch(() => null);
    if (error?.code) throw new MockApiError(error.code, error.message, res.status);
  } catch (error) {
    if (error instanceof MockApiError) throw error;
    // 网络错误走本地 mock，离线评审也能演示
  }
  return mockRelocateDevice(deviceId, { ...payload, actor_id: 1, actor_role: "admin" });
}
