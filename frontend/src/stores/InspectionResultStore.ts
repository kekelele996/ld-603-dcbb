import { create } from "zustand";
import { listInspectionResult, submitInspectionResult, type SubmitResultPayload } from "../api/InspectionResult";
import type { InspectionResult } from "../types/InspectionResult";

type State = {
  rows: InspectionResult[];
  loading: boolean;
  load: () => Promise<void>;
  submit: (payload: SubmitResultPayload) => Promise<InspectionResult>;
};

export const useInspectionResultStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listInspectionResult(), loading: false });
  },
  async submit(payload) {
    // LOCATION_CONFLICT 会在这里抛出，由页面提示，不会把结果写到新位置
    const created = await submitInspectionResult(payload);
    set({ rows: [...get().rows, created] });
    return created;
  }
}));
