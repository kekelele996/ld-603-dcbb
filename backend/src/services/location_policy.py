"""任务位置快照与设备当前位置的比对策略。

任务下发时会冻结一份设备位置（楼栋 / 楼层 / 具体位置）。
设备换位后：
- 未开始（PLANNED）任务：直接换到新位置；
- 进行中 / 待复核任务：保留旧位置，并标出差异。
巡检员提交结果时按任务位置比对，对不上即视为冲突，禁止写入新位置。
"""
from src.constants.location_conflict_type import LocationConflictType
from src.constants.location_state import (
    TASK_LOCATION_AUTO_MOVE_STATES,
    TASK_LOCATION_KEEP_SNAPSHOT_STATES,
)


def same_location(a_building_id, a_floor, a_location, b_building_id, b_floor, b_location):
    return (
        str(a_building_id) == str(b_building_id)
        and str(a_floor).strip() == str(b_floor).strip()
        and str(a_location).strip() == str(b_location).strip()
    )


def snapshot_matches_device(task: dict, device: dict) -> bool:
    return same_location(
        task.get("snapshot_building_id"),
        task.get("snapshot_floor"),
        task.get("snapshot_location_desc"),
        device.get("building_id"),
        device.get("floor"),
        device.get("location_desc"),
    )


def detect_conflict_type(submit_building_id, submit_floor, submit_location, task: dict) -> str:
    """返回提交位置与任务下发位置快照之间第一处不一致的类型。"""
    if str(submit_building_id) != str(task.get("snapshot_building_id")):
        return "BUILDING_MISMATCH"
    if str(submit_floor).strip() != str(task.get("snapshot_floor")).strip():
        return "FLOOR_MISMATCH"
    if str(submit_location).strip() != str(task.get("snapshot_location_desc")).strip():
        return "LOCATION_MISMATCH"
    return "NONE"


def submitted_location_matches_device(submit_building_id, submit_floor, submit_location, device: dict) -> bool:
    return same_location(
        submit_building_id,
        submit_floor,
        submit_location,
        device.get("building_id"),
        device.get("floor"),
        device.get("location_desc"),
    )


def is_auto_move_task(status: str) -> bool:
    return status in TASK_LOCATION_AUTO_MOVE_STATES


def is_keep_snapshot_task(status: str) -> bool:
    return status in TASK_LOCATION_KEEP_SNAPSHOT_STATES


__all__ = [
    "LocationConflictType",
    "same_location",
    "snapshot_matches_device",
    "detect_conflict_type",
    "submitted_location_matches_device",
    "is_auto_move_task",
    "is_keep_snapshot_task",
]
