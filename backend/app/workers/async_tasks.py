"""
Async task implementations that run directly in the FastAPI event loop.
These replace the Celery-based tasks that don't work on Windows.
"""
from app.services.ai_service import ai_service
from app.database.session import AsyncSessionLocal
from app.models.topic import Topic
from app.models.lesson import Lesson
from app.models.quiz import Quiz, QuizQuestion
from sqlalchemy import select
from app.core.config import logger


async def run_generate_roadmap(user_id: int, topic_title: str):
    logger.info(f"START: generate_roadmap for topic '{topic_title}'")
    async with AsyncSessionLocal() as db:
        # 1. Generate the roadmap structure via AI
        logger.info("Calling AI service for roadmap...")
        roadmap = await ai_service.generate_roadmap(topic_title)
        logger.info("AI response received.")

        # 2. Create the Topic record
        new_topic = Topic(
            user_id=user_id,
            title=topic_title,
            roadmap_graph={}  # Placeholder
        )
        db.add(new_topic)
        await db.flush()
        logger.info(f"Topic created with ID: {new_topic.id}")

        # 3. Build roadmap_graph — just node data + edges, layout is done on frontend
        nodes = []
        edges = []

        # Root node
        nodes.append({
            "id": "root",
            "data": {"label": topic_title},
        })

        current_order = 0
        for i, unit in enumerate(roadmap.units):
            unit_id = f"unit_{i}"
            nodes.append({
                "id": unit_id,
                "data": {"label": unit.title},
            })
            edges.append({
                "id": f"e-root-{unit_id}",
                "source": "root",
                "target": unit_id,
            })
            # Add lessons as children
            for j, lesson_name in enumerate(unit.lessons):
                new_lesson = Lesson(
                    topic_id=new_topic.id,
                    title=f"{unit.title}: {lesson_name}",
                    order_index=current_order
                )
                db.add(new_lesson)
                await db.flush()

                lesson_node_id = f"lesson_{current_order}"
                nodes.append({
                    "id": lesson_node_id,
                    "data": {"label": lesson_name, "lessonId": new_lesson.id},
                })
                edges.append({
                    "id": f"e-{unit_id}-{lesson_node_id}",
                    "source": unit_id,
                    "target": lesson_node_id,
                })

                current_order += 1

        new_topic.roadmap_graph = {"nodes": nodes, "edges": edges}
        logger.info("Committing data to DB...")
        await db.commit()
        logger.info(f"SUCCESS: generate_roadmap completed for ID {new_topic.id}")
        return {"topic_id": new_topic.id, "roadmap": roadmap.model_dump()}


async def run_generate_lesson(lesson_id: int):
    async with AsyncSessionLocal() as db:
        lesson = await db.get(Lesson, lesson_id)
        if not lesson:
            return "Lesson not found"

        topic = await db.get(Topic, lesson.topic_id)
        content = await ai_service.generate_lesson_content(topic.title, lesson.title)

        lesson.content = content
        await db.commit()

        # Also generate quiz for this lesson
        from app.workers.async_runner import submit_task
        submit_task(run_generate_quiz(lesson.id))

        return content


async def run_generate_quiz(lesson_id: int):
    async with AsyncSessionLocal() as db:
        lesson = await db.get(Lesson, lesson_id)
        if not lesson:
            return "Lesson not found"

        questions = await ai_service.generate_quiz(lesson.title, lesson.content)

        new_quiz = Quiz(lesson_id=lesson_id)
        db.add(new_quiz)
        await db.flush()

        for q in questions:
            new_q = QuizQuestion(
                quiz_id=new_quiz.id,
                question=q.question,
                options=q.options,
                correct_answer=q.correct_answer,
                explanation=q.explanation
            )
            db.add(new_q)

        await db.commit()
        return "Quiz generated"
