from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User

router = APIRouter()
security = HTTPBearer()

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Supabase JWTs are signed with HS256 using the JWT_SECRET
        payload = jwt.decode(
            credentials.credentials, 
            settings.JWT_SECRET, 
            algorithms=["HS256"],
            audience="authenticated"
        )
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError as e:
        print(f"JWT Decode Error: {e}")
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
