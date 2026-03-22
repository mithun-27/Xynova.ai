import asyncio
from app.database.session import AsyncSessionLocal
from app.models.topic import Topic
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as s:
        res = await s.execute(select(Topic).order_by(Topic.id.desc()).limit(5))
        topics = res.scalars().all()
        print([(t.id, t.title) for t in topics])

if __name__ == "__main__":
    asyncio.run(check())
