# 位置差异处理时间线（LocationEvent）上的动作类型
# DEVICE_RELOCATED    : 管理员修改设备楼栋/楼层/位置
# TASK_MIGRATED       : 未开始任务跟随设备迁移到新位置
# TASK_CONFLICTED     : 进行中/待复核任务保留旧位置，标记待裁决
# TASK_ARCHIVED       : 已复核/已逾期任务留痕，不再产生冲突
# RESULT_CONFLICT     : 巡检员按新位置提交被拦截
# RESULT_SUPERSEDED   : 主管要求重检，旧位置结果作废
# RESULT_RESUBMITTED  : 巡检员在新位置重新提交结果
# RESOLUTION_KEEP     : 主管确认原位置有效
# RESOLUTION_REINSPECT: 主管要求按新位置重检
LocationEventType = [
    "DEVICE_RELOCATED",
    "TASK_MIGRATED",
    "TASK_CONFLICTED",
    "TASK_ARCHIVED",
    "RESULT_CONFLICT",
    "RESULT_SUPERSEDED",
    "RESULT_RESUBMITTED",
    "RESOLUTION_KEEP",
    "RESOLUTION_REINSPECT",
]
