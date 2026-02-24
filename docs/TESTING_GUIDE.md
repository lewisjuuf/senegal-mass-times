# 🧪 Complete Testing Guide

## ⚙️ Prerequisites

Before testing, ensure you have:
- Python 3.9+ installed
- Node.js 16+ and npm installed
- Virtual environment set up for backend

## 🐍 Virtual Environment Setup (IMPORTANT!)

The backend **must** run in a virtual environment to avoid module conflicts.

**First Time Setup:**
```bash
cd senegal-mass-times/backend

# The venv already exists, just activate it
source venv/bin/activate

# You should see (venv) in your prompt:
# (venv) user@computer backend %

# Install all dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Verify installations
pip list | grep -E "fastapi|uvicorn|jose|passlib|sqlalchemy"
```

**Expected output:**
```
bcrypt                   5.0.0
fastapi                  0.104.1
passlib                  1.7.4
pydantic                 2.5.0
python-jose              3.3.0
sqlalchemy               2.0.23
uvicorn                  0.24.0
```

✅ If you see all these packages, you're ready to go!

---

## Quick Start (2 Terminals)

### Terminal 1 - Backend (with Virtual Environment)

**RECOMMENDED: Use the startup script (handles venv automatically)**
```bash
cd senegal-mass-times/backend
./start.sh
```

**Or manually (if you prefer):**
```bash
cd senegal-mass-times/backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies (first time or if updated)
pip install -r requirements.txt

# Start server
python3 -m uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000
```

**Troubleshooting Module Errors:**
If you get "ModuleNotFoundError", make sure venv is activated:
```bash
cd senegal-mass-times/backend
source venv/bin/activate  # You should see (venv) in your prompt
pip install --upgrade pip
pip install -r requirements.txt
```

✅ **Backend running at:** http://localhost:8000
📖 **API Docs at:** http://localhost:8000/docs

---

### Terminal 2 - Frontend
```bash
cd senegal-mass-times
./START_FRONTEND.sh
```

**Or manually:**
```bash
cd senegal-mass-times/frontend
npm install  # First time only
npm run dev
```

✅ **Frontend running at:** http://localhost:5173

---

## 🔐 Test Credentials

Use any of these parishes to login:

| Parish | Email | Password |
|--------|-------|----------|
| Cathédrale du Souvenir Africain | admin@cathedrale-dakar.sn | password123 |
| Saint-Joseph de Médina | admin@stjoseph-medina.sn | password123 |
| Sacré-Coeur de Mermoz | admin@sacrecoeur-mermoz.sn | password123 |

**All 15 parishes use the same password:** `password123`

---

## 📋 Component Testing Checklist

### ✅ 1. Test Authentication (LoginPage)

**URL:** http://localhost:5173/admin/login

**Test Cases:**

✓ **Valid Login:**
1. Enter email: `admin@cathedrale-dakar.sn`
2. Enter password: `password123`
3. Click "Se connecter"
4. Should redirect to dashboard
5. Check browser console - no errors
6. Check localStorage - should have `auth_token`, `parish_id`, `parish_name`

✓ **Invalid Login:**
1. Enter email: `admin@cathedrale-dakar.sn`
2. Enter password: `wrongpassword`
3. Click "Se connecter"
4. Should show error: "Email ou mot de passe incorrect"
5. Should NOT redirect

✓ **Form Validation:**
1. Leave email empty → Submit should be blocked
2. Enter invalid email format → Browser validation
3. Check responsive design on mobile view

**Expected Behavior:**
- Beautiful gradient background ✨
- Centered white card with cross icon
- French language throughout
- Loading spinner while authenticating
- Auto-redirect to dashboard on success

---

### ✅ 2. Test Protected Route (ProtectedRoute)

**Test Case:**

1. **Without Login:**
   - Go directly to: http://localhost:5173/admin/dashboard
   - Should auto-redirect to login page

