from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class InstructorCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str
    license_number: str
    hourly_rate: float

class InstructorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: Optional[float] = None
    specializations: Optional[List[str]] = None

class InstructorResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    license_number: str
    hourly_rate: float
    specializations: List[str] = []
    created_at: datetime