from fastapi import APIRouter, Depends
from app.schemas.analytics import ProgressUpdate
from app.routes.v1.auth import get_current_user
from app.models.progress import Progress
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from sqlalchemy import select
from sqlalchemy.sql import func

router = APIRouter()

@router.post("/mark-complete")
async def mark_complete(
    progress_in: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Progress).where(
        Progress.user_id == current_user.id,
        Progress.lesson_id == progress_in.lesson_id
    )
    result = await db.execute(stmt)
    progress = result.scalar_one_or_none()
    
    if progress:
        progress.completed = progress_in.completed
        progress.completed_at = func.now() if progress_in.completed else None
    else:
        progress = Progress(
            user_id=current_user.id,
            lesson_id=progress_in.lesson_id,
            completed=progress_in.completed,
            completed_at=func.now() if progress_in.completed else None
        )
        db.add(progress)
        
    await db.commit()
    return {"status": "success"}