2. **With Login:**
   - Login first
   - Navigate to: http://localhost:5173/admin/dashboard
   - Should see dashboard (no redirect)

3. **Check Loading State:**
   - On fresh page load, should show spinner briefly
   - Then render content if authenticated

---

### ✅ 3. Test Dashboard (DashboardPage)

**URL:** http://localhost:5173/admin/dashboard (after login)

**Test Cases:**

✓ **Summary Cards:**
1. Check "Total des messes" card - shows count
2. Check "Messes actives" card - shows active count
3. Check "Messes dimanche" card - shows Sunday count
4. Check "Messes semaine" card - shows weekday count
5. All cards should have matching colors and icons

✓ **Quick Actions:**
1. Click "Gérer les horaires des messes" → Goes to /admin/mass-times
2. Click "Modifier les informations" → Goes to /admin/parish-info
3. Hover effects work properly

✓ **Parish Info Summary:**
1. Displays parish name
2. Shows city and region
3. Shows contact details (phone, email, website)
4. Shows "Non renseigné" for missing fields

✓ **Navigation:**
1. AdminNavbar is visible at top
2. Parish name shows in navbar
3. All nav links work
4. Mobile menu works (test on narrow screen)

---

### ✅ 4. Test Mass Times Management (MassTimesPage) ⭐

**URL:** http://localhost:5173/admin/mass-times

This is the **PRIORITY FEATURE** - test thoroughly!

#### A) **View Masses:**

✓ **Display:**
1. Masses grouped by day (Dimanche, Lundi, Mardi, etc.)
2. Each day in correct order (Sunday → Saturday)
3. Each mass shows:
   - Time in large font
   - Language badge
   - Mass type (if present)
   - Notes (if present)
4. Edit and delete buttons visible for each mass

✓ **Empty State:**
1. If parish has no masses, shows:
   - Clock icon
   - "Aucune messe enregistrée" message
   - "Ajouter la première messe" button

#### B) **Add Mass:**

✓ **Test Adding:**
1. Click "Ajouter une messe" button
2. Modal opens with title "Ajouter une messe"
3. Fill form:
   - Jour: Select "Dimanche" (Sunday)
   - Heure: Enter "10:00"
   - Langue: Select "French"
   - Type de messe: Enter "Messe principale"
   - Notes: Enter "Test mass"
4. Click "Ajouter"
5. Check results:
   - Modal closes
   - Green success message appears
   - New mass appears in the list under "Dimanche"
   - Page updates without reload

✓ **Form Validation:**
1. Try to submit without time → Should be blocked
2. Time field should use HH:MM format
3. Day selector shows French names

✓ **Cancel:**
1. Click "Ajouter une messe"
2. Click "Annuler" → Modal closes, no changes

#### C) **Edit Mass:**

✓ **Test Editing:**
1. Find an existing mass
2. Click the Edit button (✎ icon)
3. Modal opens with title "Modifier la messe"
4. Form is pre-filled with current data
5. Change time to "11:00"
6. Change language to "Wolof"
7. Click "Modifier"
8. Check results:
   - Modal closes
   - Success message appears
   - Changes are reflected in the list
   - Mass stays in same day group

✓ **Cancel:**
1. Click Edit
2. Make changes
3. Click "Annuler" → No changes saved

#### D) **Delete Mass:**

✓ **Test Deleting:**
1. Find a mass to delete
2. Click the Delete button (🗑 icon)
3. Confirmation modal appears
4. Shows mass details (day, time, language)
5. Shows warning: "Cette action est irréversible"
6. Click "Supprimer"
7. Check results:
   - Modal closes
   - Success message appears
   - Mass removed from list
   - If it was the last mass for that day, day section disappears

✓ **Cancel:**
1. Click Delete
2. Click "Annuler" → Mass NOT deleted

#### E) **Error Handling:**

✓ **Test Errors:**
1. Stop backend server
2. Try to add a mass
3. Should show error message in red
4. Restart backend
5. Try again → Should work

