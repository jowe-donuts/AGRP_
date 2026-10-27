"""FastAPI dependencies for authentication and RBAC."""

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from app.core.security import decode_access_token, TokenData
from app.db.models import Role, User
from app.db.session import get_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Security(oauth2_scheme), session: Session = Depends(get_session)
) -> User:
    """Decode JWT, look up the user, and ensure the account is active."""
    try:
        payload: TokenData = decode_access_token(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if payload.sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = session.get(User, payload.sub)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def require_role(required_role: Role):
    """Dependency factory – use ``Depends(require_role(Role.ADMIN))`` to enforce role checks."""

    async def role_checker(user: User = Depends(get_current_user)):
        # Simple hierarchy: ADMIN > STAFF > STUDENT
        hierarchy = {
            Role.ADMIN: 3,
            Role.STAFF: 2,
            Role.STUDENT: 1,
        }
        if hierarchy[user.role] < hierarchy[required_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role.value} privileges",
            )
        return user

    return role_checker