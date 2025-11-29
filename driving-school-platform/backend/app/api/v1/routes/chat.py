from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections = {}

    async def connect(self, websocket: WebSocket, user_email: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_connections[user_email] = websocket

    def disconnect(self, websocket: WebSocket, user_email: str):
        self.active_connections.remove(websocket)
        if user_email in self.user_connections:
            del self.user_connections[user_email]

    async def send_personal_message(self, message: str, user_email: str):
        if user_email in self.user_connections:
            await self.user_connections[user_email].send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{user_email}")
async def websocket_endpoint(websocket: WebSocket, user_email: str):
    await manager.connect(websocket, user_email)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_email)

@router.post("/send")
async def send_message(
    message_data: dict,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    message = {
        "sender_email": current_user["email"],
        "receiver_email": message_data["receiver_email"],
        "message": message_data["message"],
        "message_type": message_data.get("type", "text"),
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db.messages.insert_one(message)
    message["id"] = str(result.inserted_id)
    
    # Send via websocket if user is online
    await manager.send_personal_message(
        f"New message from {current_user['email']}: {message_data['message']}",
        message_data["receiver_email"]
    )
    
    return message

@router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Get unique conversation partners
    pipeline = [
        {"$match": {
            "$or": [
                {"sender_email": current_user["email"]},
                {"receiver_email": current_user["email"]}
            ]
        }},
        {"$group": {
            "_id": {
                "$cond": [
                    {"$eq": ["$sender_email", current_user["email"]]},
                    "$receiver_email",
                    "$sender_email"
                ]
            },
            "last_message": {"$last": "$message"},
            "last_message_time": {"$last": "$created_at"}
        }}
    ]
    
    conversations = await db.messages.aggregate(pipeline).to_list(100)
    return conversations

@router.get("/messages/{other_user_email}")
async def get_messages(
    other_user_email: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    messages = []
    async for message in db.messages.find({
        "$or": [
            {"sender_email": current_user["email"], "receiver_email": other_user_email},
            {"sender_email": other_user_email, "receiver_email": current_user["email"]}
        ]
    }).sort("created_at", 1):
        message["id"] = str(message["_id"])
        messages.append(message)
    
    # Mark messages as read
    await db.messages.update_many(
        {"sender_email": other_user_email, "receiver_email": current_user["email"]},
        {"$set": {"read": True}}
    )
    
    return messages