from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from app.utils.email_sender import EmailSender
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Get user notifications
    notifications = []
    async for notification in db.notifications.find({"user_email": current_user["email"]}).sort("created_at", -1):
        notification["id"] = str(notification["_id"])
        notifications.append(notification)
    
    return notifications

@router.post("/send-lesson-notification")
async def send_lesson_notification(
    lesson_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Get lesson details
    lesson = await db.lessons.find_one({"_id": ObjectId(lesson_id)})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Get student and instructor details
    student = await db.students.find_one({"_id": lesson["student_id"]})
    instructor = await db.instructors.find_one({"_id": lesson["instructor_id"]})
    
    # Create notifications
    notifications = [
        {
            "user_email": student["email"],
            "title": "Lesson Booked",
            "message": f"Your lesson with {instructor['first_name']} {instructor['last_name']} is scheduled for {lesson['scheduled_date']}",
            "type": "lesson_booked",
            "lesson_id": lesson_id,
            "read": False,
            "created_at": datetime.utcnow()
        },
        {
            "user_email": instructor["email"],
            "title": "New Lesson Request",
            "message": f"New lesson request from {student['first_name']} {student['last_name']} for {lesson['scheduled_date']}",
            "type": "lesson_request",
            "lesson_id": lesson_id,
            "read": False,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.notifications.insert_many(notifications)
    
    # Send email notifications
    email_sender = EmailSender()
    await email_sender.send_email(
        [student["email"]],
        "Lesson Booked Confirmation",
        f"Your driving lesson has been booked for {lesson['scheduled_date']}"
    )
    
    await email_sender.send_email(
        [instructor["email"]],
        "New Lesson Request",
        f"You have a new lesson request from {student['first_name']} {student['last_name']}"
    )
    
    return {"message": "Notifications sent successfully"}

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_email": current_user["email"]},
        {"$set": {"read": True}}
    )
    
    return {"message": "Notification marked as read"}