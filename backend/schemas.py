"""Pydantic schemas for request/response validation"""

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, time
from enum import Enum


class DayOfWeek(str, Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"


class MassTimeCreate(BaseModel):
    day_of_week: DayOfWeek
    time: time
    language: str = "French"
    mass_type: Optional[str] = None
    notes: Optional[str] = None


class MassTimeResponse(BaseModel):
    id: int
    day_of_week: str
    time: time
    language: str
    mass_type: Optional[str]
    notes: Optional[str]
    is_active: bool
    class Config:
        from_attributes = True


class NewsCreate(BaseModel):
    title: str
    content: str
    category: str = "General"


class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None


class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    is_active: bool
    publish_date: datetime
    class Config:
        from_attributes = True


class ParishCreate(BaseModel):
    name: str
    diocese_id: int
    city: str
    region: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    admin_email: EmailStr
    admin_password: str


class ParishResponse(BaseModel):
    id: int
    name: str
    diocese_id: int
    city: str
    region: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    mass_times: List[MassTimeResponse] = []
    class Config:
        from_attributes = True


class ParishCreateRequest(BaseModel):
    """Schema for creating a new parish with admin credentials"""
    name: str
    diocese_id: int = 1
    city: str
    region: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    admin_email: EmailStr
    admin_password: str


class ParishAdminResponse(BaseModel):
    """Schema for parish list with admin email (Master Admin only)"""
    id: int
    name: str
    diocese_id: int
    city: str
    region: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    admin_email: str
    is_approved: bool
    created_at: datetime
    class Config:
        from_attributes = True


class CredentialsUpdateRequest(BaseModel):
    """Schema for updating parish admin credentials"""
    admin_email: Optional[EmailStr] = None
    admin_password: Optional[str] = None


class RegistrationRequest(BaseModel):
    """Schema for parish admin self-registration"""
    name: str
    diocese_id: int = 1
    city: str
    region: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    admin_email: EmailStr
    admin_password: str


class RegistrationResponse(BaseModel):
    """Response after successful registration"""
    message: str
    parish_id: int
    parish_name: str


class PendingParishResponse(BaseModel):
    """Schema for pending parish registrations (Master Admin view)"""
    id: int
    name: str
    diocese_id: int
    city: str
    region: Optional[str]
    address: Optional[str]
    admin_email: str
    is_approved: bool
    created_at: datetime
    class Config:
        from_attributes = True


class PasswordChangeRequest(BaseModel):
    """Schema for changing own password"""
    current_password: str
    new_password: str
