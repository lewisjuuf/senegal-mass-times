"""
One-time migration script to create parochial_news table
Run this once to add news functionality to the database
"""

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from backend_api import Base, engine, ParochialNews

def create_news_table():
    """Create the parochial_news table"""
    try:
        # Create all tables (will only create missing ones)
        Base.metadata.create_all(bind=engine)
        print("✓ News table created successfully!")
        print("\nDatabase now supports:")
        print("  - Parish news/activities")
        print("  - Events and announcements")
        print("  - Admin management interface")
        return 0
    except Exception as e:
        print(f"✗ Error creating news table: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(create_news_table())
