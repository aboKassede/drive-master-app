from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/instructor/{instructor_id}")
async def rate_instructor(
    instructor_id: str,
    rating_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Only students can rate instructors")
    
    db = get_database()
    student = await db.students.find_one({"email": current_user["email"]})
    
    rating = {
        "student_id": student["_id"],
        "instructor_id": ObjectId(instructor_id),
        "rating": rating_data.get("rating", 5),
        "comment": rating_data.get("comment", ""),
        "lesson_id": ObjectId(rating_data.get("lesson_id")) if rating_data.get("lesson_id") else None,
        "created_at": datetime.utcnow()
    }
    
    await db.ratings.insert_one(rating)
    
    # Update instructor average rating
    pipeline = [
        {"$match": {"instructor_id": ObjectId(instructor_id)}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "total_ratings": {"$sum": 1}}}
    ]
    
    result = await db.ratings.aggregate(pipeline).to_list(1)
    if result:
        await db.instructors.update_one(
            {"_id": ObjectId(instructor_id)},
            {"$set": {
                "average_rating": round(result[0]["avg_rating"], 2),
                "total_ratings": result[0]["total_ratings"]
            }}
        )
    
    return {"message": "Rating submitted successfully"}

@router.get("/instructor/{instructor_id}")
async def get_instructor_ratings(instructor_id: str):
    db = get_database()
    
    ratings = []
    async for rating in db.ratings.find({"instructor_id": ObjectId(instructor_id)}).sort("created_at", -1):
        student = await db.students.find_one({"_id": rating["student_id"]})
        rating["id"] = str(rating["_id"])
        rating["student_name"] = f"{student['first_name']} {student['last_name']}"
        ratings.append(rating)
    
    return ratings