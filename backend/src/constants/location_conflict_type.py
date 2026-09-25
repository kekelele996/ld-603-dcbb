# 位置冲突类型：巡检员提交的位置与任务下发时保存的位置对不上
# NONE：无冲突
# BUILDING_MISMATCH：楼栋不一致
# FLOOR_MISMATCH：楼层不一致
# LOCATION_MISMATCH：具体位置描述不一致
# MOVED_DEVICE：设备已换位且任务仍按旧位置执行，提交位置指向设备新位置
LocationConflictType = [
    "NONE",
    "BUILDING_MISMATCH",
    "FLOOR_MISMATCH",
    "LOCATION_MISMATCH",
    "MOVED_DEVICE",
]
