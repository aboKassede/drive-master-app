from bson import ObjectId
from fastapi import HTTPException

def validate_object_id(id_str: str, field_name: str = "id") -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format")

def validate_required_fields(data: dict, required_fields: list):
    """Validate required fields are present"""
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")