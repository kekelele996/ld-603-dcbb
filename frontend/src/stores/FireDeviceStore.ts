import { create } from "zustand";
import { listFireDevice, relocateFireDevice, type DeviceRelocationPayload } from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";

type State = {
  rows: FireDevice[];
  loading: boolean;
  load: () => Promise<void>;
  relocate: (deviceId: number, payload: DeviceRelocationPayload) => Promise<FireDevice>;
};

export const useFireDeviceStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFireDevice(), loading: false });
  },
  async relocate(deviceId, payload) {
    const updated = await relocateFireDevice(deviceId, payload);
    set({ rows: get().rows.map((row) => (row.id === deviceId ? updated : row)) });
    return updated;
  }
}));
