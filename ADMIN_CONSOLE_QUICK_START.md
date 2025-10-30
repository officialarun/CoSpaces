# 🚀 Admin Console - Quick Start

## TL;DR

```bash
# 1. Install dependencies
cd packages/admin-frontend
npm install

# 2. Start admin console
npm run dev
```

Access at: **http://localhost:3001**

---

## ✅ What You Get

### 3 Main Tabs:
1. **Users** - View, edit, deactivate users + track onboarding
2. **Projects** - Publish/unpublish/delete projects  
3. **KYC** - Review and approve/reject KYC submissions

### Features:
- ✅ Auto-refresh every 30 seconds
- ✅ Search and filters
- ✅ Pagination
- ✅ Modal-based editing
- ✅ Real-time badge counts
- ✅ Responsive design

---

## 🔐 First Login

### Step 1: Create Admin User

**Option A - MongoDB Direct:**
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

**Option B - Seed Script:**
```bash
node packages/backend/scripts/seed-admin.js
```

Creates admin with:
- Email: `admin@fractionalland.com`
- Password: `Admin@12345`

### Step 2: Login
1. Go to http://localhost:3001
2. Enter admin email and password
3. You're in! 🎉

---

## 📋 Quick Tasks

### Approve KYC:
1. Dashboard → KYC Tab
2. Click "Review" on pending user
3. Review details
4. Click "Approve KYC"

### Publish Project:
1. Dashboard → Projects Tab
2. Find unpublished project
3. Click eye icon (👁️)
4. Confirm
5. Project now visible to users!

### Edit User:
1. Dashboard → Users Tab
2. Click pencil icon (✏️)
3. Update fields
4. Save changes

---

## 🎯 Architecture

```
Admin Frontend (Port 3001)
          ↓
     Backend API (Port 5000)
          ↓
      MongoDB Database
```

- **Shared Auth**: Same JWT system as user frontend
- **Role Check**: Only `role: 'admin'` allowed
- **CORS**: Backend allows both 3000 and 3001

---

## ⚙️ Configuration

**Environment** (`packages/admin-frontend/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

**Backend CORS** (already configured):
```javascript
// server.js
allowedOrigins = [
  'http://localhost:3000',  // User frontend
  'http://localhost:3001'   // Admin frontend ✅
];
```

---

## 🐛 Troubleshooting

### Can't Login?
- Check user has `role: 'admin'`
- Backend running on port 5000?
- Clear browser cache

### Dashboard Not Loading?
- Check browser console
- Verify `NEXT_PUBLIC_API_URL` in .env
- Backend CORS allows 3001

### Changes Not Saving?
- Check backend logs
- Network tab shows 200 OK?
- Wait for auto-refresh (30s)

---

## 📚 Full Documentation

See **ADMIN_CONSOLE_GUIDE.md** for complete details on:
- All features explained
- Detailed workflows
- Security information
- Best practices
- Troubleshooting

---

## ✨ Tech Stack

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- Axios
- React Hot Toast
- React Icons

**Backend:**
- Existing Express API
- New admin routes
- Admin middleware
- Audit logging

---

**Ready to go! Start managing your platform! 🎉**

