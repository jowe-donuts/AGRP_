"""Authentication endpoints: register, login, and user profile."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import Role, User
from app.db.session import get_session

router = APIRouter(prefix="/api/auth", tags=["auth"])


# -----------------------------------------------------------------------
# Pydantic schemas
# -----------------------------------------------------------------------
class UserCreate(BaseModel):
    """Request body for user registration."""

    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Role = Role.STUDENT


class UserUpdate(BaseModel):
    """Request body for user profile update."""

    full_name: Optional[str] = None
    # Add more fields as needed (avatar, bio, etc.)


class TokenResponse(BaseModel):
    """Response for login/register endpoints."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Response for user profile endpoint."""

    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: Role
    is_active: bool


# -----------------------------------------------------------------------
# Register
# -----------------------------------------------------------------------
@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    """Register a new user and return a JWT access token."""
    # Check if email already exists
    existing = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password and create user
    hashed = hash_password(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name,
        role=user_in.role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate JWT
    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return {"access_token": access_token}


# -----------------------------------------------------------------------
# Login
# -----------------------------------------------------------------------
@router.post("/login", response_model=TokenResponse, summary="Obtain a JWT")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Authenticate with email/password and return a JWT access token."""
    user = session.exec(select(User).where(User.email == form.username)).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return {"access_token": access_token}


# -----------------------------------------------------------------------
# User Profile (requires authentication)
# -----------------------------------------------------------------------
@router.get("/me", response_model=UserResponse, summary="Get current user profile")
def read_me(current_user: User = Depends(get_current_user)):
    """Retrieve the authenticated user's profile information."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
    )


# -----------------------------------------------------------------------
# Update User Profile (requires authentication)
# -----------------------------------------------------------------------
@router.patch("/me", response_model=UserResponse, summary="Update current user profile")
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update the authenticated user's profile information."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
    )
