import type { Building } from "../types/Building";

export const formatDate = (value: string) => value ? new Date(value).toLocaleString("zh-CN") : "—";
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export type LocationLike = {
  building_id?: number | null;
  floor?: string | null;
  location_desc?: string | null;
};

// 统一的“楼栋 / 楼层 / 位置”展示格式，任务页、结果页、台账和时间线共用
export const formatLocation = (location: LocationLike | null | undefined, buildings: Building[] = []): string => {
  if (!location) return "—";
  const building = buildings.find((item) => item.id === location.building_id);
  const parts = [building?.name ?? (location.building_id ? `楼栋#${location.building_id}` : ""), location.floor, location.location_desc]
    .map((part) => (part ?? "").trim())
    .filter(Boolean);
  return parts.length ? parts.join(" / ") : "—";
};

// 比较两处位置是否一致（楼栋、楼层、位置描述都相同才算一致）
export const isSameLocation = (left: LocationLike | null | undefined, right: LocationLike | null | undefined): boolean => {
  if (!left || !right) return false;
  return (
    left.building_id === right.building_id
    && String(left.floor ?? "") === String(right.floor ?? "")
    && String(left.location_desc ?? "") === String(right.location_desc ?? "")
  );
};

// 任务快照位置与设备当前位置的差异，供任务页标出“旧位置 → 新位置”
export const diffLocation = (taskLocation: LocationLike | null | undefined, deviceLocation: LocationLike | null | undefined) => {
  const buildingChanged = taskLocation?.building_id !== deviceLocation?.building_id;
  const floorChanged = String(taskLocation?.floor ?? "") !== String(deviceLocation?.floor ?? "");
  const descChanged = String(taskLocation?.location_desc ?? "") !== String(deviceLocation?.location_desc ?? "");
  return {
    changed: buildingChanged || floorChanged || descChanged,
    buildingChanged,
    floorChanged,
    descChanged
  };
};
