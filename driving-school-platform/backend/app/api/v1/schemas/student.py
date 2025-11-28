from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class StudentCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str
    date_of_birth: datetime
    emergency_contact: str

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    license_number: Optional[str] = None

class StudentResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    date_of_birth: datetime
    license_number: Optional[str] = None
    emergency_contact: str
    created_at: datetime