from fastapi import APIRouter, Depends
from app.schemas.task import TaskResponse, TaskResult
from app.workers.async_runner import get_task

router = APIRouter()

@router.get("/status/{task_id}", response_model=TaskResult)
async def get_task_status(task_id: str):
    task_info = get_task(task_id)
    return {
        "task_id": task_id,
        "status": task_info["status"],
        "result": task_info["result"] if task_info["status"] in ("SUCCESS", "FAILURE") else None
    }
