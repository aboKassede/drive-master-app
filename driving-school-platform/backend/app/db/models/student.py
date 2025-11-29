from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class LicenseType(str, Enum):
    A = "A"  # Motorcycle
    B = "B"  # Car
    MANUAL = "manual"
    AUTOMATIC = "automatic"

class LearningLevel(str, Enum):
    BEGINNER = "beginner"
    TEST_PREPARATION = "test_preparation"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class StudentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"

class Student(BaseModel):
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    phone: str
    date_of_birth: datetime
    emergency_contact: str
    
    # Extended fields from plan
    photo_url: Optional[str] = None
    address: Optional[str] = None
    goal_license_type: Optional[LicenseType] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    preferred_instructor_gender: Optional[Gender] = None
    learning_level: Optional[LearningLevel] = LearningLevel.BEGINNER
    
    # School relationship
    school_id: Optional[str] = None
    school_status: StudentStatus = StudentStatus.PENDING
    
    # Progress tracking
    license_number: Optional[str] = None
    total_lessons: int = 0
    completed_lessons: int = 0
    
    # Preferences
    preferred_instructor_id: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime