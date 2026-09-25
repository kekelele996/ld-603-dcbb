import { create } from "zustand";
import { listInspectionResult, submitInspectionResult } from "../api/InspectionResult";
import type { InspectionResult } from "../types/InspectionResult";
import type { SubmitResultPayload } from "../types/locationPayloads";

type State = {
  rows: InspectionResult[];
  loading: boolean;
  load: () => Promise<void>;
  submit: (payload: SubmitResultPayload) => Promise<InspectionResult>;
};

export const useInspectionResultStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listInspectionResult(), loading: false });
  },
  async submit(payload) {
    const saved = await submitInspectionResult(payload);
    set({ rows: await listInspectionResult() });
    return saved;
  }
}));
