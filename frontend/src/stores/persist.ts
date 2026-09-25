import type { StateCreator } from "zustand";

// 极简 localStorage 持久化中间件：避免引入额外依赖，重开页面后角色不丢失
export function persist<T extends object>(config: StateCreator<T>, key: string): StateCreator<T> {
  return (set, get, api) => {
    const persistedSet: typeof set = (...args) => {
      set(...args);
      try {
        localStorage.setItem(key, JSON.stringify(api.getState()));
      } catch {
        // 隐私模式下忽略持久化失败
      }
    };
    const state = config(persistedSet, get, api);
    try {
      const raw = localStorage.getItem(key);
      if (raw) return { ...state, ...JSON.parse(raw) };
    } catch {
      // 历史数据损坏时回退默认值
    }
    return state;
  };
}
