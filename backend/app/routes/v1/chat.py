from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import ChatMessage, ChatHistory
from app.services.ai_service import ai_service
from app.routes.v1.auth import get_current_user
from app.models.user import User
from app.models.topic import Topic
from app.models.lesson import Lesson
from app.models.chat import ChatHistory as ChatHistoryModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from sqlalchemy import select

router = APIRouter()

from app.utils.rate_limiter import default_limiter

@router.post("/", response_model=ChatHistory, dependencies=[Depends(default_limiter)])
async def chat_with_tutor(
    chat_in: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch context
    topic = await db.get(Topic, chat_in.topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    lesson = await db.get(Lesson, chat_in.lesson_id) if chat_in.lesson_id else None
    
    context = f"Topic: {topic.title}\n"
    if lesson:
        context += f"Lesson: {lesson.title}\nContent: {lesson.content}\n"
    
    # Construct messages with history
    messages = [
        {"role": "system", "content": f"You are a helpful AI tutor for Xynova AI. Use the following context to answer the user's question:\n{context}"}
    ]
    
    # Add history
    for turn in chat_in.history:
        msg = {"role": turn.role, "content": turn.content}
        if turn.reasoning_details:
            msg["reasoning_details"] = turn.reasoning_details
        messages.append(msg)
    
    # Add current message
    messages.append({"role": "user", "content": chat_in.user_message})
    
    ai_resp = await ai_service.get_chat_response(messages)
    response_text = ai_resp["content"]
    reasoning = ai_resp.get("reasoning_details")
    
    # Store history
    history_entry = ChatHistoryModel(
        user_id=current_user.id,
        topic_id=chat_in.topic_id,
        message=chat_in.user_message,
        response=response_text,
        reasoning=reasoning
    )
    db.add(history_entry)
    await db.commit()
    await db.refresh(history_entry)
    
    return history_entry
