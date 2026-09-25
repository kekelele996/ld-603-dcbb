from fastapi import APIRouter, Request
from src.controllers.inspection_result_controller import list_inspection_result, submit_inspection_result

router = APIRouter(prefix="/api/inspection-result", tags=["InspectionResult"])
router.get("")(list_inspection_result)


@router.post("/submit")
async def submit(request: Request):
    payload = await request.json()
    payload.setdefault("operator_role", getattr(request.state, "user", {}).get("role", "inspector"))
    return submit_inspection_result(payload)
