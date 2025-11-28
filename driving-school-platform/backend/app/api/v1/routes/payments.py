from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database

router = APIRouter()

@router.post("/process")
async def process_payment(
    lesson_id: str,
    amount: float,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Only students can make payments")
    
    # Mock payment processing
    return {
        "payment_id": "pay_123456789",
        "status": "completed",
        "amount": amount,
        "lesson_id": lesson_id
    }

@router.get("/history")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    # Mock payment history
    return {
        "payments": [
            {
                "id": "pay_123456789",
                "amount": 50.0,
                "date": "2024-01-15",
                "status": "completed"
            }
        ]
    }