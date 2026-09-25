import { useMemo } from "react";
import type { Building } from "../types/Building";
import type { InspectionTask } from "../types/InspectionTask";
import { formatLocation } from "../utils/formatters";

// 任务位置视图模型：统一算出任务位置 / 设备现位置 / 是否有差异，供列表、详情、提交面板复用
export function useTaskLocation(task: InspectionTask | undefined, buildings: Building[]) {
  return useMemo(() => {
    if (!task) return null;
    const nameOf = (id?: number) => buildings.find((item) => item.id === id)?.name ?? `楼栋#${id ?? "?"}`;
    const snapshotText = formatLocation(nameOf(task.snapshot_building_id), task.snapshot_floor, task.snapshot_location_desc);
    const currentText = formatLocation(nameOf(task.current_building_id), task.current_floor, task.current_location_desc);
    const divergent =
      String(task.snapshot_building_id) !== String(task.current_building_id) ||
      task.snapshot_floor !== task.current_floor ||
      task.snapshot_location_desc !== task.current_location_desc;
    return {
      snapshotText,
      currentText,
      divergent,
      canResolve: task.location_state === "CONFLICT",
      needsInspectorAction: task.location_state === "CONFIRMED_OLD" || task.location_state === "REINSPECT_NEW"
    };
  }, [task, buildings]);
}
