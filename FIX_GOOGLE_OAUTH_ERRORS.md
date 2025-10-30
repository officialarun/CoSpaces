# Google OAuth Errors Fixed

## ✅ Issue 1: Duplicate Phone Index - FIXED

**Error**: `E11000 duplicate key error collection: fractional-land-spv.users index: phone_1 dup key: { phone: null }`

**Root Cause**: The `phone` field had a unique index that didn't allow multiple null values. When multiple users signed up via Google OAuth without providing phone numbers, MongoDB rejected the duplicate nulls.

**Solution Applied**:
1. ✅ Updated User model to use sparse index: `userSchema.index({ phone: 1 }, { sparse: true })`
2. ✅ Ran migration script to drop old index and create new sparse index
3. ✅ Now allows unlimited Google OAuth users without phone numbers

**Result**: Multiple Google users can now sign up without phone numbers! 🎉

---

## 🔧 Issue 2: Google OAuth "Bad Request"

**Error**: `TokenError: Bad Request`

**Possible Causes**:
1. **Authorization code reused** - OAuth codes are single-use only
2. **Redirect URI mismatch** - Must match exactly what's in Google Console
3. **Expired session** - Code expired (10 minutes max)

### Quick Fixes:

#### Option 1: Clear Browser and Try Fresh Login (Recommended)
```bash
# 1. Clear browser cache and cookies for localhost:3000
# 2. Go to http://localhost:3000/login
# 3. Click "Sign in with Google" (fresh flow)
# 4. Should work now!
```

#### Option 2: Verify Google Console Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Verify **Authorized redirect URIs** includes:
   ```
   http://localhost:5000/api/v1/auth/google/callback
   ```
4. Save if you made changes
5. Wait 5 minutes for propagation
6. Try login again

#### Option 3: Check Environment Variables

Verify your `.env` file has correct values:
```env
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret-here
```

---

## 🧪 Test Multiple Google Accounts

Now you can test with multiple Google accounts:

### Account 1:
```
Email: user1@gmail.com
Phone: (not required - can be null)
```

### Account 2:
```
Email: user2@gmail.com  
Phone: (not required - can be null)
```

### Account 3 (with phone):
```
Email: user3@gmail.com
Phone: +91 98765 43210
```

All three can coexist! ✅

---

## 🚀 Next Steps

1. **Restart Backend** (Ctrl+C, then):
   ```bash
   cd packages/backend
   npm run dev
   ```

2. **Clear Browser Cache**:
   - Open DevTools (F12)
   - Right-click Refresh button
   - Click "Empty Cache and Hard Reload"

3. **Try Google Login Again**:
   - Go to `http://localhost:3000/login`
   - Click "Sign in with Google"
   - Select your Google account
   - Should work now! 🎉

---

## 🐛 Debugging

### Check Backend Logs

Look for:
```
✅ GOOD:
[INFO] Google OAuth callback received for email: user@gmail.com
[INFO] Created new Google user: user@gmail.com
[INFO] User redirected to: /auth/callback?token=...

❌ BAD:
[ERROR] E11000 duplicate key error (phone: null)
[ERROR] TokenError: Bad Request
```

### Check Frontend Console

After redirect from Google, look for:
```javascript
✅ GOOD:
Token received: eyJhbGc...
User logged in: {email: "user@gmail.com", ...}
Redirecting to: /onboarding/step1

❌ BAD:
No token received
Error: Unauthorized
```

---

## 📝 Summary

| Issue | Status | Action Required |
|-------|--------|-----------------|
| Phone index duplicate key | ✅ Fixed | None - migration ran |
| Google OAuth "Bad Request" | ⚠️ User Action | Clear cache + fresh login |
| Multiple Google users | ✅ Supported | None |

---

## ✨ You're All Set!

The phone index issue is **completely fixed**. For the OAuth error, just clear your browser cache and try a fresh Google login - don't reuse the same authorization code from the error.

**Try logging in now!** 🚀

