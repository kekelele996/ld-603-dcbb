export type LocationEventType =
  | "DEVICE_RELOCATED"
  | "TASK_MIGRATED"
  | "TASK_CONFLICTED"
  | "TASK_ARCHIVED"
  | "RESULT_CONFLICT"
  | "RESULT_SUPERSEDED"
  | "RESULT_RESUBMITTED"
  | "RESOLUTION_KEEP"
  | "RESOLUTION_REINSPECT";

export const LocationEventType = [
  "DEVICE_RELOCATED",
  "TASK_MIGRATED",
  "TASK_CONFLICTED",
  "TASK_ARCHIVED",
  "RESULT_CONFLICT",
  "RESULT_SUPERSEDED",
  "RESULT_RESUBMITTED",
  "RESOLUTION_KEEP",
  "RESOLUTION_REINSPECT"
] as const;

export const LocationEventTypeText: Record<string, string> = {
  DEVICE_RELOCATED: "管理员调整设备位置",
  TASK_MIGRATED: "未开始任务已迁移到新位置",
  TASK_CONFLICTED: "任务保留旧位置，标记位置冲突",
  TASK_ARCHIVED: "已复核任务留痕，不再处理",
  RESULT_CONFLICT: "提交位置与任务不一致，已拦截",
  RESULT_SUPERSEDED: "旧位置结果作废，等待重检",
  RESULT_RESUBMITTED: "已在新位置重新提交",
  RESOLUTION_KEEP: "主管确认原位置有效",
  RESOLUTION_REINSPECT: "主管要求按新位置重检"
};
