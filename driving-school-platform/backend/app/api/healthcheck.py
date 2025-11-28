from fastapi import APIRouter
from app.db.mongo import get_database

router = APIRouter()

@router.get("/health")
async def health_check():
    try:
        db = get_database()
        # Simple DB connection test
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}