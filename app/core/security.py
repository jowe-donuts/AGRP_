"""Security helpers – password hashing and JWT handling.

All secret values are pulled from :pymod:`app.core.config.settings`. The public functions are used by the auth router and any
dependency that validates a JWT.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ValidationError

# ----------------------------------------------------------------------
# Password hashing – Passlib + Bcrypt
# ----------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a raw password using bcrypt."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Validate a password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)

# ----------------------------------------------------------------------
# JWT configuration – values sourced from settings
# ----------------------------------------------------------------------
from app.core.config import settings

SECRET_KEY = settings.jwt_secret_key
ALGORITHM = settings.jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.jwt_access_token_expires_minutes


class TokenData(BaseModel):
    """Payload extracted from a validated JWT."""

    sub: Optional[int] = None   # user_id
    role: Optional[str] = None  # Role enum string


def create_access_token(*, data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT.

    Args:
        data: Claims to embed (e.g. {"sub": str(user.id), "role": user.role}).
        expires_delta: Optional custom expiration; defaults to ``ACCESS_TOKEN_EXPIRE_MINUTES``.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    # Convert datetime to Unix timestamp (seconds since epoch)
    to_encode.update({"exp": int(expire.timestamp())})
    # Ensure sub is a string (JWT spec requires it)
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> TokenData:
    """Decode and validate a JWT, raising ``jwt.PyJWTError`` on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Convert sub back to int if it's a string
        sub = payload.get("sub")
        if sub is not None:
            sub = int(sub)
        token_data = TokenData(sub=sub, role=payload.get("role"))
        return token_data
    except jwt.ExpiredSignatureError as exc:
        print(f"DEBUG: Token expired: {exc}")
        raise
    except jwt.InvalidTokenError as exc:
        print(f"DEBUG: Invalid token: {exc}")
        raise
    except Exception as exc:
        print(f"DEBUG: Unexpected error decoding token: {type(exc).__name__}: {exc}")
        raise
