export const LocationConflictType = [
  "NONE",
  "BUILDING_MISMATCH",
  "FLOOR_MISMATCH",
  "LOCATION_MISMATCH",
  "MOVED_DEVICE"
] as const;
export type LocationConflictType = (typeof LocationConflictType)[number];

export const LocationConflictTypeText: Record<LocationConflictType, string> = {
  NONE: "无冲突",
  BUILDING_MISMATCH: "楼栋对不上",
  FLOOR_MISMATCH: "楼层对不上",
  LOCATION_MISMATCH: "具体位置对不上",
  MOVED_DEVICE: "设备已换位，提交的是新位置"
};

export const LocationResolution = ["KEEP_OLD", "REINSPECT_NEW"] as const;
export type LocationResolution = (typeof LocationResolution)[number];

export const LocationResolutionText: Record<LocationResolution, string> = {
  KEEP_OLD: "确认原位置有效",
  REINSPECT_NEW: "要求按新位置重检"
};
