"""
JWT Authentication Module for Senegal Mass Times Platform
Provides token-based authentication for parish administrators
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer scheme for JWT tokens
security = HTTPBearer()


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password

    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to check against

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token

    Args:
        data: Dictionary of claims to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_parish_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """
    Dependency to extract parish ID from JWT token

    Args:
        credentials: HTTP Authorization credentials with Bearer token

    Returns:
        Parish ID from the token

    Raises:
        HTTPException: If token is invalid or missing parish_id
    """
    token = credentials.credentials
    payload = verify_token(token)

    parish_id = payload.get("parish_id")
    if parish_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return parish_id


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to extract user info from JWT token (parish_id and is_master_admin)

    Args:
        credentials: HTTP Authorization credentials with Bearer token

    Returns:
        Dictionary with parish_id and is_master_admin

    Raises:
        HTTPException: If token is invalid or missing required fields
    """
    token = credentials.credentials
    payload = verify_token(token)

    parish_id = payload.get("parish_id")
    is_master_admin = payload.get("is_master_admin", False)

    if parish_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"parish_id": parish_id, "is_master_admin": is_master_admin}


def get_current_parish(
    parish_id: int = Depends(get_current_parish_id),
    db: Session = Depends(lambda: None)  # Will be overridden with actual DB dependency
):
    """
    Dependency to get the current authenticated parish from database

    Args:
        parish_id: Parish ID extracted from token
        db: Database session

    Returns:
        Parish object

    Raises:
        HTTPException: If parish not found

    Note:
        The db dependency will be properly injected when used in routes
    """
    from backend_api import Parish  # Import here to avoid circular dependency

    parish = db.query(Parish).filter(Parish.id == parish_id).first()
    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée"
        )

    return parish
