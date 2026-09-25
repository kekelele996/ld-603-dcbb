import { create } from "zustand";
import { listFireDevice, relocateFireDevice } from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";
import type { RelocateDevicePayload } from "../types/locationPayloads";

type State = {
  rows: FireDevice[];
  loading: boolean;
  load: () => Promise<void>;
  relocate: (deviceId: number, payload: RelocateDevicePayload) => Promise<void>;
};

export const useFireDeviceStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFireDevice(), loading: false });
  },
  async relocate(deviceId, payload) {
    await relocateFireDevice(deviceId, payload);
    set({ rows: await listFireDevice() });
  }
}));
