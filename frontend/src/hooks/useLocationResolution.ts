import { useCallback, useState } from "react";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useLocationEventStore } from "../stores/LocationEventStore";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { InspectionTask } from "../types/InspectionTask";
import type { SubmitResultPayload } from "../api/InspectionResult";

// 设备换位后的位置差异处理：巡检员按任务位置提交（冲突拦截），主管确认原位置或要求重检
export function useLocationResolution() {
  const [message, setMessage] = useState<{ tone: "info" | "error" | "success"; text: string } | null>(null);
  const resolveLocation = useInspectionTaskStore((state) => state.resolveLocation);
  const submitResult = useInspectionResultStore((state) => state.submit);
  const loadEvents = useLocationEventStore((state) => state.load);

  const submitAtTaskLocation = useCallback(
    async (payload: SubmitResultPayload): Promise<boolean> => {
      try {
        await submitResult(payload);
        setMessage({ tone: "success", text: "已按任务位置提交，台账记录在该位置下。" });
        await loadEvents({ device_id: payload.task_id });
        return true;
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code === "LOCATION_CONFLICT") {
          setMessage({ tone: "error", text: ERROR_MESSAGES.LOCATION_CONFLICT });
        } else {
          setMessage({ tone: "error", text: "提交失败，请稍后重试。" });
        }
        return false;
      }
    },
    [submitResult, loadEvents]
  );

  const decide = useCallback(
    async (task: InspectionTask, decision: "KEEP_ORIGINAL" | "REINSPECT_NEW", note = ""): Promise<boolean> => {
      try {
        await resolveLocation(task.id, decision, note);
        setMessage({
          tone: "success",
          text: decision === "KEEP_ORIGINAL"
            ? "已确认原位置有效，任务与台账维持原位置。"
            : "已要求按新位置重检，旧位置结果已作废。"
        });
        await loadEvents({ device_id: task.device_id });
        return true;
      } catch (error) {
        const code = (error as { code?: string }).code;
        setMessage({ tone: "error", text: code ? ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] ?? "操作失败" : "操作失败" });
        return false;
      }
    },
    [resolveLocation, loadEvents]
  );

  return { message, setMessage, submitAtTaskLocation, decide };
}
