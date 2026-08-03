from fastapi import APIRouter, Depends
from app.schemas.analytics import Analytics
from app.routes.v1.auth import get_current_user
from app.models.progress import Progress
from app.models.lesson import Lesson
from app.models.topic import Topic
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from sqlalchemy import select, func, cast, Date
from datetime import date, timedelta

router = APIRouter()

@router.get("/", response_model=Analytics)
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # --- Lessons completed by this user ---
    completed_stmt = select(func.count(Progress.id)).where(
        Progress.user_id == current_user.id,
        Progress.completed == True
    )
    completed_count = (await db.execute(completed_stmt)).scalar() or 0
    
    # --- Total lessons across user's own topics only ---
    total_stmt = (
        select(func.count(Lesson.id))
        .join(Topic, Lesson.topic_id == Topic.id)
        .where(Topic.user_id == current_user.id)
    )
    total_count = (await db.execute(total_stmt)).scalar() or 0
    
    # --- Progress Percentage ---
    percentage = (completed_count / total_count) * 100 if total_count > 0 else 0.0
    
    # --- Study Streak (consecutive days ending today or yesterday) ---
    streak = 0
    streak_dates_stmt = (
        select(cast(Progress.completed_at, Date))
        .where(
            Progress.user_id == current_user.id,
            Progress.completed == True,
            Progress.completed_at.isnot(None)
        )
        .distinct()
        .order_by(cast(Progress.completed_at, Date).desc())
    )
    result = await db.execute(streak_dates_stmt)
    completion_dates = [row[0] for row in result.all()]
    
    if completion_dates:
        today = date.today()
        # Streak can start from today or yesterday
        if completion_dates[0] == today:
            expected = today
        elif completion_dates[0] == today - timedelta(days=1):
            expected = today - timedelta(days=1)
        else:
            expected = None
        
        if expected is not None:
            for d in completion_dates:
                if d == expected:
                    streak += 1
                    expected -= timedelta(days=1)
                elif d < expected:
                    break
    
    # --- Calendar data (last 365 days) ---
    one_year_ago = date.today() - timedelta(days=365)
    calendar_stmt = (
        select(
            cast(Progress.completed_at, Date).label("completion_date"),
            func.count(Progress.id).label("count")
        )
        .where(
            Progress.user_id == current_user.id,
            Progress.completed == True,
            Progress.completed_at.isnot(None),
            cast(Progress.completed_at, Date) >= one_year_ago
        )
        .group_by(cast(Progress.completed_at, Date))
    )
    cal_result = await db.execute(calendar_stmt)
    calendar_data = {
        row.completion_date.isoformat(): row.count
        for row in cal_result.all()
    }
    
    # --- Quiz scores (real data from quiz results if available) ---
    quiz_scores: list[float] = []
    from app.models.quiz import QuizAttempt
    attempts_stmt = select(QuizAttempt).where(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.completed_at.asc())
    attempts_result = await db.execute(attempts_stmt)
    attempts = attempts_result.scalars().all()
    quiz_scores = [
        round((attempt.score / attempt.total_questions) * 100, 2)
        for attempt in attempts
        if attempt.total_questions > 0
    ]
    
    return Analytics(
        lessons_completed=completed_count,
        quiz_scores=quiz_scores,
        study_streak=streak,
        progress_percentage=round(percentage, 2),
        calendar_data=calendar_data
    )

