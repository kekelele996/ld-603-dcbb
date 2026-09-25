import { useEffect, useMemo, useState } from "react";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { StatusBadge } from "../components/common/StatusBadge";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useRoleStore } from "../stores/RoleStore";
import type { FireDevice } from "../types/FireDevice";
import { formatDate } from "../utils/formatters";

export function DevicesPage() {
  const role = useRoleStore((state) => state.role);
  const deviceStore = useFireDeviceStore();
  const buildingStore = useBuildingStore();
  const taskStore = useInspectionTaskStore();
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [buildingId, setBuildingId] = useState<number>(1);
  const [floor, setFloor] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void deviceStore.load();
    void buildingStore.load();
    void taskStore.load();
  }, [deviceStore, buildingStore, taskStore]);

  const selected = useMemo(
    () => deviceStore.rows.find((row) => row.id === selectedId) ?? deviceStore.rows[0] ?? null,
    [deviceStore.rows, selectedId]
  );

  useEffect(() => {
    if (selected) {
      setBuildingId(selected.building_id);
      setFloor(selected.floor);
      setLocationDesc(selected.location_desc);
      setMessage("");
      setError("");
    }
  }, [selected]);

  const tasksForDevice = (device: FireDevice) => taskStore.rows.filter((task) => task.device_id === device.id);
  const canRelocate = role === "admin";

  const handleRelocate = async () => {
    setMessage("");
    setError("");
    if (!selected) return;
    if (!floor.trim() || !locationDesc.trim()) {
      setError(ERROR_MESSAGES.LOCATION_REQUIRED);
      return;
    }
    try {
      await deviceStore.relocate(selected.id, {
        building_id: buildingId,
        floor: floor.trim(),
        location_desc: locationDesc.trim(),
        operator_role: role
      });
      await taskStore.load();
      setMessage("设备位置已更新：未开始任务已改派，进行中/待复核任务保留旧位置并标出差异。");
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(code === "RBAC_DENIED" ? ERROR_MESSAGES.RBAC_DENIED : ERROR_MESSAGES.VALIDATION_FAILED);
    }
  };

  return (
    <section className="page-body">
      <div className="page-head">
        <div>
          <p className="eyebrow">fire-inspect / devices</p>
          <h1>消防设备台账</h1>
          <p className="muted">管理员调整设备楼栋 / 楼层 / 位置后，系统按任务状态自动改派或保留旧位置并标出差异。</p>
        </div>
      </div>

      <div className="split-layout">
        <div className="panel">
          <h2>设备列表（{deviceStore.rows.length}）</h2>
          <div className="task-list">
            {deviceStore.rows.map((device) => (
              <article
                key={device.id}
                className={"task-card" + (selected?.id === device.id ? " active" : "")}
                onClick={() => setSelectedId(device.id)}
              >
                <div className="task-card-head">
                  <strong>{device.device_code}</strong>
                  <StatusBadge value={device.status} />
                </div>
                <DeviceLocationCell device={device} buildings={buildingStore.rows} />
                <p className="muted">下次维保 {formatDate(device.next_maintenance_at)}</p>
              </article>
            ))}
          </div>
        </div>

        {selected && (
          <div className="panel detail-panel">
            <div className="detail-head">
              <h2>{selected.device_code} 位置调整</h2>
            </div>

            <div className="form-grid">
              <label>新楼栋
                <select value={buildingId} onChange={(e) => setBuildingId(Number(e.target.value))} disabled={!canRelocate}>
                  {buildingStore.rows.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>新楼层
                <input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="如 3F" disabled={!canRelocate} />
              </label>
              <label className="span-2">新具体位置
                <input value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} disabled={!canRelocate} />
              </label>
            </div>
            {!canRelocate && <p className="form-error">当前角色（{role}）不能修改设备位置，仅管理员可操作。</p>}
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-ok">{message}</p>}
            <button className="primary" disabled={!canRelocate} onClick={handleRelocate}>保存新位置</button>

            <div className="result-records">
              <h3>关联任务（{tasksForDevice(selected).length}）</h3>
              {tasksForDevice(selected).map((task) => (
                <div key={task.id} className="result-record">
                  <div className="task-card-head">
                    <strong>任务 #{task.id}</strong>
                    <StatusBadge value={task.status} />
                  </div>
                  <p>任务位置：<strong>楼栋#{task.snapshot_building_id} {task.snapshot_floor} / {task.snapshot_location_desc}</strong></p>
                  <p className="muted">设备现位置：楼栋#{task.current_building_id} {task.current_floor} / {task.current_location_desc}</p>
                </div>
              ))}
              {!tasksForDevice(selected).length && <div className="empty">该设备暂无关联任务</div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
