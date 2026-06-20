from pydantic import BaseModel
from typing import List, Dict

class ProgressUpdate(BaseModel):
    lesson_id: int
    completed: bool

class Analytics(BaseModel):
    lessons_completed: int
    quiz_scores: List[float]
    study_streak: int
    progress_percentage: float
    calendar_data: Dict[str, int] = {}
