from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .student import PyObjectId

class School(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    license_number: str
    main_instructor_id: Optional[PyObjectId] = None
    instructors: List[PyObjectId] = []
    students: List[PyObjectId] = []
    lesson_types: List[dict] = []
    pricing: dict = {}
    status: str = "pending"  # pending, approved, suspended
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}