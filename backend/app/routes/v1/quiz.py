from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.schemas.quiz import Quiz as QuizSchema
from app.schemas.task import TaskResponse
from app.workers.async_runner import submit_task
from app.workers.async_tasks import run_generate_quiz
from app.routes.v1.auth import get_current_user
from app.models.lesson import Lesson
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db

router = APIRouter()

@router.post("/generate-quiz/{lesson_id}", response_model=TaskResponse)
async def generate_quiz(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    task_id = submit_task(run_generate_quiz(lesson_id))
    return {"task_id": task_id, "status": "PENDING"}

@router.get("/{lesson_id}", response_model=Optional[QuizSchema])
async def get_quiz(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.quiz import Quiz
    
    # Check if quiz exists for this lesson
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.lesson_id == lesson_id)
    )
    return result.scalars().first()
