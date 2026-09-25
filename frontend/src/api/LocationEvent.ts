import { getMockDb } from "../mocks/mockEngine";
import type { LocationEvent } from "../types/LocationEvent";

const endpoint = "/api/location-event";

// 位置差异处理时间线：重开页面仍可看到换位、冲突与裁决经过
export async function listLocationEvent(filter: { device_id?: number; task_id?: number } = {}): Promise<LocationEvent[]> {
  const params = new URLSearchParams();
  if (filter.device_id != null) params.set("device_id", String(filter.device_id));
  if (filter.task_id != null) params.set("task_id", String(filter.task_id));
  const query = params.toString();
  try {
    const res = await fetch(`${endpoint}${query ? `?${query}` : ""}`);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  let rows = getMockDb().locationEvent as LocationEvent[];
  if (filter.device_id != null) rows = rows.filter((event) => event.device_id === filter.device_id);
  if (filter.task_id != null) rows = rows.filter((event) => event.task_id === filter.task_id);
  return [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
}
