from pydantic import BaseModel
from typing import List, Optional

class QuizQuestionBase(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    difficulty: Optional[str] = None

class QuizQuestionCreate(QuizQuestionBase):
    quiz_id: int

class QuizSubmit(BaseModel):
    score: int
    total_questions: int

class QuizQuestion(QuizQuestionBase):
    id: int
    quiz_id: int
    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    lesson_id: int

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    questions: List[QuizQuestion]
    class Config:
        from_attributes = True
