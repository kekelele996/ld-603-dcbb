export type LocationResolution =
  | "NONE"
  | "PENDING"
  | "KEEP_ORIGINAL"
  | "REINSPECT_NEW"
  | "SUPERSEDED";

export const LocationResolution = [
  "NONE",
  "PENDING",
  "KEEP_ORIGINAL",
  "REINSPECT_NEW",
  "SUPERSEDED"
] as const;

export const LocationResolutionText: Record<LocationResolution, string> = {
  NONE: "位置一致",
  PENDING: "位置冲突·待主管裁决",
  KEEP_ORIGINAL: "已确认原位置有效",
  REINSPECT_NEW: "需按新位置重检",
  SUPERSEDED: "已在新位置重检闭环"
};

// 换位时各任务状态的分流策略
export const RELOCATION_MIGRATE_STATUSES = ["PLANNED"];
export const RELOCATION_PENDING_STATUSES = ["IN_PROGRESS", "SUBMITTED"];
export const RELOCATION_ARCHIVE_STATUSES = ["REVIEWED", "OVERDUE"];
