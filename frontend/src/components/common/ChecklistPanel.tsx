import { useState } from "react";
import type { InspectionTask } from "../../types/InspectionTask";
import type { Building } from "../../types/Building";
import { formatLocation } from "../../utils/formatters";

type Props = {
  task: InspectionTask;
  buildings: Building[];
  // 返回提交时使用的位置（默认锁定为任务快照位置；巡检员若改成设备新位置会被后端拦截）
  onSubmit: (payload: {
    item_code: string;
    measured_value: string;
    note: string;
    building_id: number;
    floor: string;
    location_desc: string;
  }) => Promise<boolean>;
  message: { tone: "info" | "error" | "success"; text: string } | null;
};

// 巡检员填写检查项：位置默认带任务锁定位置，提交后由 useLocationResolution 处理冲突提示
export function ChecklistPanel({ task, buildings, onSubmit, message }: Props) {
  const [itemCode, setItemCode] = useState("PRESSURE");
  const [measuredValue, setMeasuredValue] = useState("");
  const [note, setNote] = useState("");
  const taskLocation = {
    building_id: task.snapshot_building_id,
    floor: task.snapshot_floor,
    location_desc: task.snapshot_location_desc
  };
  const locked = task.location_resolution !== "REINSPECT_NEW";

  return (
    <div className="panel checklist">
      <h2>检查项提交</h2>
      <p className="muted">
        请按任务标注位置检查：<strong>{formatLocation(taskLocation, buildings)}</strong>
      </p>
      <label>
        检查项
        <select value={itemCode} onChange={(event) => setItemCode(event.target.value)}>
          <option value="PRESSURE">水压</option>
          <option value="APPEARANCE">外观完好</option>
          <option value="ACCESS">通道无遮挡</option>
        </select>
      </label>
      <label>
        实测值
        <input value={measuredValue} onChange={(event) => setMeasuredValue(event.target.value)} placeholder="如 0.35MPa" />
      </label>
      <label>
        楼层 / 位置
        <input
          value={`${task.snapshot_floor ?? ""} ${task.snapshot_location_desc ?? ""}`}
          readOnly={locked}
          onChange={() => undefined}
        />
      </label>
      <label>
        备注
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} />
      </label>
      <button
        className="primary"
        onClick={() =>
          onSubmit({
            item_code: itemCode,
            measured_value: measuredValue,
            note,
            building_id: task.snapshot_building_id as number,
            floor: task.snapshot_floor,
            location_desc: task.snapshot_location_desc
          })
        }
      >
        按任务位置提交
      </button>
      {message && <p className={`inline-message ${message.tone}`}>{message.text}</p>}
    </div>
  );
}
