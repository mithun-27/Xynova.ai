from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from supabase import create_client, Client

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User

router = APIRouter()
security = HTTPBearer()

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token with Supabase directly
    try:
        user_response = supabase.auth.get_user(credentials.credentials)
        if not user_response.user:
            raise credentials_exception
        email = user_response.user.email
        if not email:
            raise credentials_exception
    except Exception as e:
        print(f"Supabase Auth Error: {e}")
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if user is None:
        # Auto-sync user on first login from Supabase
        username = email.split('@')[0]
        # Ensure username uniqueness
        check_user = await db.execute(select(User).where(User.username == username))
        if check_user.scalar_one_or_none():
            username = f"{username}_{str(uuid.uuid4())[:8]}"
            
        new_user = User(
            username=username,
            email=email,
            hashed_password=None  # Auth is handled by Supabase
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
        
    return user

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username
    }
