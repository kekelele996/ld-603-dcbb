import { useEffect, useMemo, useState } from "react";
import { ChecklistPanel } from "../components/common/ChecklistPanel";
import { LocationResolvePanel } from "../components/common/LocationResolvePanel";
import { StatusBadge } from "../components/common/StatusBadge";
import { TaskLocationCell } from "../components/common/TaskLocationCell";
import { TimelineList } from "../components/common/TimelineList";
import { LocationState, LocationStateText } from "../constants/LocationState";
import { useBuildingStore } from "../stores/BuildingStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useRoleStore } from "../stores/RoleStore";
import type { InspectionTask } from "../types/InspectionTask";
import { formatDate } from "../utils/formatters";

const FILTERS = ["ALL", ...LocationState] as const;

export function TasksPage() {
  const role = useRoleStore((state) => state.role);
  const taskStore = useInspectionTaskStore();
  const resultStore = useInspectionResultStore();
  const buildingStore = useBuildingStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [activeId, setActiveId] = useState<number | null>(1);

  useEffect(() => {
    void taskStore.load();
    void resultStore.load();
    void buildingStore.load();
  }, [taskStore, resultStore, buildingStore]);

  const tasks = useMemo(
    () => (filter === "ALL" ? taskStore.rows : taskStore.rows.filter((row) => row.location_state === filter)),
    [taskStore.rows, filter]
  );
  const active = tasks.find((task) => task.id === activeId) ?? tasks[0] ?? null;

  const resultsOf = (task: InspectionTask) =>
    resultStore.rows.filter((row) => row.task_id === task.id);

  return (
    <section className="page-body">
      <div className="page-head">
        <div>
          <p className="eyebrow">fire-inspect / tasks</p>
          <h1>巡检任务</h1>
          <p className="muted">任务下发时冻结楼栋 / 楼层 / 位置；设备换位后，未开始任务改派新位置，进行中或待复核任务保留旧位置并标出差异。</p>
        </div>
      </div>

      <div className="filter-bar">
        {FILTERS.map((value) => (
          <button key={value} className={filter === value ? "chip active" : "chip"} onClick={() => setFilter(value)}>
            {value === "ALL" ? "全部" : LocationStateText[value]}
          </button>
        ))}
      </div>

      <div className="split-layout">
        <div className="panel">
          <h2>任务列表（{tasks.length}）</h2>
          <div className="task-list">
            {tasks.map((task) => (
              <article
                key={task.id}
                className={"task-card" + (active?.id === task.id ? " active" : "")}
                onClick={() => setActiveId(task.id)}
              >
                <div className="task-card-head">
                  <strong>#{task.id} {task.task_type}</strong>
                  <StatusBadge value={task.status} />
                </div>
                <TaskLocationCell task={task} buildings={buildingStore.rows} compact={active?.id !== task.id} />
                <div className="task-card-foot">
                  <span>计划 {formatDate(task.plan_date)}</span>
                </div>
              </article>
            ))}
            {!tasks.length && <div className="empty">当前筛选下没有任务</div>}
          </div>
        </div>

        {active && (
          <div className="panel detail-panel">
            <div className="detail-head">
              <h2>任务 #{active.id} 详情</h2>
              <StatusBadge value={active.status} />
            </div>
            <TaskLocationCell task={active} buildings={buildingStore.rows} />

            {active.location_resolution_note && (
              <div className="alert info">
                <strong>主管处理意见（{active.location_resolution === "KEEP_OLD" ? "确认原位置有效" : "要求按新位置重检"}）</strong>
                <p>{active.location_resolution_note}</p>
                <p className="muted">处理人：{active.location_resolved_by} · {formatDate(active.location_resolved_at)}</p>
              </div>
            )}

            <div className="result-records">
              <h3>结果记录（按任务位置归属）</h3>
              {resultsOf(active).length === 0 && <div className="empty">暂无结果记录；冲突提交不会出现在这里。</div>}
              {resultsOf(active).map((row) => (
                <div key={row.id} className={"result-record" + (row.is_superseded ? " superseded" : "")}>
                  <div>
                    <strong>{row.item_code}</strong>
                    <span className="muted"> {row.measured_value}</span>
                    {row.is_superseded && <span className="badge location-danger">已作废（旧位置）</span>}
                  </div>
                  <p className="muted">
                    检查位置：楼栋#{row.submit_building_id} {row.submit_floor} / {row.submit_location_desc}
                  </p>
                  <p className="muted">{row.note} · {formatDate(row.created_at)}</p>
                </div>
              ))}
            </div>

            <ChecklistPanel task={active} buildings={buildingStore.rows} role={role} onSubmitted={() => void taskStore.load()} />
            <LocationResolvePanel task={active} role={role} onResolved={() => void taskStore.load()} />

            <div className="history-block">
              <h3>处理经过</h3>
              <TimelineList items={active.history} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
