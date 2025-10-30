# Google OAuth for Admin Console

## ✅ Google Login Support Added!

Admins can now log in to the admin console using Google OAuth.

---

## How It Works

### Flow Overview:
1. Admin clicks "Continue with Google" on admin login page (port 3001)
2. Frontend sets `adminLoginAttempt` flag and passes state parameter
3. Redirects to backend Google OAuth endpoint
4. User authenticates with Google
5. Google redirects back to backend callback
6. Backend extracts state parameter to determine redirect URL
7. Backend redirects to admin console callback (`http://localhost:3001/auth/callback`)
8. Admin frontend extracts token, verifies admin role
9. If admin: Login successful → Dashboard
10. If not admin: Show "Unauthorized" page

---

## Requirements

### For Google OAuth to Work:

1. **Google OAuth Credentials** must be configured in `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
   ```

2. **User must have admin role** in database:
   ```javascript
   db.users.updateOne(
     { email: "your-google@email.com" },
     { $set: { role: "admin" } }
   )
   ```

---

## What Was Changed

### Backend (3 files):

1. **`packages/backend/src/config/passport.js`**
   - Added `passReqToCallback: true` to enable state parameter

2. **`packages/backend/src/routes/auth.routes.js`**
   - Modified `/google` route to preserve state parameter
   - State contains: `{ isAdmin: true, redirectUrl: "http://localhost:3001" }`

3. **`packages/backend/src/controllers/auth.controller.js`**
   - Updated `googleCallback` to extract state parameter
   - Determines redirect URL based on state (admin or user frontend)
   - Redirects to appropriate frontend with token

### Frontend (2 files):

1. **`packages/admin-frontend/components/GoogleLoginButton.js`**
   - Created Google login button component
   - Sets `adminLoginAttempt` flag in localStorage
   - Passes state parameter with admin flag and redirect URL

2. **`packages/admin-frontend/pages/login.js`**
   - Added "Continue with Google" button
   - Added divider between email/password and Google login

3. **`packages/admin-frontend/pages/auth/callback.js`**
   - Created callback handler for Google OAuth
   - Extracts token from URL parameters
   - Stores token in localStorage
   - Fetches user data and verifies admin role
   - Redirects to dashboard (admin) or unauthorized (non-admin)

---

## Security Features

### Admin Role Verification:
1. ✅ Frontend checks `adminLoginAttempt` flag
2. ✅ Backend redirects to correct URL based on state
3. ✅ Frontend callback verifies user has `role: 'admin'`
4. ✅ Non-admin users redirected to unauthorized page
5. ✅ Tokens cleared if not admin

### Token Handling:
- JWT token passed via URL parameter
- Stored in localStorage as `adminToken`
- Refresh token also stored
- Tokens cleared on failed admin check
- Auto-logout on 401 errors

---

## Testing Google OAuth

### Test Scenario 1: Admin User
1. Ensure user has admin role in database
2. Navigate to http://localhost:3001/login
3. Click "Continue with Google"
4. Authenticate with Google
5. ✅ Should redirect to dashboard
6. ✅ Should see admin console

### Test Scenario 2: Non-Admin User
1. User has `role: 'investor'` (not admin)
2. Navigate to http://localhost:3001/login
3. Click "Continue with Google"
4. Authenticate with Google
5. ✅ Should see "Access denied" toast
6. ✅ Should redirect to unauthorized page

### Test Scenario 3: New Google User
1. Email not in database
2. Click "Continue with Google"
3. ✅ Backend creates new user with `role: 'investor'`
4. ✅ Denied access (not admin)
5. Admin must manually promote user to admin

---

## Promoting Google User to Admin

If a user signs up via Google and needs admin access:

### Method 1: MongoDB Update
```javascript
db.users.updateOne(
  { email: "newadmin@gmail.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Via Admin Console (if you have access)
1. Login as existing admin
2. Go to Users tab
3. Find the user
4. Click Edit
5. Change role to "admin"
6. Save

---

## Login Options for Admins

Admins now have **2 login methods**:

### Option 1: Email & Password
- Traditional login
- Enter email and password
- Click "Sign In"

### Option 2: Google OAuth
- Click "Continue with Google"
- Authenticate with Google
- Automatic login (if admin role)

**Both methods work equally well!**

---

## Troubleshooting

### "Access Denied" Error

**Cause**: User logged in with Google but doesn't have admin role

**Solution**:
1. Check user role in database
2. Update to admin:
   ```javascript
   db.users.updateOne(
     { email: "user@gmail.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Try logging in again

### "OAuth Failed" Error

**Cause**: Google authentication failed or backend error

**Solutions**:
1. Check Google OAuth credentials in `.env`
2. Verify `GOOGLE_CALLBACK_URL` is correct
3. Check backend logs for errors
4. Ensure Google OAuth consent screen is configured

### Redirect to User Frontend (Port 3000)

**Cause**: State parameter not passed correctly

**Solutions**:
1. Clear browser cache
2. Check browser console for errors
3. Verify `NEXT_PUBLIC_API_URL` in admin frontend `.env`
4. Restart both frontend and backend

### Token Not Found

**Cause**: Callback URL not receiving token

**Solutions**:
1. Check backend logs for redirect URL
2. Verify Google OAuth callback is working
3. Check browser network tab for redirect
4. Ensure CORS allows admin frontend

---

## State Parameter Format

The state parameter sent to Google OAuth contains:

```javascript
{
  "isAdmin": true,
  "redirectUrl": "http://localhost:3001"
}
```

This tells the backend where to redirect after authentication.

---

## Environment Variables

### Backend (no changes needed):
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000  # User frontend (default fallback)
```

### Admin Frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Benefits

✅ **Faster Login** - No need to remember password  
✅ **More Secure** - Leverages Google's security  
✅ **Convenient** - One-click authentication  
✅ **Flexible** - Email/password still available  
✅ **Role-Based** - Automatically checks admin status

---

**Google OAuth is now fully functional for the admin console!** 🎉

