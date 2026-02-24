"""SQLAlchemy database models"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Time, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base


class Diocese(Base):
    __tablename__ = "dioceses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    bishop = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    parishes = relationship("Parish", back_populates="diocese")


class Parish(Base):
    __tablename__ = "parishes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    diocese_id = Column(Integer, ForeignKey("dioceses.id"))
    city = Column(String, nullable=False)
    region = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    admin_email = Column(String, unique=True)
    admin_password_hash = Column(String)
    is_master_admin = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    diocese = relationship("Diocese", back_populates="parishes")
    mass_times = relationship("MassTime", back_populates="parish", cascade="all, delete-orphan")
    news = relationship("ParochialNews", back_populates="parish", cascade="all, delete-orphan")


class MassTime(Base):
    __tablename__ = "mass_times"
    id = Column(Integer, primary_key=True, index=True)
    parish_id = Column(Integer, ForeignKey("parishes.id"))
    day_of_week = Column(String, nullable=False)
    time = Column(Time, nullable=False)
    language = Column(String, default="French")
    mass_type = Column(String)
    is_active = Column(Boolean, default=True)
    notes = Column(String)
    parish = relationship("Parish", back_populates="mass_times")


class ParochialNews(Base):
    __tablename__ = "parochial_news"
    id = Column(Integer, primary_key=True, index=True)
    parish_id = Column(Integer, ForeignKey("parishes.id"))
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    category = Column(String, default="General")
    is_active = Column(Boolean, default=True)
    publish_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    parish = relationship("Parish", back_populates="news")
