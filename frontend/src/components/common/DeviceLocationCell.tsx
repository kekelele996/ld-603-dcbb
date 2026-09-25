import type { Building } from "../../types/Building";
import type { InspectionTask } from "../../types/InspectionTask";
import type { FireDevice } from "../../types/FireDevice";
import { formatLocation, diffLocation } from "../../utils/formatters";
import { LocationResolutionText } from "../../constants/LocationResolution";
import { LocationDiffTag } from "./LocationDiffTag";

type Props = {
  task: InspectionTask;
  device?: FireDevice;
  buildings: Building[];
};

// 任务页/结果页共用：展示任务锁定的位置快照；设备换位后标出“旧位置 → 新位置”差异
export function DeviceLocationCell({ task, device, buildings }: Props) {
  const taskLocation = {
    building_id: task.snapshot_building_id,
    floor: task.snapshot_floor,
    location_desc: task.snapshot_location_desc
  };
  const deviceLocation = device
    ? { building_id: device.building_id, floor: device.floor, location_desc: device.location_desc }
    : null;
  const difference = deviceLocation ? diffLocation(taskLocation, deviceLocation) : { changed: false };

  return (
    <div className="location-cell">
      <div className="location-line">
        <span className="location-label">任务位置</span>
        <strong>{formatLocation(taskLocation, buildings)}</strong>
      </div>
      {difference.changed && deviceLocation && (
        <div className="location-line location-diff">
          <span className="location-label">设备现位置</span>
          <span>{formatLocation(deviceLocation, buildings)}</span>
          <LocationDiffTag tone="danger">已换位 · 不匹配</LocationDiffTag>
        </div>
      )}
      {task.location_resolution !== "NONE" && (
        <div className="location-line">
          <LocationDiffTag
            tone={
              task.location_resolution === "PENDING" ? "pending"
              : task.location_resolution === "KEEP_ORIGINAL" ? "keep"
              : task.location_resolution === "REINSPECT_NEW" ? "reinspect"
              : "closed"
            }
          >
            {LocationResolutionText[task.location_resolution]}
          </LocationDiffTag>
        </div>
      )}
    </div>
  );
}
