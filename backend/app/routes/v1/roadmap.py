from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from app.schemas.topic import TopicCreate, Topic as TopicSchema, Roadmap, TopicUpdate, RoadmapConfirmRequest
from app.schemas.task import TaskResponse
from app.workers.async_runner import submit_task
from app.workers.async_tasks import run_generate_roadmap
from app.routes.v1.auth import get_current_user
from app.models.user import User
from app.models.topic import Topic
from app.models.lesson import Lesson
from app.database.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.utils.document_parser import extract_text_from_file

router = APIRouter()

from app.utils.rate_limiter import ai_gen_limiter

import logging
logger = logging.getLogger(__name__)

@router.post("/generate-roadmap", response_model=TaskResponse, dependencies=[Depends(ai_gen_limiter)])
async def generate_roadmap(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    content_type = request.headers.get("content-type", "")
    topic = ""
    document_content = None
    
    if "multipart/form-data" in content_type:
        form = await request.form()
        topic = form.get("topic", "")
        file = form.get("file")
        if file and isinstance(file, UploadFile) and file.filename:
            document_content = await extract_text_from_file(file)
    else:
        try:
            body = await request.json()
            topic = body.get("topic", "")
            document_content = body.get("document_content")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid request payload. Must be JSON or multipart/form-data.")
            
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required.")
        
    try:
        task_id = submit_task(run_generate_roadmap(current_user.id, topic, document_content))
        return {"task_id": task_id, "status": "PENDING"}
    except Exception as e:
        logger.exception(f"Error starting roadmap task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[TopicSchema])
async def list_topics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Topic).where(Topic.user_id == current_user.id))
    return result.scalars().all()

@router.patch("/{topic_id}/graph", response_model=TopicSchema)
async def update_roadmap_graph(
    topic_id: int,
    graph_in: TopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = await db.get(Topic, topic_id)
    if not topic or topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    topic.roadmap_graph = graph_in.roadmap_graph
    await db.commit()
    await db.refresh(topic)
    return topic

@router.post("/{topic_id}/confirm")
async def confirm_roadmap(
    topic_id: int,
    confirm_in: RoadmapConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = await db.get(Topic, topic_id)
    if not topic or topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Save the final graph
    topic.roadmap_graph = confirm_in.roadmap_graph
    await db.commit()
    
    # Identify lesson nodes and create DB records (content generated on-demand when user opens them)
    nodes = confirm_in.roadmap_graph.get("nodes", [])
    lessons_created = 0
    
    updated_nodes = []
    for node in nodes:
        node_id = node.get("id", "")
        if node_id.startswith("lesson_") or node_id.startswith("custom_"):
            lesson_title = node.get("data", {}).get("label", "Untitled Lesson")
            
            # Check if lesson already exists
            res = await db.execute(select(Lesson).where(Lesson.topic_id == topic_id, (Lesson.title == lesson_title) | (Lesson.id == node.get("data", {}).get("lessonId"))))
            lesson = res.scalars().first()
            
            if not lesson:
                lesson = Lesson(topic_id=topic_id, title=lesson_title)
                db.add(lesson)
                await db.flush()
                lessons_created += 1
            
            # Backfill lessonId into node data
            if "data" not in node:
                node["data"] = {}
            node["data"]["lessonId"] = lesson.id
        
        updated_nodes.append(node)
                
    # Save the updated graph with lessonIds
    topic.roadmap_graph = {
        "nodes": updated_nodes,
        "edges": confirm_in.roadmap_graph.get("edges", [])
    }
    await db.commit()
    return {"message": f"Roadmap confirmed! {lessons_created} lessons ready. Click any lesson to start learning!"}

@router.get("/{topic_id}", response_model=Roadmap)
async def get_roadmap(
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = await db.get(Topic, topic_id)
    if not topic or topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    from app.models.progress import Progress
    result = await db.execute(
        select(Lesson, Progress.completed)
        .outerjoin(Progress, (Progress.lesson_id == Lesson.id) & (Progress.user_id == current_user.id))
        .where(Lesson.topic_id == topic_id)
        .order_by(Lesson.order_index)
    )
    rows = result.all()
    
    # Structure lessons into units for the frontend
    units_dict = {}
    for lesson, is_completed in rows:
        unit_title = lesson.title.split(": ")[0] if ": " in lesson.title else "Core Units"
        lesson_name = lesson.title.split(": ")[1] if ": " in lesson.title else lesson.title
        
        if unit_title not in units_dict:
            units_dict[unit_title] = []
            
        units_dict[unit_title].append({
            "id": lesson.id,
            "title": lesson_name,
            "is_completed": bool(is_completed)
        })
    
    units = [{"title": k, "lessons": v} for k, v in units_dict.items()]
    return {
        "topic": topic.title, 
        "units": units,
        "roadmap_graph": topic.roadmap_graph
    }

@router.delete("/delete/{topic_id}")
async def delete_topic(
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = await db.get(Topic, topic_id)
    if not topic or topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    await db.delete(topic)
    await db.commit()
    return {"message": "Topic deleted successfully"}
