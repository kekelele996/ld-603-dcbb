import type { TaskLocationHistoryItem } from "../../types/InspectionTask";
import { formatDate } from "../../utils/formatters";

// 任务位置处理经过：换位、拦截、主管确认/重检、重提全程留痕，重开页面仍可见
export function TimelineList({ items }: { items: TaskLocationHistoryItem[] }) {
  if (!items.length) return <div className="empty">暂无处理经过</div>;
  return (
    <ol className="timeline">
      {[...items].reverse().map((item, index) => (
        <li key={`${item.at}-${index}`} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-body">
            <div className="timeline-head">
              <strong>{item.action}</strong>
              <span className="timeline-meta">{formatDate(item.at)} · {item.operator_role}</span>
            </div>
            <p>{item.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
