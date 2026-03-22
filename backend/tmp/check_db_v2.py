import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.database.session import AsyncSessionLocal
from app.models.topic import Topic
from sqlalchemy import select

async def check():
    print("Checking database for latest topics...")
    async with AsyncSessionLocal() as s:
        res = await s.execute(select(Topic).order_by(Topic.id.desc()).limit(10))
        topics = res.scalars().all()
        if not topics:
            print("No topics found in DB.")
        for t in topics:
            print(f"ID: {t.id} | Title: {t.title} | User: {t.user_id}")

if __name__ == "__main__":
    asyncio.run(check())
