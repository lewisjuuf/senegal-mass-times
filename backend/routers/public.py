"""
Public Router
Handles public endpoints for viewing parishes and mass times
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import unicodedata
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import get_db, Parish, ParishResponse, ParochialNews, NewsResponse

router = APIRouter()


def _strip_accents(s: str) -> str:
    """Remove accents from a string for accent-insensitive comparison."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', s)
        if unicodedata.category(c) != 'Mn'
    )


# ============ Endpoints ============

@router.get("/")
def read_root():
    """API root endpoint with basic information"""
    return {
        "message": "Senegal Mass Times API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@router.get("/parishes", response_model=List[ParishResponse])
def get_parishes(
    city: Optional[str] = None,
    diocese_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get list of parishes with optional filtering

    Args:
        city: Search by city name OR parish name (case-insensitive partial match)
        diocese_id: Filter by diocese ID
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of parishes with their mass times
    """
    query = db.query(Parish).filter(
        Parish.is_approved == True,
        Parish.is_master_admin == False,
    )

    if diocese_id:
        query = query.filter(Parish.diocese_id == diocese_id)

    parishes = query.offset(skip).limit(limit).all()

    if city:
        # Accent-insensitive, case-insensitive search in both name and city
        search_term = _strip_accents(city).lower()
        parishes = [
            p for p in parishes
            if search_term in _strip_accents(p.name).lower()
            or search_term in _strip_accents(p.city).lower()
        ]

    return parishes


@router.get("/parishes/{parish_id}", response_model=ParishResponse)
def get_parish(parish_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information for a single parish

    Args:
        parish_id: Parish ID
        db: Database session

    Returns:
        Parish details including all mass times

    Raises:
        HTTPException 404: If parish not found
    """
    parish = db.query(Parish).filter(
        Parish.id == parish_id,
        Parish.is_approved == True,
        Parish.is_master_admin == False,
    ).first()

    if not parish:
        raise HTTPException(status_code=404, detail="Paroisse non trouvée")

    return parish


@router.get("/parishes/nearby/{latitude}/{longitude}", response_model=List[ParishResponse])
def get_nearby_parishes(
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    db: Session = Depends(get_db)
):
    """
    Find parishes near a geographic location using Haversine formula

    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        radius_km: Search radius in kilometers (default: 10km)
        db: Database session

    Returns:
        List of parishes within the specified radius

    Note:
        Only returns parishes that have latitude/longitude coordinates
    """
    from math import radians, cos, sin, asin, sqrt

    # Get all approved parishes with coordinates
    all_parishes = db.query(Parish).filter(
        Parish.latitude.isnot(None),
        Parish.longitude.isnot(None),
        Parish.is_approved == True,
        Parish.is_master_admin == False,
    ).all()

    nearby = []

    for parish in all_parishes:
        # Haversine formula to calculate distance
        lon1, lat1, lon2, lat2 = map(
            radians,
            [longitude, latitude, parish.longitude, parish.latitude]
        )

        dlon = lon2 - lon1
        dlat = lat2 - lat1

        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c  # Earth's radius in kilometers

        if km <= radius_km:
            nearby.append(parish)

    return nearby


@router.get("/parishes/{parish_id}/news", response_model=List[NewsResponse])
def get_parish_news(parish_id: int, db: Session = Depends(get_db)):
    """
    Get published news for a specific parish

    Args:
        parish_id: Parish ID
        db: Database session

    Returns:
        List of published parish news items, sorted by date (newest first)
    """
    news = db.query(ParochialNews).filter(
        ParochialNews.parish_id == parish_id,
        ParochialNews.is_active == True
    ).order_by(ParochialNews.publish_date.desc()).all()

    return news
