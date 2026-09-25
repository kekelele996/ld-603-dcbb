export const formatDate = (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

// 楼栋 / 楼层 / 位置三段拼成台账上的完整位置文案，任务卡片和结果记录共用
export const formatLocation = (
  buildingName: string | undefined,
  floor: string,
  locationDesc: string,
  fallbackBuilding: string = "未知楼栋"
) => `${buildingName ?? fallbackBuilding} ${floor ?? ""} ${locationDesc ?? ""}`.trim();
