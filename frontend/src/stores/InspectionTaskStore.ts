import { create } from "zustand";
import { dispatchInspectionTask, listInspectionTask, resolveLocationConflict } from "../api/InspectionTask";
import type { InspectionTask } from "../types/InspectionTask";
import type { DispatchTaskPayload } from "../types/locationPayloads";

type ResolvePayload = {
  resolution: "KEEP_OLD" | "REINSPECT_NEW";
  note?: string;
  operator_role?: string;
};

type State = {
  rows: InspectionTask[];
  loading: boolean;
  load: () => Promise<void>;
  dispatch: (payload: DispatchTaskPayload) => Promise<void>;
  resolveConflict: (taskId: number, payload: ResolvePayload) => Promise<void>;
};

export const useInspectionTaskStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listInspectionTask(), loading: false });
  },
  async dispatch(payload) {
    await dispatchInspectionTask(payload);
    set({ rows: await listInspectionTask() });
  },
  async resolveConflict(taskId, payload) {
    await resolveLocationConflict(taskId, payload);
    set({ rows: await listInspectionTask() });
  }
}));
