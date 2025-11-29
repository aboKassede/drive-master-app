from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    app_name: str = "Driving School Platform"
    debug: bool = False
    secret_key: str = os.getenv("SECRET_KEY", "fallback-secret-for-development-only")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "driving_school"
    
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket: Optional[str] = None
    
    allowed_origins: str = "http://localhost:3000,http://localhost:19006"
    
    class Config:
        env_file = ".env"

settings = Settings()