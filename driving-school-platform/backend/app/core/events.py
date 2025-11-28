from fastapi import FastAPI
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.core.logging import setup_logging

def create_start_app_handler(app: FastAPI):
    async def start_app() -> None:
        setup_logging()
        await connect_to_mongo()
    return start_app

def create_stop_app_handler(app: FastAPI):
    async def stop_app() -> None:
        await close_mongo_connection()
    return stop_app