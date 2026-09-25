import type { Building } from "../../types/Building";
import type { FireDevice } from "../../types/FireDevice";
import { formatLocation } from "../../utils/formatters";

// 设备台账位置单元格：展示设备当前位置（新台账）
export function DeviceLocationCell({ device, buildings }: { device: FireDevice; buildings: Building[] }) {
  const name = buildings.find((item) => item.id === device.building_id)?.name ?? `楼栋#${device.building_id}`;
  return (
    <div className="device-location">
      <span className="loc-tag">台账位置</span>
      <strong>{formatLocation(name, device.floor, device.location_desc)}</strong>
    </div>
  );
}
