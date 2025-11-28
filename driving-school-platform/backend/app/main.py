from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.api.v1.routes import auth, students, instructors, lessons, scheduling, payments, notifications, instructor_actions
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
app.include_router(healthcheck.router, tags=["health"])

@app.get("/")
async def root():
    return {"message": "Driving School Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}