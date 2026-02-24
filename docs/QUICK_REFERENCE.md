# Quick Reference Guide

## 🚀 Starting the Application

### Backend
```bash
cd backend
./scripts/start.sh
```
Server runs on: http://localhost:8000

### Frontend
```bash
cd frontend
npm run dev
```
App runs on: http://localhost:5173

### Tests
```bash
cd backend/tests
./run_tests.sh
```

## 🔑 Login Credentials

### Master Admin (Can manage ALL parishes)
```
Email:    master@admin.sn
Password: password123
```
**Powers:**
- View all parishes
- Edit ANY parish's mass times
- Edit ANY parish's news
- Update ANY parish's info

### Regular Parish Admins (Can only manage their own)
```
Email:    admin@cathedrale-dakar.sn
Password: password123
(Parish: Cathédrale du Souvenir Africain)
```

```
Email:    admin@stjoseph-medina.sn
Password: password123
(Parish: Paroisse Saint-Joseph de Médina)
```

## 📁 Project Structure

```
backend/
├── backend_api.py          # Main API (✅ Updated: data/ path)
├── auth.py                 # Auth (✅ Updated: master admin)
├── scripts/                # ✨ NEW - Utilities
│   ├── start.sh           # Start server
│   ├── add_master_admin.py
│   └── create_news_table.py
├── data/                   # ✨ NEW - Database
│   ├── senegal_masses.db
│   └── backups/
├── tests/                  # Tests
│   ├── test_api.py
│   └── run_tests.sh
└── routers/                # API routes
    ├── admin.py           # ✅ Updated: master admin
    ├── public.py
    └── auth.py            # ✅ Updated: is_master_admin in JWT
```

## 🆕 New Features

### 1. Master Admin
- Login as `master@admin.sn`
- Can edit ANY parish
- Special endpoint: `GET /api/admin/master/parishes`

### 2. Nearby Parish Search
- Click "Trouver les paroisses près de moi" on search page
- Uses browser geolocation
- Shows parishes within 10km

### 3. Parish News
- Admin: `/admin/news`
- Add/Edit/Delete news for your parish
- Public can see news on parish detail page

### 4. Clean Structure
- Scripts in `scripts/` folder
- Database in `data/` folder
- Tests in `tests/` folder

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
./scripts/start.sh
```

### Database not found
- Check that `data/senegal_masses.db` exists
- If missing, restore from `data/backups/`

### Master admin doesn't work
```bash
cd backend
python3 scripts/add_master_admin.py
```

## 📝 Key Changes Made

1. **Database path:** `./senegal_masses.db` → `./data/senegal_masses.db`
2. **Added column:** `is_master_admin` to parishes table
3. **JWT updated:** Now includes `is_master_admin` flag
4. **Auth updated:** All admin endpoints support master admin
5. **Structure:** Organized into `scripts/`, `data/`, `tests/`

## ⚠️ Security

**IMPORTANT:** Change master admin password before production!

Option 1 - Via SQL:
```sql
UPDATE parishes
SET admin_password_hash = '<new_bcrypt_hash>'
WHERE admin_email = 'master@admin.sn';
```

Option 2 - Via admin interface (once logged in)

---

**Everything tested and working!** ✅
