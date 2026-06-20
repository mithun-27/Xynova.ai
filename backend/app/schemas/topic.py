from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TopicBase(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    roadmap_graph: Optional[dict] = None

class TopicCreate(TopicBase):
    topic: str  # The topic to generate roadmap for

class TopicUpdate(BaseModel):
    roadmap_graph: dict

class RoadmapConfirmRequest(BaseModel):
    roadmap_graph: dict

class Topic(TopicBase):
    progress_percentage: Optional[float] = 0.0
    class Config:
        from_attributes = True

class LessonMetadata(BaseModel):
    id: int
    title: str
    is_completed: bool = False

class RoadmapUnit(BaseModel):
    title: str
    lessons: List[LessonMetadata]

class Roadmap(BaseModel):
    topic: str
    units: List[RoadmapUnit]
    roadmap_graph: Optional[dict] = None

# Schema for parsing raw AI responses (lessons are plain strings)
class AIRoadmapUnit(BaseModel):
    title: str
    lessons: List[str]

class AIRoadmap(BaseModel):
    topic: str
    units: List[AIRoadmapUnit]
