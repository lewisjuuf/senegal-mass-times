"""
Migration script to add is_approved column to parishes table.
Sets all existing parishes to approved.
"""

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from sqlalchemy import text
from backend_api import engine, SessionLocal


def add_is_approved():
    # Add column
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                ALTER TABLE parishes
                ADD COLUMN is_approved BOOLEAN DEFAULT 1
            """))
        print("Added is_approved column")
    except Exception as e:
        if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
            print("is_approved column already exists")
        else:
            raise

    # Set all existing parishes to approved
    db = SessionLocal()
    try:
        db.execute(text("UPDATE parishes SET is_approved = 1 WHERE is_approved IS NULL"))
        db.commit()
        print("All existing parishes set to approved")
    finally:
        db.close()


if __name__ == "__main__":
    print("Adding is_approved column to parishes...")
    add_is_approved()
    print("Done!")
