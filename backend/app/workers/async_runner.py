"""
In-memory async task runner for Windows compatibility.
Celery's prefork pool doesn't work on Windows, so this module
runs background tasks via asyncio.create_task() instead.
"""
import asyncio
import uuid
import traceback
from typing import Dict, Any

# In-memory store of task statuses and results
_task_store: Dict[str, Dict[str, Any]] = {}


def get_task(task_id: str) -> Dict[str, Any]:
    return _task_store.get(task_id, {"status": "PENDING", "result": None})


async def _run_task(task_id: str, coro):
    _task_store[task_id] = {"status": "STARTED", "result": None}
    try:
        result = await coro
        _task_store[task_id] = {"status": "SUCCESS", "result": result}
    except Exception as e:
        tb = traceback.format_exc()
        _task_store[task_id] = {"status": "FAILURE", "result": str(e)}
        import logging
        logging.getLogger(__name__).error(f"Task {task_id} failed:\n{tb}")


def submit_task(coro) -> str:
    """Submit an async coroutine as a background task. Returns a task_id."""
    task_id = str(uuid.uuid4())
    _task_store[task_id] = {"status": "PENDING", "result": None}
    asyncio.create_task(_run_task(task_id, coro))
    return task_id
