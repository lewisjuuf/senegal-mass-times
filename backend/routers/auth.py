"""
Authentication Router
Handles parish admin login and token generation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import get_db, Parish, RegistrationRequest, RegistrationResponse
from auth import create_access_token, verify_password, verify_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from email_service import notify_new_registration, notify_password_reset, FRONTEND_URL

router = APIRouter()


# ============ Schemas ============

class LoginRequest(BaseModel):
    """Login credentials"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    parish_id: int
    parish_name: str
    is_master_admin: bool = False


class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password with token"""
    token: str
    new_password: str


# ============ Endpoints ============

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Parish admin login endpoint

    Authenticates parish administrator and returns JWT token

    Args:
        credentials: Email and password
        db: Database session

    Returns:
        TokenResponse with access_token and parish info

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Find parish by admin email
    parish = db.query(Parish).filter(
        Parish.admin_email == credentials.email
    ).first()

    if not parish:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password using bcrypt
    if not parish.admin_password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Compte non configuré. Contactez l'administrateur.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(credentials.password, parish.admin_password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if account is approved (master admin bypasses this)
    if not parish.is_master_admin and not parish.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte est en attente d'approbation par l'administrateur principal.",
        )

    # Create JWT token with parish information
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "parish_id": parish.id,
        "email": parish.admin_email,
        "is_master_admin": parish.is_master_admin or False,
    }
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        parish_id=parish.id,
        parish_name=parish.name,
        is_master_admin=parish.is_master_admin or False
    )


@router.post("/register", response_model=RegistrationResponse, status_code=201)
def register(registration: RegistrationRequest, db: Session = Depends(get_db)):
    """
    Parish admin self-registration.
    Creates a parish in 'pending' (not approved) state.
    Master admin must approve before the account can log in.
    """
    # Check if admin email already exists
    existing = db.query(Parish).filter(
        Parish.admin_email == registration.admin_email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé",
        )

    # Create parish with is_approved=False
    new_parish = Parish(
        name=registration.name,
        diocese_id=registration.diocese_id,
        city=registration.city,
        region=registration.region,
        address=registration.address,
        latitude=registration.latitude,
        longitude=registration.longitude,
        phone=registration.phone,
        email=registration.email,
        website=registration.website,
        admin_email=registration.admin_email,
        admin_password_hash=get_password_hash(registration.admin_password),
        is_master_admin=False,
        is_approved=False,
    )
    db.add(new_parish)
    db.commit()
    db.refresh(new_parish)

    notify_new_registration(
        parish_name=new_parish.name,
        parish_city=new_parish.city,
        admin_email=new_parish.admin_email,
    )

    return RegistrationResponse(
        message="Inscription envoyée. En attente d'approbation par l'administrateur.",
        parish_id=new_parish.id,
        parish_name=new_parish.name,
    )


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Send a password reset email.
    Always returns success to avoid leaking which emails exist.
    """
    parish = db.query(Parish).filter(
        Parish.admin_email == request.email
    ).first()

    if parish:
        # Generate a short-lived reset token (1 hour)
        reset_token = create_access_token(
            data={"parish_id": parish.id, "purpose": "password_reset"},
            expires_delta=timedelta(hours=1),
        )
        reset_link = f"{FRONTEND_URL}/admin/reset-password?token={reset_token}"
        notify_password_reset(parish.admin_email, reset_link)

    return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using a valid reset token.
    """
    try:
        payload = verify_token(request.token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lien invalide ou expiré. Veuillez refaire une demande.",
        )

    if payload.get("purpose") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lien invalide ou expiré. Veuillez refaire une demande.",
        )

    parish_id = payload.get("parish_id")
    parish = db.query(Parish).filter(Parish.id == parish_id).first()
    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compte non trouvé.",
        )

    parish.admin_password_hash = get_password_hash(request.new_password)
    db.commit()

    return {"message": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."}
