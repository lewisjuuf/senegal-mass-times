"""
Admin Router
Handles protected endpoints for parish administrators to manage their data
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import (
    get_db, Parish, MassTime, ParochialNews, Diocese,
    MassTimeCreate, MassTimeResponse, ParishResponse,
    NewsCreate, NewsUpdate, NewsResponse,
    ParishCreateRequest, ParishAdminResponse, CredentialsUpdateRequest,
    PendingParishResponse, PasswordChangeRequest
)
from auth import get_current_parish_id, get_current_user, get_password_hash, verify_password

router = APIRouter()


# ============ Helper Functions ============

def check_parish_access(current_user: dict, parish_id: int):
    """
    Check if user has access to parish (either owns it or is master admin)

    Args:
        current_user: Dict with parish_id and is_master_admin
        parish_id: ID of parish to access

    Raises:
        HTTPException 403: If user doesn't have access
    """
    if current_user["is_master_admin"]:
        return  # Master admin has access to everything

    if current_user["parish_id"] != parish_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès à cette paroisse"
        )


# ============ Schemas ============

class ParishUpdateRequest(BaseModel):
    """Schema for updating parish information"""
    name: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None


# ============ Endpoints ============

@router.get("/parish", response_model=ParishResponse)
def get_my_parish(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated parish details

    Args:
        current_user: Current user info (parish_id, is_master_admin)
        db: Database session

    Returns:
        Parish details with mass times

    Raises:
        HTTPException 404: If parish not found
    """
    parish = db.query(Parish).filter(Parish.id == current_user["parish_id"]).first()

    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée"
        )

    return parish


