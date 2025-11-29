from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/school/join")
async def request_school_join(
    school_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Student requests to join a school"""
    try:
        if current_user["user_type"] != "student":
            raise HTTPException(status_code=403, detail="Only students can join schools")
        
        db = get_database()
        student = await db.students.find_one({"email": current_user["email"]})
        school_id = school_data.get("school_id")
        
        # Create booking request
        booking = {
            "booking_type": "school_join",
            "student_id": str(student["_id"]),
            "school_id": school_id,
            "status": "requested",
            "student_message": school_data.get("message", ""),
            "requested_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.bookings.insert_one(booking)
        
        # Add to school's pending requests
        await db.schools.update_one(
            {"_id": ObjectId(school_id)},
            {"$addToSet": {"pending_student_requests": str(student["_id"])}}
        )
        
        # Create notification for school
        notification = {
            "school_id": school_id,
            "title": "New Student Request",
            "message": f"{student['first_name']} {student['last_name']} wants to join your school",
            "type": "school_join_request",
            "booking_id": str(result.inserted_id),
            "read": False,
            "created_at": datetime.utcnow()
        }
        await db.notifications.insert_one(notification)
        
        return {"message": "School join request sent successfully", "booking_id": str(result.inserted_id)}
    
    except Exception as e:
        print(f"Error in school join request: {e}")
        raise HTTPException(status_code=500, detail="Failed to send join request")

@router.post("/lesson")
async def request_lesson_booking(
    lesson_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Student requests to book a lesson"""
    try:
        if current_user["user_type"] != "student":
            raise HTTPException(status_code=403, detail="Only students can book lessons")
        
        db = get_database()
        student = await db.students.find_one({"email": current_user["email"]})
        
        # Check if student is approved by school
        if not student.get("school_id") or student.get("school_status") != "approved":
            raise HTTPException(status_code=403, detail="You must be approved by a school first")
        
        # Create lesson
        lesson = {
            "student_id": str(student["_id"]),
            "instructor_id": lesson_data.get("instructor_id"),
            "school_id": student.get("school_id"),
            "lesson_type": lesson_data.get("lesson_type", "driving"),
            "vehicle_type": lesson_data.get("vehicle_type"),
            "scheduled_date": datetime.fromisoformat(lesson_data["scheduled_date"]),
            "duration_minutes": lesson_data.get("duration_minutes", 60),
            "status": "pending",
            "price": lesson_data.get("price"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        lesson_result = await db.lessons.insert_one(lesson)
        
        # Create booking request
        booking = {
            "booking_type": "lesson",
            "student_id": str(student["_id"]),
            "instructor_id": lesson_data.get("instructor_id"),
            "lesson_id": str(lesson_result.inserted_id),
            "preferred_date": datetime.fromisoformat(lesson_data["scheduled_date"]),
            "status": "pending_instructor",
            "student_message": lesson_data.get("message", ""),
            "requested_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        booking_result = await db.bookings.insert_one(booking)
        
        # Create notification for instructor
        instructor = await db.instructors.find_one({"_id": ObjectId(lesson_data.get("instructor_id"))})
        if instructor:
            notification = {
                "user_email": instructor["email"],
                "title": "New Lesson Request",
                "message": f"New lesson request from {student['first_name']} {student['last_name']}",
                "type": "lesson_request",
                "lesson_id": str(lesson_result.inserted_id),
                "booking_id": str(booking_result.inserted_id),
                "read": False,
                "created_at": datetime.utcnow()
            }
            await db.notifications.insert_one(notification)
        
        return {
            "message": "Lesson booking request sent successfully",
            "lesson_id": str(lesson_result.inserted_id),
            "booking_id": str(booking_result.inserted_id)
        }
    
    except Exception as e:
        print(f"Error in lesson booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to book lesson")

@router.put("/school/{booking_id}/approve")
async def approve_school_join(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """School approves student join request"""
    try:
        db = get_database()
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Update booking status
        await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": "confirmed",
                    "school_response": "approved",
                    "school_response_at": datetime.utcnow(),
                    "confirmed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Update student status
        await db.students.update_one(
            {"_id": ObjectId(booking["student_id"])},
            {
                "$set": {
                    "school_id": booking["school_id"],
                    "school_status": "approved",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Add student to school
        await db.schools.update_one(
            {"_id": ObjectId(booking["school_id"])},
            {
                "$addToSet": {"student_ids": booking["student_id"]},
                "$pull": {"pending_student_requests": booking["student_id"]},
                "$inc": {"total_students": 1}
            }
        )
        
        # Create notification for student
        student = await db.students.find_one({"_id": ObjectId(booking["student_id"])})
        if student:
            notification = {
                "user_email": student["email"],
                "title": "School Application Approved",
                "message": "Your application to join the school has been approved!",
                "type": "school_approval",
                "booking_id": booking_id,
                "read": False,
                "created_at": datetime.utcnow()
            }
            await db.notifications.insert_one(notification)
        
        return {"message": "Student approved successfully"}
    
    except Exception as e:
        print(f"Error approving school join: {e}")
        raise HTTPException(status_code=500, detail="Failed to approve student")

@router.put("/lesson/{booking_id}/accept")
async def accept_lesson_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Instructor accepts lesson booking"""
    try:
        if current_user["user_type"] != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can accept lessons")
        
        db = get_database()
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Update booking status
        await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": "confirmed",
                    "instructor_response": "accepted",
                    "instructor_response_at": datetime.utcnow(),
                    "confirmed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Update lesson status
        await db.lessons.update_one(
            {"_id": ObjectId(booking["lesson_id"])},
            {
                "$set": {
                    "status": "confirmed",
                    "instructor_accepted": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Create notification for student
        student = await db.students.find_one({"_id": ObjectId(booking["student_id"])})
        if student:
            notification = {
                "user_email": student["email"],
                "title": "Lesson Confirmed",
                "message": "Your lesson has been confirmed by the instructor!",
                "type": "lesson_confirmed",
                "lesson_id": booking["lesson_id"],
                "read": False,
                "created_at": datetime.utcnow()
            }
            await db.notifications.insert_one(notification)
        
        return {"message": "Lesson accepted successfully"}
    
    except Exception as e:
        print(f"Error accepting lesson: {e}")
        raise HTTPException(status_code=500, detail="Failed to accept lesson")

@router.get("/my-requests")
async def get_my_booking_requests(current_user: dict = Depends(get_current_user)):
    """Get user's booking requests"""
    try:
        db = get_database()
        
        if current_user["user_type"] == "student":
            student = await db.students.find_one({"email": current_user["email"]})
            query = {"student_id": str(student["_id"])}
        else:
            instructor = await db.instructors.find_one({"email": current_user["email"]})
            query = {"instructor_id": str(instructor["_id"])}
        
        bookings = []
        async for booking in db.bookings.find(query).sort("created_at", -1):
            booking["id"] = str(booking["_id"])
            booking.pop("_id", None)
            bookings.append(booking)
        
        return bookings
    
    except Exception as e:
        print(f"Error fetching booking requests: {e}")
        return []