import { useEffect, useMemo, useState } from "react";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useLocationEventStore } from "../stores/LocationEventStore";
import { useLocationResolution } from "../hooks/useLocationResolution";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { ChecklistPanel } from "../components/common/ChecklistPanel";
import { TimelineList } from "../components/common/TimelineList";
import { StatusBadge } from "../components/common/StatusBadge";
import { LocationResolutionText } from "../constants/LocationResolution";
import { formatDate, formatLocation } from "../utils/formatters";

export function TasksPage() {
  const tasks = useInspectionTaskStore((state) => state.rows);
  const loadTasks = useInspectionTaskStore((state) => state.load);
  const devices = useFireDeviceStore((state) => state.rows);
  const loadDevices = useFireDeviceStore((state) => state.load);
  const buildings = useBuildingStore((state) => state.rows);
  const loadBuildings = useBuildingStore((state) => state.load);
  const results = useInspectionResultStore((state) => state.rows);
  const loadResults = useInspectionResultStore((state) => state.load);
  const events = useLocationEventStore((state) => state.rows);
  const loadEvents = useLocationEventStore((state) => state.load);
  const { message, submitAtTaskLocation, decide } = useLocationResolution();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    void Promise.all([loadTasks(), loadDevices(), loadBuildings(), loadResults(), loadEvents()]).then(() => undefined);
  }, [loadTasks, loadDevices, loadBuildings, loadResults, loadEvents]);

  const deviceMap = useMemo(() => new Map(devices.map((device) => [device.id, device])), [devices]);
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0] ?? null;

  useEffect(() => {
    if (selected?.device_id != null) void loadEvents({ device_id: selected.device_id });
  }, [selected?.device_id, selected?.location_resolution, loadEvents]);

  const selectedResults = useMemo(
    () => results.filter((result) => result.task_id === selected?.id),
    [results, selected?.id]
  );

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>巡检任务</h1>
          <p className="muted">任务位置在下发时锁定；设备换位后，未开始任务跟随迁移，进行中/待复核任务保留旧位置并等待裁决。</p>
        </div>
        <StatusBadge value={`${tasks.filter((task) => task.location_resolution === "PENDING").length} PENDING`} />
      </header>

      <div className="workbench">
        <div className="panel wide">
          <h2>任务列表</h2>
          <div className="table">
            {tasks.map((task) => {
              const device = deviceMap.get(task.device_id ?? -1);
              return (
                <article
                  key={task.id}
                  className={`row selectable ${selected?.id === task.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(task.id)}
                >
                  <div>
                    <strong>任务 #{task.id}</strong>
                    <div className="muted">
                      {device?.device_code} · 计划 {formatDate(task.plan_date)} ·{" "}
                      {formatLocation(
                        { building_id: task.snapshot_building_id, floor: task.snapshot_floor, location_desc: task.snapshot_location_desc },
                        buildings
                      )}
                    </div>
                  </div>
                  <StatusBadge value={task.status} />
                  {task.location_resolution === "PENDING" && (
                    <span className="loc-tag loc-pending">{LocationResolutionText.PENDING}</span>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="panel">
            <h2>任务 #{selected.id} 位置快照</h2>
            <DeviceLocationCell task={selected} device={deviceMap.get(selected.device_id ?? -1)} buildings={buildings} />
            {selected.location_resolved_at && (
              <p className="muted">
                裁决时间：{formatDate(selected.location_resolved_at)}
                {selected.location_resolved_note ? ` · ${selected.location_resolved_note}` : ""}
              </p>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="workbench">
          <ChecklistPanel
            key={selected.id}
            task={selected}
            buildings={buildings}
            onSubmit={async (payload) => submitAtTaskLocation({ task_id: selected.id, ...payload })}
            message={message}
          />

          <div className="panel">
            <h2>主管裁决</h2>
            {selected.location_resolution === "PENDING" ? (
              <>
                <p className="muted">设备已换到新位置，巡检员仍按旧位置作业。请确认原位置是否仍然有效：</p>
                <textarea
                  rows={2}
                  placeholder="裁决说明（可选）"
                  value={resolutionNote}
                  onChange={(event) => setResolutionNote(event.target.value)}
                />
                <div className="button-row">
                  <button className="keep" onClick={() => void decide(selected, "KEEP_ORIGINAL", resolutionNote)}>
                    确认原位置有效
                  </button>
                  <button className="reinspect" onClick={() => void decide(selected, "REINSPECT_NEW", resolutionNote)}>
                    要求按新位置重检
                  </button>
                </div>
              </>
            ) : (
              <p className="muted">
                当前状态：<strong>{LocationResolutionText[selected.location_resolution]}</strong>，无需裁决。
              </p>
            )}
          </div>
        </div>
      )}

      <div className="workbench">
        <div className="panel wide">
          <h2>已提交结果（按提交时位置记录）</h2>
          {selectedResults.length === 0 && <p className="muted">暂无提交记录。</p>}
          {selectedResults.map((result) => (
            <article key={result.id} className={`row ${result.superseded ? "superseded" : ""}`}>
              <div>
                <strong>{result.item_code}</strong>
                <div className="muted">
                  {formatLocation({ building_id: result.building_id, floor: result.floor, location_desc: result.location_desc }, buildings)}
                  {" · "}{result.measured_value || "—"}
                  {result.note ? ` · ${result.note}` : ""}
                </div>
              </div>
              {result.superseded && <span className="loc-tag loc-reinspect">旧位置结果已作废</span>}
            </article>
          ))}
        </div>

        <TimelineList events={events} buildings={buildings} />
      </div>
    </section>
  );
}