#### F) **Multiple Operations:**

✓ **Test Flow:**
1. Add 3 different masses (different days)
2. Edit one of them
3. Delete one
4. Check all updates reflect correctly
5. Refresh page → Changes persist

---

### ✅ 5. Test Admin Navbar (AdminNavbar)

**Test Cases:**

✓ **Desktop Navigation:**
1. All links visible: Tableau de bord, Horaires des messes, Informations
2. Parish name displays
3. Active link highlighted in indigo
4. Hover effects work
5. Click each link → Navigates correctly
6. Logout button shows in red

✓ **Mobile Navigation:**
1. Resize window to < 768px
2. Hamburger menu appears
3. Click hamburger → Menu opens
4. Parish name shows in mobile menu
5. Click a link → Navigates and menu closes
6. Click X → Menu closes

✓ **Logout:**
1. Click "Déconnexion"
2. Redirects to login page
3. localStorage cleared (check DevTools)
4. Can't access admin pages anymore

---

### ✅ 6. Test UI Components

#### Modal Component:

1. Open any modal (Add mass, Edit mass, Delete mass)
2. Check backdrop (dark overlay)
3. Click outside modal → Doesn't close (by design)
4. Press Escape key → Closes
5. Click X button → Closes
6. Check responsive sizing

#### LoadingSpinner:

1. Logout and login again
2. Watch for spinner during:
   - Initial auth check
   - Login submission
   - Dashboard data loading
   - Mass times loading
3. Spinner should show French text "Chargement..."

---

## 🔍 Backend API Testing

### Using Swagger UI:

1. Go to: http://localhost:8000/docs
2. You'll see all API endpoints

#### Test Public Endpoints:

✓ **GET /api/parishes**
1. Click "Try it out"
2. Click "Execute"
3. Should return list of 15 parishes
4. No authentication needed

✓ **GET /api/parishes/1**
1. Try it out with ID = 1
2. Should return Cathédrale details with mass_times array

#### Test Auth Endpoint:

✓ **POST /api/auth/login**
1. Click "Try it out"
2. Enter JSON:
```json
{
  "email": "admin@cathedrale-dakar.sn",
  "password": "password123"
}
```
3. Click "Execute"
4. Should return access_token, parish_id, parish_name
5. Copy the access_token

#### Test Admin Endpoints:

✓ **GET /api/admin/parish**
1. Click the lock icon 🔒
2. Enter: `Bearer {paste-your-token}`
3. Click "Authorize"
4. Try the endpoint
5. Should return your parish data

✓ **POST /api/admin/parishes/1/mass-times**
1. Make sure authorized (lock should be closed)
2. Try it out with:
```json
{
  "day_of_week": "Sunday",
  "time": "09:00:00",
  "language": "French",
  "mass_type": "Test Mass"
}
```
3. Should create new mass time

---

## 🐛 Troubleshooting

### Backend Issues:

**Port 8000 already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
# Then restart backend
```

**Module not found errors:**
```bash
cd backend

# IMPORTANT: Activate virtual environment first!
source venv/bin/activate

# You should see (venv) in your terminal prompt
# Example: (venv) user@computer backend %

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Verify installations
pip list | grep -E "fastapi|uvicorn|jose|passlib"
```

**Still getting errors? Clean install:**
```bash
cd backend
source venv/bin/activate

