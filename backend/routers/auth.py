"""SENTINEL-X Auth Router - JWT Authentication"""
import random
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt

SECRET_KEY = "sentinel-x-ultra-secure-secret-key-2026"
ALGORITHM = "HS256"

router = APIRouter()

DEMO_USERS = {
    "admin": {"password": "sentinel123", "role": "ADMIN", "name": "SOC Administrator"},
    "analyst": {"password": "analyst123", "role": "ANALYST", "name": "Security Analyst"},
    "forensics": {"password": "forensics123", "role": "FORENSICS", "name": "DFIR Specialist"},
}

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    user = DEMO_USERS.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token_data = {
        "sub": request.username,
        "role": user["role"],
        "name": user["name"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"username": request.username, "role": user["role"], "name": user["name"]},
        "expires_in": 86400
    }

@router.get("/users")
async def get_users():
    return {"users": [{"username": k, "role": v["role"], "name": v["name"]} for k, v in DEMO_USERS.items()]}
