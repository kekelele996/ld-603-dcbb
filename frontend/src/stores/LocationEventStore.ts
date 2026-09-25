import { create } from "zustand";
import { listLocationEvent } from "../api/LocationEvent";
import type { LocationEvent } from "../types/LocationEvent";

type State = {
  rows: LocationEvent[];
  loading: boolean;
  load: (filter?: { device_id?: number; task_id?: number }) => Promise<void>;
};

export const useLocationEventStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load(filter) {
    set({ loading: true });
    set({ rows: await listLocationEvent(filter), loading: false });
  }
}));