@router.put("/parishes/{parish_id}", response_model=ParishResponse)
def update_parish(
    parish_id: int,
    parish_update: ParishUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update parish information

    Args:
        parish_id: Parish ID to update
        parish_update: Updated parish data
        current_parish_id: Parish ID from JWT token
        db: Database session

    Returns:
        Updated parish details

    Raises:
        HTTPException 403: If trying to update a different parish
        HTTPException 404: If parish not found
    """
    # Verify the authenticated parish matches the parish being updated
    check_parish_access(current_user, parish_id)

    parish = db.query(Parish).filter(Parish.id == parish_id).first()

    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée"
        )

    # Update only provided fields
    update_data = parish_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(parish, field, value)

    db.commit()
    db.refresh(parish)

    return parish


@router.post("/parishes/{parish_id}/mass-times", response_model=MassTimeResponse)
def add_mass_time(
    parish_id: int,
    mass_time: MassTimeCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new mass time to the parish schedule

    Args:
        parish_id: Parish ID
        mass_time: Mass time details
        current_user: Current user info (parish_id, is_master_admin)
        db: Database session

    Returns:
        Created mass time

    Raises:
        HTTPException 403: If user doesn't have access to this parish
    """
    # Check access (allows master admin or parish owner)
    check_parish_access(current_user, parish_id)

    db_mass_time = MassTime(
        parish_id=parish_id,
        day_of_week=mass_time.day_of_week.value,
        time=mass_time.time,
        language=mass_time.language,
        mass_type=mass_time.mass_type,
        notes=mass_time.notes
    )

    db.add(db_mass_time)
    db.commit()
    db.refresh(db_mass_time)

    return db_mass_time


@router.put("/parishes/{parish_id}/mass-times/{mass_time_id}", response_model=MassTimeResponse)
def update_mass_time(
    parish_id: int,
    mass_time_id: int,
    mass_time: MassTimeCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing mass time

    Args:
        parish_id: Parish ID
        mass_time_id: Mass time ID to update
        mass_time: Updated mass time details
        current_user: Current user info (parish_id, is_master_admin)
        db: Database session

    Returns:
        Updated mass time

    Raises:
        HTTPException 403: If user doesn't have access to this parish
        HTTPException 404: If mass time not found
    """
    # Check access (allows master admin or parish owner)
    check_parish_access(current_user, parish_id)

    db_mass_time = db.query(MassTime).filter(
        MassTime.id == mass_time_id,
        MassTime.parish_id == parish_id
    ).first()

    if not db_mass_time:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horaire de messe non trouvé"
        )

    # Update mass time fields
    db_mass_time.day_of_week = mass_time.day_of_week.value
    db_mass_time.time = mass_time.time
    db_mass_time.language = mass_time.language
    db_mass_time.mass_type = mass_time.mass_type
    db_mass_time.notes = mass_time.notes

    db.commit()
    db.refresh(db_mass_time)

    return db_mass_time


@router.delete("/parishes/{parish_id}/mass-times/{mass_time_id}")
def delete_mass_time(
    parish_id: int,
    mass_time_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a mass time

    Args:
        parish_id: Parish ID
        mass_time_id: Mass time ID to delete
        current_user: Current user info (parish_id, is_master_admin)
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException 403: If user doesn't have access to this parish
        HTTPException 404: If mass time not found
    """
    # Check access (allows master admin or parish owner)
    check_parish_access(current_user, parish_id)

    db_mass_time = db.query(MassTime).filter(
        MassTime.id == mass_time_id,
        MassTime.parish_id == parish_id
    ).first()

    if not db_mass_time:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horaire de messe non trouvé"
        )

    db.delete(db_mass_time)
    db.commit()

    return {"message": "Horaire de messe supprimé avec succès"}


# ============ Parish News Endpoints ============

@router.get("/parish/news", response_model=List[NewsResponse])
def get_my_parish_news(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all news for the authenticated parish

    Args:
        current_user: Current user info (parish_id, is_master_admin)
        db: Database session

    Returns:
        List of parish news items
    """
    news = db.query(ParochialNews).filter(
        ParochialNews.parish_id == current_user["parish_id"]
    ).order_by(ParochialNews.publish_date.desc()).all()

    return news


@router.post("/parishes/{parish_id}/news", response_model=NewsResponse)
def add_news(
    parish_id: int,
    news: NewsCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new news item to the parish

    Args:
        parish_id: Parish ID
        news: News details
        current_parish_id: Parish ID from JWT token
        db: Database session

    Returns:
        Created news item

    Raises:
        HTTPException 403: If trying to add news to a different parish
    """
    # Check access (allows master admin or parish owner)
    check_parish_access(current_user, parish_id)

    db_news = ParochialNews(
        parish_id=parish_id,
        title=news.title,
        content=news.content,
        category=news.category
    )

    db.add(db_news)
    db.commit()
    db.refresh(db_news)

    return db_news


@router.put("/parishes/{parish_id}/news/{news_id}", response_model=NewsResponse)
def update_news(
    parish_id: int,
    news_id: int,
    news: NewsUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a news item

    Args:
        parish_id: Parish ID
        news_id: News ID to update
        news: Updated news details
        current_parish_id: Parish ID from JWT token
        db: Database session

    Returns:
        Updated news item

    Raises:
        HTTPException 403: If trying to update news of a different parish
        HTTPException 404: If news not found
    """
    # Verify the authenticated parish matches the parish being updated
    check_parish_access(current_user, parish_id)

    db_news = db.query(ParochialNews).filter(
        ParochialNews.id == news_id,
        ParochialNews.parish_id == parish_id
    ).first()

    if not db_news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actualité non trouvée"
        )

    # Update fields if provided
    if news.title is not None:
        db_news.title = news.title
    if news.content is not None:
        db_news.content = news.content
    if news.category is not None:
        db_news.category = news.category

    db.commit()
    db.refresh(db_news)

    return db_news


@router.delete("/parishes/{parish_id}/news/{news_id}")
def delete_news(
    parish_id: int,
    news_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a news item

    Args:
        parish_id: Parish ID
        news_id: News ID to delete
        current_parish_id: Parish ID from JWT token
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException 403: If trying to delete news of a different parish
        HTTPException 404: If news not found
    """
    # Verify the authenticated parish matches the parish being updated
    check_parish_access(current_user, parish_id)

    db_news = db.query(ParochialNews).filter(
        ParochialNews.id == news_id,
        ParochialNews.parish_id == parish_id
    ).first()

    if not db_news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actualité non trouvée"
        )

    db.delete(db_news)
    db.commit()

    return {"message": "Actualité supprimée avec succès"}


# ============ Master Admin Endpoints ============

@router.get("/master/parishes", response_model=List[ParishAdminResponse])
def get_all_parishes(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of all parishes (Master Admin only)

    Args:
        current_user: Current user info
        db: Database session

    Returns:
        List of all parishes

    Raises:
        HTTPException 403: If user is not master admin
    """
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    parishes = db.query(Parish).filter(
        Parish.is_master_admin == False  # Exclude master admin "parish"
    ).all()

    return parishes


@router.post("/master/parishes", response_model=ParishAdminResponse)
def create_parish(
    parish_data: ParishCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new parish with admin credentials (Master Admin only)

    Args:
        parish_data: Parish information including admin credentials
        current_user: Current user info
        db: Database session

    Returns:
        Created parish details

    Raises:
        HTTPException 403: If user is not master admin
        HTTPException 400: If admin_email already exists or diocese not found
    """
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    # Check if admin email already exists
    existing = db.query(Parish).filter(
        Parish.admin_email == parish_data.admin_email
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"L'email administrateur '{parish_data.admin_email}' est déjà utilisé"
        )

    # Verify diocese exists
    diocese = db.query(Diocese).filter(
        Diocese.id == parish_data.diocese_id
    ).first()

    if not diocese:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Diocèse non trouvé"
        )

    # Hash password
    password_hash = get_password_hash(parish_data.admin_password)

    # Create parish
    new_parish = Parish(
        name=parish_data.name,
        diocese_id=parish_data.diocese_id,
        city=parish_data.city,
        region=parish_data.region,
        address=parish_data.address,
        latitude=parish_data.latitude,
        longitude=parish_data.longitude,
        phone=parish_data.phone,
        email=parish_data.email,
        website=parish_data.website,
        admin_email=parish_data.admin_email,
        admin_password_hash=password_hash,
        is_master_admin=False,
        is_approved=True,
    )

    db.add(new_parish)
    db.commit()
    db.refresh(new_parish)

    return new_parish


@router.put("/master/parishes/{parish_id}", response_model=ParishAdminResponse)
def update_parish_admin(
    parish_id: int,
    parish_update: ParishUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update parish information (Master Admin only)

    Args:
        parish_id: Parish ID to update
        parish_update: Updated parish data
        current_user: Current user info
        db: Database session

    Returns:
        Updated parish details

    Raises:
        HTTPException 403: If user is not master admin
        HTTPException 404: If parish not found
    """
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    parish = db.query(Parish).filter(
        Parish.id == parish_id,
        Parish.is_master_admin == False  # Don't allow editing master admin
    ).first()

    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée"
        )

    # Update only provided fields
    update_data = parish_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(parish, field, value)

    db.commit()
    db.refresh(parish)

    return parish


@router.delete("/master/parishes/{parish_id}")
def delete_parish(
    parish_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a parish (Master Admin only)

    Cascade deletes all associated mass times and news.

    Args:
        parish_id: Parish ID to delete
        current_user: Current user info
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException 403: If user is not master admin
        HTTPException 404: If parish not found
        HTTPException 400: If trying to delete master admin account
    """
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    parish = db.query(Parish).filter(Parish.id == parish_id).first()

    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée"
        )

    # Prevent deleting master admin account
    if parish.is_master_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de supprimer le compte administrateur principal"
        )

    # Delete parish (cascade will handle mass_times and news)
    db.delete(parish)
    db.commit()

    return {"message": f"Paroisse '{parish.name}' supprimée avec succès"}


@router.put("/master/parishes/{parish_id}/credentials")
def update_credentials(
    parish_id: int,
    credentials: CredentialsUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update parish admin credentials (Master Admin only)

    Args:
        parish_id: Parish ID
        credentials: New admin email and/or password
        current_user: Current user info
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException 403: If user is not master admin
        HTTPException 404: If parish not found
        HTTPException 400: If new email already exists
    """
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    parish = db.query(Parish).filter(
        Parish.id == parish_id,
        Parish.is_master_admin == False
    ).first()

    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée"
        )

    # Update email if provided
    if credentials.admin_email:
        # Check if new email already exists
        existing = db.query(Parish).filter(
            Parish.admin_email == credentials.admin_email,
            Parish.id != parish_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"L'email '{credentials.admin_email}' est déjà utilisé"
            )

        parish.admin_email = credentials.admin_email

    # Update password if provided
    if credentials.admin_password:
        parish.admin_password_hash = get_password_hash(credentials.admin_password)

    db.commit()

    return {"message": "Identifiants mis à jour avec succès"}


# ============ Pending Registrations (Master Admin) ============

@router.get("/master/pending", response_model=List[PendingParishResponse])
def get_pending_registrations(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pending (unapproved) parish registrations"""
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    pending = db.query(Parish).filter(
        Parish.is_approved == False,
        Parish.is_master_admin == False,
    ).order_by(Parish.created_at.desc()).all()
    return pending


@router.put("/master/parishes/{parish_id}/approve")
def approve_parish(
    parish_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a pending parish registration"""
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    parish = db.query(Parish).filter(
        Parish.id == parish_id,
        Parish.is_master_admin == False,
    ).first()
    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée"
        )

    parish.is_approved = True
    db.commit()
    return {"message": f"Paroisse '{parish.name}' approuvée avec succès"}


@router.put("/master/parishes/{parish_id}/reject")
def reject_parish(
    parish_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject (delete) a pending parish registration"""
    if not current_user["is_master_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur principal"
        )

    parish = db.query(Parish).filter(
        Parish.id == parish_id,
        Parish.is_approved == False,
        Parish.is_master_admin == False,
    ).first()
    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paroisse non trouvée ou déjà approuvée"
        )

    db.delete(parish)
    db.commit()
    return {"message": f"Inscription de '{parish.name}' rejetée"}


# ============ Password Change (All Admins) ============

@router.put("/change-password")
def change_password(
    password_data: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change own password (requires current password verification)"""
    parish = db.query(Parish).filter(Parish.id == current_user["parish_id"]).first()
    if not parish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compte non trouvé"
        )

    if not verify_password(password_data.current_password, parish.admin_password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect"
        )

    parish.admin_password_hash = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Mot de passe modifié avec succès"}
