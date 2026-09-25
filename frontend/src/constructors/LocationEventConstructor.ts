import type { LocationEvent } from "../types/LocationEvent";

export const createDefaultLocationEvent = (overrides: Partial<LocationEvent> = {}): LocationEvent => ({
  id: 1 as never,
  device_id: 1 as never,
  task_id: null,
  result_id: null,
  event_type: "DEVICE_RELOCATED" as never,
  actor_id: 1 as never,
  actor_role: "admin",
  from_building_id: null,
  from_floor: "",
  from_location_desc: "",
  to_building_id: null,
  to_floor: "",
  to_location_desc: "",
  note: "",
  created_at: "2026-09-24T06:10:00Z" as never,
  ...overrides
});

export const createLocationEventResponse = createDefaultLocationEvent;
