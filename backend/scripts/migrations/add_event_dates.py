"""
Migration: Add event_start_date and event_end_date to parochial_news table.
These optional fields allow news items to specify event dates.
"""

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        for col in ["event_start_date", "event_end_date"]:
            try:
                conn.execute(text(f"ALTER TABLE parochial_news ADD COLUMN {col} DATE"))
                print(f"✓ Added column {col}")
            except Exception as e:
                if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                    print(f"- Column {col} already exists, skipping")
                else:
                    raise
        conn.commit()
    print("✓ Migration complete!")

if __name__ == "__main__":
    migrate()
