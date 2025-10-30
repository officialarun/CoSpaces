# Google OAuth Setup Guide

## ✅ What Was Added

Google Sign-In/Sign-Up has been successfully integrated into your Fractional Land SPV Platform!

### Backend Changes
- ✅ Installed `passport`, `passport-google-oauth20`, `express-session`
- ✅ Updated User model to support OAuth (googleId, authProvider, avatar)
- ✅ Created Passport Google OAuth configuration
- ✅ Added session middleware to server
- ✅ Added Google OAuth routes (`/api/v1/auth/google` and callback)
- ✅ Added Google OAuth callback controller

### Frontend Changes
- ✅ Created GoogleLoginButton component
- ✅ Updated Login page with "Continue with Google" button
- ✅ Updated Signup page with "Continue with Google" button
- ✅ Created OAuth callback handler page

## 🔧 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd packages/backend
npm install passport passport-google-oauth20 express-session
```

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure consent screen:
     - User Type: External
     - App name: Fractional Land SPV Platform
     - User support email: your email
     - Developer contact: your email
     - Save and Continue

5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Fractional Land OAuth
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/v1/auth/google/callback`
     - For production: `https://yourdomain.com/api/v1/auth/google/callback`
   - Click "Create"
   - Copy **Client ID** and **Client Secret**

### 3. Update Environment Variables

Add to `packages/backend/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Session Secret (generate random string)
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
```

**Generate Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Restart Application

```bash
# Stop current process (Ctrl+C)
npm run dev
```

## 🎯 How It Works

### User Flow

1. **New User (Google Sign-Up)**
   - User clicks "Continue with Google"
   - Redirected to Google consent screen
   - After approval, account is created automatically
   - Email is verified (Google emails are trusted)
   - User redirected to dashboard
   - **Phone number required during KYC**

2. **Existing User (Google Login)**
   - User clicks "Continue with Google"
   - System checks if Google account already linked
   - If yes, logs in immediately
   - If email exists but not linked, links Google account to existing account
   - Redirected to dashboard

3. **Email/Password User Linking Google**
   - User signs up with email/password
   - Later clicks "Continue with Google" with same email
   - Google account automatically linked to existing account
   - Can now login with either method

## 🔐 Security Features

- ✅ Google accounts are automatically verified (no email verification needed)
- ✅ OAuth tokens stored in secure session
- ✅ JWT tokens generated for API access
- ✅ Audit logs for all Google OAuth logins
- ✅ Password not required for OAuth users
- ✅ Can link existing email/password account

## 📱 Testing

### Test Sign Up
1. Go to http://localhost:3000/signup
2. Click "Continue with Google"
3. Sign in with your Google account
4. You'll be redirected to dashboard
5. Check MongoDB:
```bash
mongosh
use fractional-land-spv
db.users.findOne({ authProvider: 'google' })
```

### Test Login
1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Sign in with same Google account
4. Should login immediately

### Test Account Linking
1. Sign up with email/password first
2. Logout
3. Click "Continue with Google" with same email
4. Google account will be linked
5. Can now login with both methods

## 🐛 Troubleshooting

### "Redirect URI mismatch" Error

**Solution**: Make sure your redirect URI in Google Console exactly matches:
```
http://localhost:5000/api/v1/auth/google/callback
```

### "Invalid Client" Error

**Solution**: 
- Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Make sure there are no extra spaces
- Restart the server

### "Error 400: redirect_uri_mismatch"

**Solution**: 
1. Go to Google Cloud Console
2. Edit OAuth client
3. Add exact redirect URI
4. Wait 5 minutes for changes to propagate

### Google Consent Screen Shows "Unverified App"

**Solution**: 
- For development, click "Advanced" → "Go to app (unsafe)"
- For production, submit app for verification

### User Created But Phone is Empty

**Solution**: 
- This is expected for Google OAuth users
- Phone will be collected during KYC onboarding
- Users must complete KYC before investing

## 📊 Database Changes

### New User Fields

```javascript
{
  googleId: "109876543210987654321",
  authProvider: "google", // or "local"
  avatar: "https://lh3.googleusercontent.com/...",
  isEmailVerified: true, // Auto-verified for Google
  password: undefined // Not required for OAuth users
}
```

## 🚀 Production Deployment

### Update Environment Variables

```env
# Production
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=production-secret-from-vault
NODE_ENV=production
```

### Update Google Console

1. Add production domain to authorized origins
2. Add production callback URL to authorized redirects
3. Verify app for public use

### SSL Required

Google OAuth **requires HTTPS** in production. Make sure you have:
- Valid SSL certificate
- HTTPS enabled
- Redirect HTTP to HTTPS

## 📝 Additional Features

### Get User's Google Profile Picture

The user's Google profile picture is automatically saved in the `avatar` field:

```javascript
// In your frontend
<img src={user.avatar} alt={user.displayName} />
```

### Logout

Regular logout works the same:
```javascript
// Frontend
const { logout } = useAuth();
logout(); // Clears JWT tokens
```

## ⚠️ Important Notes

1. **Phone Number Required**: Google OAuth users must provide phone during KYC
2. **Email Verified**: Google emails are automatically marked as verified
3. **Password Optional**: Users can login with Google, no password needed
4. **Account Linking**: Same email automatically links accounts
5. **Audit Logged**: All Google logins are logged in audit trail

## ✅ Checklist

- [ ] Installed dependencies (`passport`, `passport-google-oauth20`, `express-session`)
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth credentials
- [ ] Added redirect URIs
- [ ] Updated `.env` with Client ID and Secret
- [ ] Generated session secret
- [ ] Restarted application
- [ ] Tested signup with Google
- [ ] Tested login with Google
- [ ] Verified user in MongoDB

## 🎉 Success!

If you can see the "Continue with Google" button and successfully login, you're all set!

Users can now:
- ✅ Sign up with Google
- ✅ Login with Google
- ✅ Link Google to existing account
- ✅ Skip email verification
- ✅ Get their Google profile picture

---

**Need help? Check the troubleshooting section or reach out!**

