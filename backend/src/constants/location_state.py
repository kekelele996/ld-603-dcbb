# 任务位置与设备台账位置的对齐状态
# SYNCED：任务快照与设备当前位置一致
# MOVED_PENDING：设备已换位，未开始的任务已改派到新位置
# DIVERGED：设备已换位，进行中/待复核任务保留旧位置，存在差异
# CONFLICT：巡检员按与任务快照不一致的位置提交，等待主管处理
# CONFIRMED_OLD：主管确认原位置有效，结果按旧位置入账
# REINSPECT_NEW：主管要求按新位置重检，任务已更新到新位置
LocationState = [
    "SYNCED",
    "MOVED_PENDING",
    "DIVERGED",
    "CONFLICT",
    "CONFIRMED_OLD",
    "REINSPECT_NEW",
]

# 未开始的任务在设备换位时直接改到新位置
TASK_LOCATION_AUTO_MOVE_STATES = ["PLANNED"]

# 进行中或待复核的任务保留旧位置并标出差异
TASK_LOCATION_KEEP_SNAPSHOT_STATES = ["IN_PROGRESS", "SUBMITTED", "OVERDUE"]
