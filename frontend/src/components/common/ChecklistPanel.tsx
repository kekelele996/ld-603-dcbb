import { useMemo, useState } from "react";
import { LocationConflictTypeText } from "../../constants/LocationConflict";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import { useInspectionResultStore } from "../../stores/InspectionResultStore";
import type { Building } from "../../types/Building";
import type { InspectionTask } from "../../types/InspectionTask";
import type { LocationConflictDetails } from "../../types/locationPayloads";
import { formatLocation } from "../../utils/formatters";
import { LocationStateBadge } from "./LocationStateBadge";
import { StatusBadge } from "./StatusBadge";

type Props = {
  task: InspectionTask;
  buildings: Building[];
  role: string;
  onSubmitted?: () => void;
};

export function ChecklistPanel({ task, buildings, role, onSubmitted }: Props) {
  const submit = useInspectionResultStore((state) => state.submit);
  const [itemCode, setItemCode] = useState(task.task_type === "HYDRANT" ? "HYDRANT_PRESSURE" : "GENERAL_CHECK");
  const [measuredValue, setMeasuredValue] = useState("");
  const [note, setNote] = useState("");
  // 默认按“任务下发位置”填写，巡检员扫码/手动改成现场位置时才会触发比对
  const [buildingId, setBuildingId] = useState<number>(task.snapshot_building_id);
  const [floor, setFloor] = useState(task.snapshot_floor);
  const [locationDesc, setLocationDesc] = useState(task.snapshot_location_desc);
  const [blocked, setBlocked] = useState<LocationConflictDetails | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const buildingName = useMemo(
    () => (id?: number) => buildings.find((item) => item.id === id)?.name ?? `楼栋#${id ?? ""}`,
    [buildings]
  );

  const blockedPending = task.location_state === "CONFLICT";

  const handleSubmit = async () => {
    setError("");
    setOk("");
    setBlocked(null);
    setSubmitting(true);
    try {
      await submit({
        task_id: task.id,
        item_code: itemCode,
        result_status: "NORMAL",
        measured_value: measuredValue,
        note,
        submit_building_id: buildingId,
        submit_floor: floor,
        submit_location_desc: locationDesc,
        operator_role: role
      });
      setOk("提交成功：结果已按任务位置写入");
      onSubmitted?.();
    } catch (e) {
      const err = e as { code?: string; details?: LocationConflictDetails };
      if (err.code === "LOCATION_CONFLICT" && err.details) {
        setBlocked(err.details);
      } else if (err.code === "RBAC_DENIED") {
        setError(ERROR_MESSAGES.RBAC_DENIED);
      } else {
        setError(ERROR_MESSAGES.LOCATION_CONFLICT);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checklist">
      <div className="checklist-head">
        <h3>检查项提交</h3>
        <LocationStateBadge value={task.location_state} />
      </div>

      <div className="checklist-snapshot">
        <span className="loc-tag">任务下发位置</span>
        <strong>
          {formatLocation(buildingName(task.snapshot_building_id), task.snapshot_floor, task.snapshot_location_desc)}
        </strong>
      </div>

      {blockedPending && (
        <div className="alert danger">
          <strong>位置冲突等待主管处理</strong>
          <p>该任务已存在位置冲突（{LocationConflictTypeText[task.location_conflict_type] ?? task.location_conflict_type}），
          主管确认原位置有效或要求按新位置重检前，任何位置的提交都不会写入。</p>
        </div>
      )}

      {blocked && (
        <div className="alert danger">
          <strong>提交被拦截：{LocationConflictTypeText[blocked.conflict_type as keyof typeof LocationConflictTypeText] ?? blocked.conflict_type}</strong>
          <p>
            任务位置：{formatLocation(buildingName(blocked.snapshot.building_id), blocked.snapshot.floor, blocked.snapshot.location_desc)}
            <br />
            提交位置：{formatLocation(buildingName(blocked.submitted.building_id), blocked.submitted.floor, blocked.submitted.location_desc)}
            <br />
            设备台账位置：{formatLocation(buildingName(blocked.device_current.building_id), blocked.device_current.floor, blocked.device_current.location_desc)}
          </p>
          <p>结果没有写入新位置，请联系主管：确认原位置有效，或要求按新位置重检。</p>
        </div>
      )}

      <div className="form-grid">
        <label>检查项
          <select value={itemCode} onChange={(e) => setItemCode(e.target.value)}>
            <option value="HYDRANT_PRESSURE">消火栓压力</option>
            <option value="SMOKE_TEST">烟感测试</option>
            <option value="EXIT_INDICATOR">疏散指示灯</option>
            <option value="GENERAL_CHECK">一般外观检查</option>
          </select>
        </label>
        <label>实测值
          <input value={measuredValue} onChange={(e) => setMeasuredValue(e.target.value)} placeholder="如 1.1MPa / 正常" />
        </label>
        <label>现场楼栋
          <select value={buildingId} onChange={(e) => setBuildingId(Number(e.target.value))}>
            {buildings.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>现场楼层
          <input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="如 3F" />
        </label>
        <label className="span-2">现场具体位置
          <input value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} placeholder="扫码或手动填写" />
        </label>
        <label className="span-2">备注
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </label>
      </div>

      <div className="checklist-actions">
        <button className="primary" disabled={submitting || blockedPending} onClick={handleSubmit}>
          {submitting ? "提交中…" : "按任务位置提交结果"}
        </button>
        {ok && <StatusBadge value="SUBMIT_OK" />}
        {error && <span className="form-error">{error}</span>}
      </div>
    </div>
  );
}
