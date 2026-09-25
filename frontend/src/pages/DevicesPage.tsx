import { useEffect, useMemo, useState } from "react";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useLocationEventStore } from "../stores/LocationEventStore";
import { TimelineList } from "../components/common/TimelineList";
import { StatusBadge } from "../components/common/StatusBadge";
import { LocationResolutionText } from "../constants/LocationResolution";
import { formatLocation } from "../utils/formatters";

export function DevicesPage() {
  const devices = useFireDeviceStore((state) => state.rows);
  const loadDevices = useFireDeviceStore((state) => state.load);
  const relocate = useFireDeviceStore((state) => state.relocate);
  const buildings = useBuildingStore((state) => state.rows);
  const loadBuildings = useBuildingStore((state) => state.load);
  const tasks = useInspectionTaskStore((state) => state.rows);
  const loadTasks = useInspectionTaskStore((state) => state.load);
  const events = useLocationEventStore((state) => state.rows);
  const loadEvents = useLocationEventStore((state) => state.load);

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [buildingId, setBuildingId] = useState<number>(1);
  const [floor, setFloor] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    void Promise.all([loadDevices(), loadBuildings(), loadTasks(), loadEvents()]).then(() => undefined);
  }, [loadDevices, loadBuildings, loadTasks, loadEvents]);

  const selectedDevice = devices.find((device) => device.id === selectedDeviceId) ?? devices[0] ?? null;

  useEffect(() => {
    if (selectedDevice) {
      setBuildingId(selectedDevice.building_id);
      setFloor(selectedDevice.floor);
      setLocationDesc(selectedDevice.location_desc);
      void loadEvents({ device_id: selectedDevice.id });
    }
  }, [selectedDevice?.id, loadEvents]);

  const affectedTasks = useMemo(
    () => tasks.filter((task) => task.device_id === selectedDevice?.id),
    [tasks, selectedDevice?.id]
  );

  const submitRelocation = async () => {
    if (!selectedDevice) return;
    await relocate(selectedDevice.id, {
      building_id: Number(buildingId),
      floor,
      location_desc: locationDesc,
      note: "管理员台账调整"
    });
    setFeedback("位置已更新：未开始任务已迁移，进行中/待复核任务保留旧位置并标出差异。");
    await Promise.all([loadTasks(), loadEvents({ device_id: selectedDevice.id })]);
  };

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>消防设备台账</h1>
          <p className="muted">管理员调整楼栋/楼层/位置后，系统自动分流关联任务并记录处理经过。</p>
        </div>
      </header>

      <div className="workbench">
        <div className="panel wide">
          <h2>设备列表</h2>
          <div className="table">
            {devices.map((device) => (
              <article
                key={device.id}
                className={`row selectable ${selectedDevice?.id === device.id ? "selected" : ""}`}
                onClick={() => setSelectedDeviceId(device.id)}
              >
                <div>
                  <strong>{device.device_code}</strong>
                  <div className="muted">{formatLocation({ building_id: device.building_id, floor: device.floor, location_desc: device.location_desc }, buildings)}</div>
                </div>
                <StatusBadge value={device.status} />
              </article>
            ))}
          </div>
        </div>

        {selectedDevice && (
          <div className="panel">
            <h2>调整位置 · {selectedDevice.device_code}</h2>
            <label>
              楼栋
              <select value={buildingId} onChange={(event) => setBuildingId(Number(event.target.value))}>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </label>
            <label>
              楼层
              <input value={floor} onChange={(event) => setFloor(event.target.value)} />
            </label>
            <label>
              位置描述
              <input value={locationDesc} onChange={(event) => setLocationDesc(event.target.value)} />
            </label>
            <button className="primary" onClick={() => void submitRelocation()}>保存新位置</button>
            {feedback && <p className="inline-message success">{feedback}</p>}

            <div className="affected-tasks">
              <h3>关联任务分流预览</h3>
              {affectedTasks.length === 0 && <p className="muted">无关联任务。</p>}
              {affectedTasks.map((task) => (
                <div key={task.id} className="row">
                  <span>任务 #{task.id}（{task.status}）</span>
                  <span className="loc-tag loc-neutral">{LocationResolutionText[task.location_resolution]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <TimelineList events={events} buildings={buildings} title={`设备 #${selectedDevice?.id ?? ""} 位置处理经过`} />
    </section>
  );
}
