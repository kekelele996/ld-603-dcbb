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
- LocationResolution（设备换位差异处理状态 NONE/PENDING/KEEP_ORIGINAL/REINSPECT_NEW/SUPERSEDED）:
  - 后端：`backend/src/constants/location_resolution.py`、`models/inspection_task.py`、`repositories/inspection_task_repository.py`、`services/fire_device_service.py`、`services/inspection_task_service.py`、`services/inspection_result_service.py`、`constructors/inspection_task_factory.py`、`seed.py`、`database/init.sql`。
  - 前端：`frontend/src/constants/LocationResolution.ts`、`types/InspectionTask.ts`、`mocks/seedData.ts`、`mocks/mockEngine.ts`、`utils/formatters.ts`、`components/common/DeviceLocationCell.tsx`、`pages/TasksPage.tsx`、`pages/DevicesPage.tsx`、`hooks/useLocationResolution.ts`。
- LocationEventType（换位处理时间线动作）:
  - 后端：`backend/src/constants/location_event_type.py`、`models/location_event.py`、`constructors/location_event_factory.py`、`repositories/location_event_repository.py`、`services/location_event_service.py`、`controllers/location_event_controller.py`、`routes/location_event_routes.py`。
  - 前端：`frontend/src/constants/LocationEventType.ts`、`types/LocationEvent.ts`、`constructors/LocationEventConstructor.ts`、`api/LocationEvent.ts`、`stores/LocationEventStore.ts`、`components/common/TimelineList.tsx`。
- 换位相关错误码（LOCATION_CONFLICT / TASK_NOT_PENDING / ENTITY_NOT_FOUND）: 后端 `constants/error_codes.py` + `constants/error_messages.py` + `utils/service_error.py`，前端 `constants/errorCodes.ts` + `constants/errorMessages.ts`，由 service 抛出、controller/页面分别包装提示。

## 设备换位处理流程

1. **任务下发锁定位置**：任务保存 `device_id` 与楼栋/楼层/位置快照（`snapshot_*`）；结果提交时按任务快照写入 `building_id/floor/location_desc`，旧记录能直接看出检查的是哪一处。
2. **管理员换位**：`PATCH /api/fire-device/{id}/relocation`。`PLANNED` 任务快照自动迁移到新位置；`IN_PROGRESS/SUBMITTED` 任务保留旧位置并置 `location_resolution=PENDING`；`REVIEWED/OVERDUE` 只写时间线留痕。
3. **巡检员提交**：`POST /api/inspection-result/submit` 按任务位置校验，位置不一致返回 `409 LOCATION_CONFLICT`，结果不会写到新位置。
4. **主管裁决**：`POST /api/inspection-task/{id}/location-resolution`，`KEEP_ORIGINAL` 确认原位置有效（台账挂旧位置），`REINSPECT_NEW` 旧结果作废、任务快照切到新位置；巡检员在新位置重检后状态闭环为 `SUPERSEDED`。
5. **处理经过可回溯**：所有动作写入 `location_event`（`GET /api/location-event?device_id=`），前端「位置处理经过」时间线持久展示，重开页面仍可见。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
