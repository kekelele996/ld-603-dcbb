from fastapi import APIRouter, Request
from src.controllers.inspection_result_controller import list_inspection_result, submit_inspection_result
router = APIRouter(prefix="/api/inspection-result", tags=["InspectionResult"])
router.get("")(list_inspection_result)


@router.post("/submit")
async def submit(payload: dict, request: Request):
    # 巡检员按任务位置提交，对不上返回 LOCATION_CONFLICT，不会写到新位置
    return submit_inspection_result(payload, getattr(request.state, "user", None))
