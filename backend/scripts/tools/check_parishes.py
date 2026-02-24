"""Check parish data in database"""
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from backend_api import SessionLocal, Parish

db = SessionLocal()
parishes = db.query(Parish).limit(3).all()

for p in parishes:
    print(f"Parish: {p.name}")
    print(f"Email: {p.admin_email}")
    print(f"Password Hash: {p.admin_password_hash[:50] if p.admin_password_hash else 'None'}...")
    print(f"Hash Length: {len(p.admin_password_hash) if p.admin_password_hash else 0}")
    print()

db.close()
