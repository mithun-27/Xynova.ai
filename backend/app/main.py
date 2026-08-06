from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.v1 import auth, roadmap, lesson, chat, quiz, progress, analytics, tasks

from contextlib import asynccontextmanager
from app.database.session import engine, Base
# Import models to ensure they are registered with Base
from app.models.user import User
from app.models.topic import Topic
from app.models.lesson import Lesson
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.models.progress import Progress
from app.models.chat import ChatHistory

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        from sqlalchemy import text
        await conn.execute(text("ALTER TABLE topics ADD COLUMN IF NOT EXISTS document_content TEXT;"))
        await conn.execute(text("ALTER TABLE progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;"))
        await conn.execute(text("ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;"))
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://xynova.web.app",
        "https://xynova.firebaseapp.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(roadmap.router, prefix=f"{settings.API_V1_STR}/roadmap", tags=["roadmap"])
app.include_router(lesson.router, prefix=f"{settings.API_V1_STR}/lesson", tags=["lesson"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(quiz.router, prefix=f"{settings.API_V1_STR}/quiz", tags=["quiz"])
app.include_router(progress.router, prefix=f"{settings.API_V1_STR}/progress", tags=["progress"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])

@app.get("/")
async def root():
    return {"message": "Welcome to Xynova AI Backend"}
