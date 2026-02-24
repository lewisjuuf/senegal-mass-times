"""
Senegal Mass Times API - Backend
FastAPI application for managing church mass schedules
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

# Import models to register them with SQLAlchemy
from models import Diocese, Parish, MassTime, ParochialNews  # noqa: F401

# Re-export for backward compatibility
# (routers, auth, and scripts all import from backend_api)
from database import SessionLocal, get_db  # noqa: F401, F811
from schemas import *  # noqa: F401, F403

# ============ FastAPI App ============

app = FastAPI(
    title="Senegal Mass Times API",
    description="API for Catholic Mass schedules in Senegal",
    version="2.0.0"
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Create tables and initialize master admin on first run"""
    Base.metadata.create_all(bind=engine)

    master_email = os.getenv("MASTER_ADMIN_EMAIL")
    master_password = os.getenv("MASTER_ADMIN_PASSWORD")
    if master_email and master_password:
        db = SessionLocal()
        try:
            existing = db.query(Parish).filter(Parish.admin_email == master_email).first()
            if not existing:
                from auth import get_password_hash
                # Ensure diocese exists
                if not db.query(Diocese).filter(Diocese.id == 1).first():
                    db.add(Diocese(id=1, name="Archidiocese de Dakar"))
                    db.commit()
                master = Parish(
                    name="Administrateur Principal",
                    diocese_id=1,
                    city="Dakar",
                    region="Dakar",
                    admin_email=master_email,
                    admin_password_hash=get_password_hash(master_password),
                    is_master_admin=True,
                    is_approved=True,
                )
                db.add(master)
                db.commit()
        finally:
            db.close()

# ============ Include Routers ============

from routers import auth, public, admin  # noqa: E402

app.include_router(public.router, prefix="/api", tags=["Public"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# ============ Main ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
