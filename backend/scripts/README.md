# Backend Scripts

Utility scripts for database setup, migrations, and maintenance.

## Folder Structure

```
scripts/
├── start.sh                         # Start the backend server
├── seeds/                           # Initial data setup
│   ├── database_init.py             # Create dioceses
│   └── add_dakar_parishes.py        # Bulk import Dakar parishes (via API)
├── migrations/                      # One-time database migrations
│   ├── add_master_admin.py          # Add master admin column + account
│   ├── create_news_table.py         # Add news feature table
│   ├── migrate_passwords.py         # SHA256 → bcrypt migration
│   └── cleanup_fake_parishes.sql    # Remove non-existent parishes
└── tools/                           # CLI utilities
    ├── add_parish.py                # Interactive parish creation
    └── check_parishes.py            # Check parish data
```

## Usage

All scripts should be run from the `backend/` directory:

```bash
cd backend

# Start the server
./scripts/start.sh

# Run a seed script
python3 scripts/seeds/database_init.py

# Run a migration
python3 scripts/migrations/add_master_admin.py

# Run a tool
python3 scripts/tools/check_parishes.py
```

## Master Admin

- Email: `master@admin.sn`
- Password: `password123`
- Can access and modify ALL parishes

**Change this password in production!**
