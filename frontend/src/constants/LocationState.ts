export const LocationState = [
  "SYNCED",
  "MOVED_PENDING",
  "DIVERGED",
  "CONFLICT",
  "CONFIRMED_OLD",
  "REINSPECT_NEW"
] as const;
export type LocationState = (typeof LocationState)[number];

export const LocationStateText: Record<LocationState, string> = {
  SYNCED: "位置一致",
  MOVED_PENDING: "已改派新位置",
  DIVERGED: "位置有差异",
  CONFLICT: "位置冲突待处理",
  CONFIRMED_OLD: "已确认原位置有效",
  REINSPECT_NEW: "按新位置重检"
};

// 任务位置差异在列表中的配色语义（供 StatusBadge / 筛选器复用）
export const LocationStateTone: Record<LocationState, string> = {
  SYNCED: "ok",
  MOVED_PENDING: "info",
  DIVERGED: "warn",
  CONFLICT: "danger",
  CONFIRMED_OLD: "ok",
  REINSPECT_NEW: "info"
};
