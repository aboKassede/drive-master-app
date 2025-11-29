from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.api.v1.routes import auth, students, instructors, lessons, scheduling, payments, notifications, instructor_actions, schools, progress, ratings, chat, booking, available_schools, admin
from app.api import healthcheck

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
app.include_router(instructors.router, prefix="/api/v1/instructors", tags=["instructors"])
app.include_router(lessons.router, prefix="/api/v1/lessons", tags=["lessons"])
app.include_router(scheduling.router, prefix="/api/v1/scheduling", tags=["scheduling"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(instructor_actions.router, prefix="/api/v1/instructor", tags=["instructor-actions"])
app.include_router(available_schools.router, prefix="/api/v1/schools", tags=["schools"])
app.include_router(progress.router, prefix="/api/v1/progress", tags=["progress"])
app.include_router(ratings.router, prefix="/api/v1/ratings", tags=["ratings"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(booking.router, prefix="/api/v1/booking", tags=["booking"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(healthcheck.router, tags=["health"])

@app.get("/")
async def root():
    return {"message": "Driving School Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}