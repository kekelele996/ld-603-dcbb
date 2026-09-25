# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Redux Toolkit |
| 后端 | FastAPI + Python 3.11 + SQLAlchemy 2.0 |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 设备换位—位置冲突—主管复核 业务流程

任务下发时冻结设备的 **楼栋 / 楼层 / 具体位置快照**（`snapshot_building_id / snapshot_floor / snapshot_location_desc`），设备表上的当前位置另存，两条线分开，避免“任务页还显示旧位置、旧记录看不出查的是哪一处”。

1. **任务下发** `POST /api/inspection-task/dispatch`：按设备当前位置生成快照，状态 `SYNCED`，并写入首条处理经过。
2. **管理员改设备位置** `PATCH /api/fire-device/{id}/relocate`（仅 admin）：
   - 任务状态 `PLANNED`（未开始）：快照直接换到新位置，任务标记 `MOVED_PENDING`（已改派新位置）；
   - 任务状态 `IN_PROGRESS / SUBMITTED / OVERDUE`（进行中/待复核）：**保留旧快照**，仅刷新 `current_*`，任务标记 `DIVERGED`（位置有差异），任务卡片同时显示“任务位置 / 设备现位置”。
3. **巡检员提交结果** `POST /api/inspection-result/submit`：请求必须带现场位置。后端逐段比对楼栋、楼层、具体位置：
   - 与任务快照一致才写入，结果挂在任务位置，**不会写到设备新位置**；
   - 对不上返回 `409 LOCATION_CONFLICT`（错误体含任务位置、提交位置、设备台账位置三处对照），任务升级为 `CONFLICT`，前端 ChecklistPanel 弹冲突提示，本次结果不落库。
4. **主管处理冲突** `POST /api/inspection-task/{id}/resolve-location`（仅 supervisor/admin）：
   - `KEEP_OLD` 确认原位置有效：任务变 `CONFIRMED_OLD`，巡检员按旧位置补交，任务、结果与旧位置台账对应；
   - `REINSPECT_NEW` 要求按新位置重检：任务快照刷新为设备新位置、状态回到 `IN_PROGRESS`，旧结果置 `is_superseded=true`（作废但保留），重检通过后任务、结果与新台账对应。
5. **处理经过可追溯**：任务 `history`（数据库 `task_location_history` 表）记录下发、换位、拦截、主管处置、重提每一步的时间、操作角色和说明；重开页面通过 `TimelineList` 仍能看到全过程。结果记录上标注实际检查位置，作废记录以“已作废（旧位置）”展示。

演示角色可在左侧栏切换（巡检员 / 维保商 / 物业主管 / 管理员 / 审计员），角色持久化在 localStorage，按钮显隐与后端 RBAC 双重校验。

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `fire-inspect`
- `FRONTEND_PORT`: 前端端口，默认 `20103`
- `BACKEND_PORT`: 后端端口，默认 `21103`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: constants/DeviceType、types/DeviceType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- InspectionStatus: constants/InspectionStatus、types/InspectionStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HazardSeverity: constants/HazardSeverity、types/HazardSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- LocationState（SYNCED / MOVED_PENDING / DIVERGED / CONFLICT / CONFIRMED_OLD / REINSPECT_NEW）：
  - 后端：`constants/location_state.py`（含未开始自动改派、进行中保留快照的状态分组）、`models/inspection_task.py`、`services/location_policy.py`、`services/fire_device_service.py`、`services/inspection_task_service.py`、`services/inspection_result_service.py`、`constructors/inspection_task_factory.py`、`seed.py`、`database/init.sql`、任务控制器/路由。
  - 前端：`constants/LocationState.ts`（文案+配色）、`constants/statusText.ts`、`types/InspectionTask.ts`、`components/common/LocationStateBadge.tsx`、`components/common/TaskLocationCell.tsx`、`components/common/ChecklistPanel.tsx`、`pages/TasksPage.tsx` 筛选器、`mocks/mockEngine.ts`。
- LocationConflictType（NONE / BUILDING_MISMATCH / FLOOR_MISMATCH / LOCATION_MISMATCH / MOVED_DEVICE）：
  - 后端：`constants/location_conflict_type.py`、`services/location_policy.py`、`services/inspection_result_service.py`（409 details）、`models/inspection_task.py`、`seed.py`、`database/init.sql`。
  - 前端：`constants/LocationConflict.ts`、`types/locationPayloads.ts`、`components/common/ChecklistPanel.tsx`、`components/common/LocationResolvePanel.tsx`、`mocks/mockEngine.ts`。
- LocationResolution（KEEP_OLD / REINSPECT_NEW）：
  - 后端：`constants/location_resolution.py`、`services/inspection_task_service.py`、`controllers/inspection_task_controller.py`（RBAC）、`routes/inspection_task_routes.py`。
  - 前端：`constants/LocationConflict.ts`、`components/common/LocationResolvePanel.tsx`、`api/InspectionTask.ts`、`stores/InspectionTaskStore.ts`、`mocks/mockEngine.ts`。
- 错误码/消息联动：`LOCATION_CONFLICT / TASK_NOT_FOUND / DEVICE_NOT_FOUND / CONFLICT_ALREADY_RESOLVED / LOCATION_REQUIRED` 同时出现在后端 `constants/error_codes.py`、`constants/error_messages.py`、`services/errors.py`、各 service 抛错点、`main.py` 异常处理，以及前端 `constants/errorCodes.ts`、`constants/errorMessages.ts`、`api/*`、提交/处置面板提示。
- 日志模板联动：换位与冲突相关模板见后端 `constants/log_templates.py`（FireDevice.relocate*、InspectionTask.dispatch.snapshot/locationConflict/locationResolve.*、InspectionResult.submit.*）与前端 `constants/logTemplates.ts`，控制器写操作均有审计打印，`audit_log_middleware` 记录 POST/PATCH 写请求。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
