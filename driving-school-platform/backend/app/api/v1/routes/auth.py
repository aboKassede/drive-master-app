from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.api.v1.schemas.auth import UserLogin, UserRegister, Token
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.db.mongo import get_database
from app.db.models.student import Student
from app.db.models.instructor import Instructor
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    try:
        db = get_database()
        
        # Check if user exists
        existing_user = await db.students.find_one({"email": user_data.email}) or \
                       await db.instructors.find_one({"email": user_data.email})
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")
    
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user based on type
        if user_data.user_type == "student":
            user_dict = {
                "email": user_data.email,
                "password_hash": hashed_password,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "phone": user_data.phone,
                "date_of_birth": datetime.utcnow(),
                "emergency_contact": user_data.phone,
                "school_id": None,
                "school_status": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.students.insert_one(user_dict)
        else:
            user_dict = {
                "email": user_data.email,
                "password_hash": hashed_password,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "phone": user_data.phone,
                "license_number": "TEMP123",
                "certification_date": datetime.utcnow(),
                "hourly_rate": 50.0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.instructors.insert_one(user_dict)
        
        # Create token
        access_token = create_access_token(data={"sub": user_data.email, "user_type": user_data.user_type})
        return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        db = get_database()
        
        # Find user in both collections
        user = await db.students.find_one({"email": form_data.username})
        user_type = "student"
        
        if not user:
            user = await db.instructors.find_one({"email": form_data.username})
            user_type = "instructor"
        
        if not user or not verify_password(form_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = create_access_token(data={"sub": user["email"], "user_type": user_type})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")