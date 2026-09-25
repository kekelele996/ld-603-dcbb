import { useState } from "react";
import { LocationConflictTypeText, LocationResolutionText } from "../../constants/LocationConflict";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import { useInspectionTaskStore } from "../../stores/InspectionTaskStore";
import type { InspectionTask } from "../../types/InspectionTask";

type Props = {
  task: InspectionTask;
  role: string;
  onResolved?: () => void;
};

// 主管处理位置冲突：确认原位置有效，或要求按新位置重检
export function LocationResolvePanel({ task, role, onResolved }: Props) {
  const resolveConflict = useInspectionTaskStore((state) => state.resolveConflict);
  const [resolution, setResolution] = useState<"KEEP_OLD" | "REINSPECT_NEW">("KEEP_OLD");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (task.location_state !== "CONFLICT") return null;

  const canResolve = role === "supervisor" || role === "admin";

  const handleResolve = async () => {
    setError("");
    setBusy(true);
    try {
      await resolveConflict(task.id, { resolution, note, operator_role: role });
      onResolved?.();
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(code === "RBAC_DENIED" ? ERROR_MESSAGES.RBAC_DENIED : ERROR_MESSAGES.VALIDATION_FAILED);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="resolve-panel">
      <h3>位置冲突处理（主管）</h3>
      <p className="muted">
        冲突类型：{LocationConflictTypeText[task.location_conflict_type] ?? task.location_conflict_type}
      </p>
      <div className="resolve-options">
        <label className={resolution === "KEEP_OLD" ? "selected" : ""}>
          <input type="radio" checked={resolution === "KEEP_OLD"} onChange={() => setResolution("KEEP_OLD")} disabled={!canResolve || busy} />
          <div>
            <strong>{LocationResolutionText.KEEP_OLD}</strong>
            <p>任务、结果继续按下发时的旧位置对应，差异记录保留；巡检员按任务位置补交结果。</p>
          </div>
        </label>
        <label className={resolution === "REINSPECT_NEW" ? "selected" : ""}>
          <input type="radio" checked={resolution === "REINSPECT_NEW"} onChange={() => setResolution("REINSPECT_NEW")} disabled={!canResolve || busy} />
          <div>
            <strong>{LocationResolutionText.REINSPECT_NEW}</strong>
            <p>任务改到设备新位置，旧位置结果标记作废；巡检员按新位置重新巡检提交。</p>
          </div>
        </label>
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="处理说明（可选）" disabled={!canResolve || busy} />
      {!canResolve && <p className="form-error">当前角色（{role}）无权处理冲突，仅物业主管/管理员可操作。</p>}
      {error && <p className="form-error">{error}</p>}
      <button className="primary" disabled={!canResolve || busy} onClick={handleResolve}>
        {busy ? "提交中…" : "确认处理意见"}
      </button>
    </div>
  );
}
