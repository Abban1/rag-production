from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from models import UserCreate, UserLogin
from db import users_collection
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Use argon2 instead of bcrypt to avoid version issues
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

@router.post("/signup")
async def signup(user: UserCreate):
    # Validate email and password
    if not user.email or not user.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Check if user already exists
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash password and create user
    hashed = hash_password(user.password)
    user_doc = {"email": user.email, "password": hashed}
    
    try:
        result = users_collection.insert_one(user_doc)
        return {
            "success": True,
            "user_id": str(result.inserted_id),
            "email": user.email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.post("/login")
async def login(user: UserLogin):
    # Validate input
    if not user.email or not user.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Find user in database
    db_user = users_collection.find_one({"email": user.email})
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Generate JWT token
    try:
        token = jwt.encode(
            {"sub": str(db_user["_id"])}, 
            SECRET_KEY, 
            algorithm=ALGORITHM
        )
        return {
            "success": True,
            "access_token": token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating token: {str(e)}")

@router.post("/token")
async def token(user: UserLogin):
    # Validate input
    if not user.email or not user.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Find user in database
    db_user = users_collection.find_one({"email": user.email})
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Generate JWT token
    try:
        token = jwt.encode(
            {"sub": str(db_user["_id"])}, 
            SECRET_KEY, 
            algorithm=ALGORITHM
        )
        return {
            "access_token": token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating token: {str(e)}")