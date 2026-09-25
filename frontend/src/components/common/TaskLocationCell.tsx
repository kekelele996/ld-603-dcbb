import type { Building } from "../../types/Building";
import type { InspectionTask } from "../../types/InspectionTask";
import { useTaskLocation } from "../../hooks/useTaskLocation";
import { LocationStateBadge } from "./LocationStateBadge";

type Props = {
  task: InspectionTask;
  buildings: Building[];
  compact?: boolean;
};

// 任务位置单元格：始终先展示任务下发时保存的位置；设备换位后再标出设备新位置差异
export function TaskLocationCell({ task, buildings, compact }: Props) {
  const location = useTaskLocation(task, buildings);
  if (!location) return null;

  return (
    <div className="task-location">
      <div className="task-location-line">
        <span className="loc-tag">任务位置</span>
        <strong>{location.snapshotText}</strong>
      </div>
      {location.divergent && !compact && (
        <div className="task-location-line diff">
          <span className="loc-tag outline">设备现位置</span>
          <span>{location.currentText}</span>
          <LocationStateBadge value={task.location_state} />
        </div>
      )}
      {location.divergent && compact && <LocationStateBadge value={task.location_state} />}
    </div>
  );
}
