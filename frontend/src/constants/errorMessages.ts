export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  LOCATION_CONFLICT: "提交位置与任务下发位置不一致，结果未写入，请联系主管处理冲突",
  TASK_NOT_FOUND: "巡检任务不存在或已被删除",
  DEVICE_NOT_FOUND: "消防设备不存在或已被删除",
  RESULT_NOT_FOUND: "巡检结果不存在",
  CONFLICT_ALREADY_RESOLVED: "该任务的位置冲突已经处理完成",
  LOCATION_REQUIRED: "楼栋、楼层和具体位置都必须填写"
};
