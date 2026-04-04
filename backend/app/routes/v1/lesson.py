from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.models.lesson import Lesson
from app.models.topic import Topic
from app.models.user import User
from app.schemas.task import TaskResponse
from app.workers.async_runner import submit_task
from app.workers.async_tasks import run_generate_lesson
from app.routes.v1.auth import get_current_user

router = APIRouter()

@router.post("/generate-lesson/{lesson_id}", response_model=TaskResponse)
async def generate_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    task_id = submit_task(run_generate_lesson(lesson_id))
    return {"task_id": task_id, "status": "PENDING"}

@router.get("/{lesson_id}")
async def get_lesson(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user owns the topic this lesson belongs to
    topic = await db.get(Topic, lesson.topic_id)
    if not topic or topic.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this lesson")
        
    from app.services.ai_service import ai_service
    if lesson.content:
        lesson.content = ai_service.normalize_markdown(lesson.content)
        
    return lesson
