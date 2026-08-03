from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.schemas.quiz import Quiz as QuizSchema, QuizSubmit
from app.schemas.task import TaskResponse
from app.workers.async_runner import submit_task
from app.workers.async_tasks import run_generate_quiz
from app.routes.v1.auth import get_current_user
from app.models.lesson import Lesson
from app.models.topic import Topic
from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.database.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ai_service import ai_service

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
    # Check if quiz exists for this lesson
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.lesson_id == lesson_id)
    )
    quiz = result.scalars().first()
    
    if not quiz:
        # ON-DEMAND GENERATION: If no quiz yet, generate it immediately
        lesson = await db.get(Lesson, lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Make sure lesson has content, else generate it
        if not lesson.content:
            topic = await db.get(Topic, lesson.topic_id)
            lesson.content = await ai_service.generate_lesson_content(topic.title, lesson.title)
            db.add(lesson)
            await db.flush()
            
        try:
            questions = await ai_service.generate_quiz(lesson.title, lesson.content)
            
            quiz = Quiz(lesson_id=lesson_id)
            db.add(quiz)
            await db.flush()
            
            for q in questions:
                new_q = QuizQuestion(
                    quiz_id=quiz.id,
                    question=q.question,
                    options=q.options,
                    correct_answer=q.correct_answer,
                    explanation=q.explanation,
                    difficulty=q.difficulty
                )
                db.add(new_q)
                
            await db.commit()
            
            # Fetch again with relations loaded
            result = await db.execute(
                select(Quiz)
                .options(selectinload(Quiz.questions))
                .where(Quiz.id == quiz.id)
            )
            quiz = result.scalars().first()
        except Exception as e:
            import logging
            logging.getLogger("xynova_ai").error(f"On-demand quiz generation failed for lesson {lesson_id}: {e}")
            raise HTTPException(status_code=503, detail="Failed to generate quiz. AI service temporarily busy.")
            
    return quiz

@router.post("/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    quiz = await db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=submission.score,
        total_questions=submission.total_questions
    )
    db.add(attempt)
    await db.commit()
    return {"status": "success", "message": "Quiz attempt recorded"}
