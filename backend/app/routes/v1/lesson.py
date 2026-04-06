from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.models.lesson import Lesson
from app.models.topic import Topic
from app.models.user import User
from app.schemas.task import TaskResponse
from app.workers.async_runner import submit_task
from app.workers.async_tasks import run_generate_lesson
from app.routes.v1.auth import get_current_user
from app.services.ai_service import ai_service

import logging
logger = logging.getLogger("xynova_ai")

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
    
    # Check ownership
    topic = await db.get(Topic, lesson.topic_id)
    if not topic or topic.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this lesson")
    
    # ON-DEMAND GENERATION: If no content yet, generate it right now
    if not lesson.content:
        logger.info(f"Lesson {lesson_id} has no content — generating on-demand...")
        try:
            content = await ai_service.generate_lesson_content(topic.title, lesson.title)
            lesson.content = content
            await db.commit()
            await db.refresh(lesson)
            logger.info(f"Lesson {lesson_id} generated successfully.")
        except Exception as e:
            logger.error(f"On-demand generation failed for lesson {lesson_id}: {e}")
            # Return a proper error response instead of spinning forever
            return JSONResponse(
                status_code=503,
                content={
                    "id": lesson.id,
                    "topic_id": lesson.topic_id,
                    "title": lesson.title,
                    "content": None,
                    "order_index": lesson.order_index,
                    "error": "AI generation temporarily unavailable. Please try again."
                }
            )
    
    if lesson.content:
        lesson.content = ai_service.normalize_markdown(lesson.content)
        
    return lesson

@router.post("/{lesson_id}/regenerate")
async def regenerate_lesson_content(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    topic = await db.get(Topic, lesson.topic_id)
    if not topic or topic.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    logger.info(f"Regenerating lesson {lesson_id} on-demand...")
    try:
        content = await ai_service.generate_lesson_content(topic.title, lesson.title)
        lesson.content = content
        await db.commit()
        await db.refresh(lesson)
        
        # Also normalize before returning
        lesson.content = ai_service.normalize_markdown(lesson.content)
        return lesson
    except Exception as e:
        logger.error(f"Regeneration failed for lesson {lesson_id}: {e}")
        raise HTTPException(status_code=503, detail="AI service busy, please try again.")
