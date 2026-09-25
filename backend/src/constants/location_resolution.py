# 设备换位后，任务位置差异的处理状态
# NONE          : 任务快照位置与设备当前位置一致，无差异
# PENDING       : 进行中/待复核任务撞上设备换位，等待主管裁决
# KEEP_ORIGINAL : 主管确认原位置有效，任务与结果维持旧位置（台账挂旧位置）
# REINSPECT_NEW : 主管要求按新位置重检，旧结果作废、任务快照切到新位置
# SUPERSEDED    : 重检任务已在新位置提交结果，差异闭环
LocationResolution = ["NONE", "PENDING", "KEEP_ORIGINAL", "REINSPECT_NEW", "SUPERSEDED"]

# 管理员换位时，哪些状态的任务跟随迁移到新位置，哪些保留旧位置等待裁决
RELOCATION_MIGRATE_STATUSES = ["PLANNED"]
RELOCATION_PENDING_STATUSES = ["IN_PROGRESS", "SUBMITTED"]
RELOCATION_ARCHIVE_STATUSES = ["REVIEWED", "OVERDUE"]

# 主管裁决动作 -> 任务 resolution 取值
RESOLUTION_KEEP = "KEEP_ORIGINAL"
RESOLUTION_REINSPECT = "REINSPECT_NEW"
