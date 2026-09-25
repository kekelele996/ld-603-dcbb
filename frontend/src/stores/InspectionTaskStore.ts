import { create } from "zustand";
import { listInspectionTask, resolveTaskLocation, type LocationDecision } from "../api/InspectionTask";
import type { InspectionTask } from "../types/InspectionTask";

type State = {
  rows: InspectionTask[];
  loading: boolean;
  load: () => Promise<void>;
  resolveLocation: (taskId: number, decision: LocationDecision, note?: string) => Promise<InspectionTask>;
};

export const useInspectionTaskStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listInspectionTask(), loading: false });
  },
  async resolveLocation(taskId, decision, note) {
    const updated = await resolveTaskLocation(taskId, decision, note);
    set({ rows: get().rows.map((row) => (row.id === taskId ? updated : row)) });
    return updated;
  }
}));
