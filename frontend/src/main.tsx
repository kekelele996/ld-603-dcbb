import { useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { ROLE_TEXT, useRoleStore, type AppRole } from "./stores/RoleStore";
import { DevicesPage } from "./pages/DevicesPage";
import { TasksPage } from "./pages/TasksPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HazardsPage } from "./pages/HazardsPage";
import { ReportsPage } from "./pages/ReportsPage";
import "./styles.css";

const pageMap: Record<string, () => JSX.Element> = {
  "/dashboard": DashboardPage,
  "/devices": DevicesPage,
  "/tasks": TasksPage,
  "/hazards": HazardsPage,
  "/reports": ReportsPage
};

function CurrentPage({ route }: { route: string }) {
  const Page = pageMap[route] ?? DashboardPage;
  return <Page />;
}

function App() {
  const [active, setActive] = useState<string>(routes[2]?.route ?? "/tasks");
  const role = useRoleStore((state) => state.role);
  const setRole = useRoleStore((state) => state.setRole);
  const current = routes.find((route) => route.route === active) ?? routes[0];

  return (
    <div className="shell">
      <aside>
        <div className="brand">消防设施巡检维保平台</div>
        <nav>
          {routes.map((route) => (
            <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>
              {route.name}
            </button>
          ))}
        </nav>
        <div className="role-box">
          <label htmlFor="role-select">当前角色（演示 RBAC）</label>
          <select id="role-select" value={role} onChange={(e) => setRole(e.target.value as AppRole)}>
            {(Object.keys(ROLE_TEXT) as AppRole[]).map((value) => (
              <option key={value} value={value}>{ROLE_TEXT[value]}</option>
            ))}
          </select>
        </div>
      </aside>
      <main className="page">
        <CurrentPage route={current?.route ?? "/dashboard"} />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
