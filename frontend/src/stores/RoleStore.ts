import { create } from "zustand";
import { persist } from "./persist";

export type AppRole = "inspector" | "vendor" | "supervisor" | "admin" | "auditor";

export const ROLE_TEXT: Record<AppRole, string> = {
  inspector: "巡检员",
  vendor: "维保商",
  supervisor: "物业主管",
  admin: "管理员",
  auditor: "审计员"
};

type RoleState = {
  role: AppRole;
  setRole: (role: AppRole) => void;
};

// 角色保存在 localStorage，重开页面仍是当前角色（RBAC 按钮显隐、X-Role 请求头共用）
export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "supervisor",
      setRole: (role) => set({ role })
    }),
    "fire-inspect-role"
  )
);
