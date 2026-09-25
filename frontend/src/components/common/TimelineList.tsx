import type { LocationEvent } from "../../types/LocationEvent";
import type { Building } from "../../types/Building";
import { LocationEventTypeText } from "../../constants/LocationEventType";
import { formatDate, formatLocation } from "../../utils/formatters";

type Props = {
  events: LocationEvent[];
  buildings: Building[];
  title?: string;
};

// 换位/冲突/裁决处理经过时间线，任务详情与设备台账共用；数据来自后端，重开页面仍可见
export function TimelineList({ events, buildings, title = "位置处理经过" }: Props) {
  if (!events.length) {
    return (
      <div className="panel">
        <h2>{title}</h2>
        <p className="muted">暂无位置变更记录。</p>
      </div>
    );
  }
  return (
    <div className="panel">
      <h2>{title}</h2>
      <ol className="timeline">
        {events.map((event) => {
          const from = { building_id: event.from_building_id, floor: event.from_floor, location_desc: event.from_location_desc };
          const to = { building_id: event.to_building_id, floor: event.to_floor, location_desc: event.to_location_desc };
          const hasFrom = Boolean(event.from_floor || event.from_location_desc || event.from_building_id);
          const hasTo = Boolean(event.to_floor || event.to_location_desc || event.to_building_id);
          return (
            <li key={event.id} className="timeline-item">
              <div className="timeline-head">
                <strong>{LocationEventTypeText[event.event_type]}</strong>
                <span className="muted">{formatDate(event.created_at)}</span>
              </div>
              {(hasFrom || hasTo) && (
                <div className="timeline-locations">
                  {hasFrom && <span className="timeline-old">旧：{formatLocation(from, buildings)}</span>}
                  {hasFrom && hasTo && <span className="timeline-arrow">→</span>}
                  {hasTo && <span className="timeline-new">新：{formatLocation(to, buildings)}</span>}
                </div>
              )}
              <div className="muted">
                操作人 #{event.actor_id}（{event.actor_role}）
                {event.task_id ? ` · 任务 #${event.task_id}` : ""}
                {event.note ? ` · ${event.note}` : ""}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
