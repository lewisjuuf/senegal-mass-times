#!/usr/bin/env python3
"""
Script to add a new parish with admin login credentials
Usage: python3 add_parish.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend_api import SessionLocal, Parish, Diocese
from auth import get_password_hash

def add_new_parish():
    """Interactive script to add a new parish"""

    print("\n" + "="*60)
    print("ADD NEW PARISH WITH LOGIN CREDENTIALS")
    print("="*60 + "\n")

    # Get parish information
    print("📋 Parish Information:")
    name = input("Parish name (e.g., 'Paroisse Saint-Pierre'): ").strip()
    city = input("City (e.g., 'Dakar'): ").strip()
    region = input("Region (optional, press Enter to skip): ").strip() or city

    print("\n📞 Contact Information:")
    phone = input("Phone (optional, e.g., '+221 33 XXX XX XX'): ").strip() or None
    email = input("Public email (optional): ").strip() or None
    website = input("Website (optional): ").strip() or None
    address = input("Address (optional): ").strip() or None

    print("\n📍 Location (GPS Coordinates - optional):")
    lat_input = input("Latitude (e.g., 14.6928): ").strip()
    lng_input = input("Longitude (e.g., -17.4467): ").strip()
    latitude = float(lat_input) if lat_input else None
    longitude = float(lng_input) if lng_input else None

    print("\n🔐 Admin Login Credentials:")
    admin_email = input("Admin email (for login, e.g., 'admin@paroisse.sn'): ").strip()

    # Suggest a default password
    suggested_password = "password123"
    password = input(f"Admin password (press Enter for '{suggested_password}'): ").strip()
    if not password:
        password = suggested_password

    # Confirm
    print("\n" + "="*60)
    print("REVIEW INFORMATION:")
    print("="*60)
    print(f"Parish Name: {name}")
    print(f"City: {city}")
    print(f"Region: {region}")
    print(f"Phone: {phone or 'Not provided'}")
    print(f"Email: {email or 'Not provided'}")
    print(f"Website: {website or 'Not provided'}")
    print(f"Address: {address or 'Not provided'}")
    print(f"Location: {f'{latitude}, {longitude}' if latitude and longitude else 'Not provided'}")
    print(f"\nAdmin Email: {admin_email}")
    print(f"Admin Password: {password}")
    print("="*60)

    confirm = input("\nCreate this parish? (yes/no): ").strip().lower()
    if confirm not in ['yes', 'y', 'oui']:
        print("❌ Cancelled")
        return False

    # Create parish in database
    db = SessionLocal()
    try:
        # Check if admin email already exists
        existing = db.query(Parish).filter(Parish.admin_email == admin_email).first()
        if existing:
            print(f"\n❌ Error: Admin email '{admin_email}' already exists!")
            print(f"   Used by parish: {existing.name}")
            return False

        # Get Dakar diocese (ID 1)
        diocese = db.query(Diocese).filter(Diocese.id == 1).first()
        if not diocese:
            print("\n❌ Error: Dakar diocese not found in database")
            return False

        # Hash the password
        password_hash = get_password_hash(password)

        # Create new parish
        new_parish = Parish(
            name=name,
            diocese_id=diocese.id,
            city=city,
            region=region,
            address=address,
            latitude=latitude,
            longitude=longitude,
            phone=phone,
            email=email,
            website=website,
            admin_email=admin_email,
            admin_password_hash=password_hash,
            is_master_admin=False
        )

        db.add(new_parish)
        db.commit()
        db.refresh(new_parish)

        print("\n" + "="*60)
        print("✅ PARISH CREATED SUCCESSFULLY!")
        print("="*60)
        print(f"Parish ID: {new_parish.id}")
        print(f"Parish Name: {new_parish.name}")
        print(f"City: {new_parish.city}")
        print(f"\nLOGIN CREDENTIALS:")
        print(f"Email: {admin_email}")
        print(f"Password: {password}")
        print(f"\nLogin URL: http://localhost:5173/admin/login")
        print("="*60)

        return True

    except Exception as e:
        print(f"\n❌ Error creating parish: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def list_parishes():
    """List all existing parishes"""
    db = SessionLocal()
    try:
        parishes = db.query(Parish).filter(Parish.is_master_admin == False).all()

        print("\n" + "="*60)
        print(f"EXISTING PARISHES ({len(parishes)} total)")
        print("="*60)

        for p in parishes:
            print(f"\nID: {p.id}")
            print(f"Name: {p.name}")
            print(f"City: {p.city}")
            print(f"Admin Email: {p.admin_email}")

        print("="*60)

    finally:
        db.close()


if __name__ == "__main__":
    print("\n🏛️  PARISH MANAGEMENT")
    print("\nOptions:")
    print("1. Add new parish")
    print("2. List existing parishes")
    print("3. Exit")

    choice = input("\nChoose option (1-3): ").strip()

    if choice == "1":
        add_new_parish()
    elif choice == "2":
        list_parishes()
    else:
        print("Goodbye!")