# Remove cache and reinstall
pip cache purge
pip install --no-cache-dir -r requirements.txt
```

**Database errors:**
```bash
# Database already exists, should work fine
# If issues, delete and recreate:
rm senegal_masses.db
python3 database_init.py
python3 migrate_passwords_direct.py
```

### Frontend Issues:

**Port 5173 already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Then restart frontend
```

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
cd frontend
npm run build
# Check for errors
```

**Network errors in browser:**
1. Check backend is running on port 8000
2. Check browser console for CORS errors
3. Make sure API_BASE_URL is correct in `services/api.js`

### Authentication Issues:

**Login fails with 401:**
1. Check password is exactly `password123`
2. Check email is correct
3. Check backend logs for errors

**Redirect loop:**
1. Clear browser localStorage
2. Clear cookies
3. Restart frontend dev server

**Token expired:**
1. Tokens expire after 24 hours
2. Logout and login again

---

## ✅ Complete Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access login page
- [ ] Can login with valid credentials
- [ ] Invalid login shows error
- [ ] Protected routes redirect when not logged in
- [ ] Dashboard loads with correct data
- [ ] Summary cards show correct counts
- [ ] Can navigate between admin pages
- [ ] Can view existing mass times grouped by day
- [ ] Can add a new mass
- [ ] Can edit an existing mass
- [ ] Can delete a mass with confirmation
- [ ] Success/error messages appear correctly
- [ ] Mobile responsive (test at < 768px width)
- [ ] AdminNavbar mobile menu works
- [ ] Can logout successfully
- [ ] API docs accessible at /docs
- [ ] Can test endpoints in Swagger UI

---

## 📊 Test Data Overview

**Dioceses:** 7 total
- Archdiocese of Dakar
- Diocese of Kolda
- Diocese of Kaolack
- Diocese of Saint-Louis
- Diocese of Tambacounda
- Diocese of Thiès
- Diocese of Ziguinchor

**Parishes:** 15 in Dakar
- Various neighborhoods: Plateau, Médina, Ouakam, Mermoz, etc.
- All have admin accounts with password `password123`
- Most have 4-7 mass times already configured

**Languages in Dataset:**
- French
- Wolof
- English
- Serer
- Portuguese

---

## 🎯 Success Criteria

Your testing is successful when:

1. ✅ You can login without errors
2. ✅ Dashboard shows real parish data
3. ✅ You can complete full CRUD cycle on masses:
   - Create → See it appear
   - Edit → See changes
   - Delete → See it removed
4. ✅ Navigation works smoothly
5. ✅ No console errors in browser
6. ✅ Mobile view works properly
7. ✅ French language throughout admin

**If all these pass, your admin dashboard is fully functional!** 🎉

---

## 💡 Pro Testing Tips

1. **Use Chrome DevTools:**
   - F12 to open
   - Check Console for errors
   - Check Network tab for API calls
   - Check Application → Local Storage for tokens

2. **Test Multiple Parishes:**
   - Login with different parish accounts
   - Verify each sees only their own data
   - Verify can't edit other parishes

3. **Test Edge Cases:**
   - Add mass at midnight (00:00)
   - Add mass at 23:59
   - Add multiple masses at same time
   - Delete all masses then add new ones

4. **Performance:**
   - Check page load times
   - Check API response times in Network tab
   - Test with slow 3G simulation

5. **Accessibility:**
   - Try navigating with keyboard only
   - Check color contrast
   - Test with screen reader if possible

---

## 🚀 Next: Share Your Feedback!

After testing, if you find any issues, you can:
1. Check the browser console for error messages
2. Check backend terminal for API errors
3. Verify database has data: `sqlite3 backend/senegal_masses.db "SELECT * FROM parishes LIMIT 5;"`

---

## 📋 Quick Reference Card

### Start Everything (Copy & Paste)

**Terminal 1 - Backend:**
```bash
cd /Users/louisdiouf/Documents/workarea/senegal-mass-times/backend
source venv/bin/activate  # Must do this first!
python3 -m uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/louisdiouf/Documents/workarea/senegal-mass-times/frontend
npm run dev
```

**Browser:**
```
http://localhost:5173/admin/login
```

**Login:**
```
Email: admin@cathedrale-dakar.sn
Password: password123
```

### Quick Fixes

**Backend won't start?**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend errors?**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Port already in use?**
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

---

**Happy Testing!** 🎊
