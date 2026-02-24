"""
Migration script to add master admin functionality
Adds is_master_admin column and creates a master admin account
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text
from backend_api import engine, SessionLocal, Parish
from auth import get_password_hash

def add_master_admin():
    """Add is_master_admin column and create master admin account"""

    # Add is_master_admin column if it doesn't exist
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                ALTER TABLE parishes
                ADD COLUMN is_master_admin BOOLEAN DEFAULT 0
            """))
        print("✓ Added is_master_admin column to parishes table")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("✓ is_master_admin column already exists")
        else:
            print(f"Error adding column: {e}")
            return False

    # Create master admin parish
    db = SessionLocal()
    try:
        # Delete existing master admin if it exists (clean slate)
        existing = db.query(Parish).filter(
            Parish.admin_email == "master@admin.sn"
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            print("✓ Removed existing master admin")

        # Create new master admin
        password = "admin123"  # Simple password for testing
        password_hash = get_password_hash(password)
        print(f"Password hash length: {len(password_hash)} bytes")

        master_admin = Parish(
            name="Administrateur Principal",
            diocese_id=1,  # Dakar diocese
            city="Dakar",
            region="Dakar",
            admin_email="master@admin.sn",
            admin_password_hash=password_hash,
            is_master_admin=True
        )
        db.add(master_admin)
        db.commit()
        print("✓ Created master admin account")
        print("\n" + "="*60)
        print("MASTER ADMIN CREDENTIALS:")
        print("="*60)
        print("Email:    master@admin.sn")
        print(f"Password: {password}")
        print("="*60)
        print("\n⚠️  IMPORTANT: Change this password in production!")

        return True
    except Exception as e:
        print(f"✗ Error creating master admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔧 Adding Master Admin Functionality...\n")
    success = add_master_admin()

    if success:
        print("\n✅ Master admin setup complete!")
        print("\nMaster admin can:")
        print("  - Login to any parish account")
        print("  - View all parishes")
        print("  - Modify any parish data")
        print("  - Manage mass times and news for all parishes")
    else:
        print("\n❌ Master admin setup failed")
        sys.exit(1)
