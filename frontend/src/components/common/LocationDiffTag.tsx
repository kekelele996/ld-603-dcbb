import type { ReactNode } from "react";

type Tone = "pending" | "keep" | "reinspect" | "closed" | "neutral" | "danger";

const toneClass: Record<Tone, string> = {
  pending: "loc-pending",
  keep: "loc-keep",
  reinspect: "loc-reinspect",
  closed: "loc-closed",
  neutral: "loc-neutral",
  danger: "loc-danger"
};

// 位置差异标记：旧位置、新位置、差异状态共用这一个展示组件
export function LocationDiffTag({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`loc-tag ${toneClass[tone]}`}>{children}</span>;
}
