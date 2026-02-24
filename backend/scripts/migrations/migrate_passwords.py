"""
Password Migration Script
Migrates parish passwords from SHA256 to bcrypt hashing
"""

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from backend_api import SessionLocal, Parish
from auth import get_password_hash

def migrate_passwords():
    """
    Migrate all parish passwords from SHA256 to bcrypt.
    Uses the known default password 'password123' for all parishes.
    """
    db = SessionLocal()

    try:
        # Get all parishes
        parishes = db.query(Parish).all()

        print(f"Found {len(parishes)} parishes to migrate...")

        # Default password for all test parishes
        default_password = "password123"

        updated_count = 0

        for parish in parishes:
            if parish.admin_email:
                # Generate fresh bcrypt hash for each parish
                # (bcrypt includes a salt, so each hash is unique)
                parish.admin_password_hash = get_password_hash(default_password)
                updated_count += 1
                print(f"✅ Updated: {parish.name} ({parish.admin_email})")

        db.commit()

        print(f"\n🎉 Migration complete! Updated {updated_count} parishes.")
        print(f"All parishes now use bcrypt password hashing.")
        print(f"Default password for all parishes: {default_password}")

    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Parish Password Migration Script")
    print("Migrating from SHA256 to bcrypt...")
    print("=" * 60)
    print()
    migrate_passwords()
