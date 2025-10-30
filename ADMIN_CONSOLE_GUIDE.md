# Admin Console Guide

Complete guide for the Fractional Land SPV Platform Admin Console.

---

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [User Management](#user-management)
5. [Project Management](#project-management)
6. [KYC Management](#kyc-management)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Admin Console is a separate web application that runs on **port 3001** and provides comprehensive administrative controls for the Fractional Land SPV Platform.

### Key Features
- **User Management**: View, edit, and deactivate users
- **Project Management**: Publish, unpublish, and delete projects
- **KYC Management**: Review and approve/reject user KYC submissions
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Role-based Access**: Only users with `admin` role can access

---

## Getting Started

### Prerequisites
- Backend server running on port 5000
- Node.js and npm installed
- MongoDB database configured

### Installation

1. **Navigate to admin frontend directory:**
```bash
cd packages/admin-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NODE_ENV=development
```

4. **Start the admin console:**
```bash
npm run dev
```

The admin console will be available at **http://localhost:3001**

---

## Creating Admin Users

### Method 1: Manual MongoDB Update
```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Create Seed Script
Create `packages/backend/scripts/seed-admin.js`:
```javascript
const User = require('../src/models/User.model');
require('dotenv').config();
const mongoose = require('mongoose');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const admin = await User.create({
    email: 'admin@fractionalland.com',
    password: 'Admin@12345', // Will be hashed
    phone: '+919876543210',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    kycStatus: 'approved',
    isEmailVerified: true,
    onboardingCompleted: true
  });
  
  console.log('Admin created:', admin.email);
  process.exit(0);
}

createAdmin();
```

Run: `node packages/backend/scripts/seed-admin.js`

---

## Features

### Authentication
- **Shared Authentication**: Uses same backend auth endpoint as user frontend
- **Role Verification**: Only users with `role: 'admin'` can log in
- **JWT Tokens**: Stored in localStorage, included in all API requests
- **Auto-logout**: On 401 errors or logout action

### Auto-refresh
- Dashboard automatically refreshes data every 30 seconds
- Last updated timestamp displayed
- Manual refresh buttons available on each tab

---

## User Management

### Viewing Users

**URL**: Dashboard → Users Tab

**Features**:
- Paginated user list (20 per page)
- Search by name or email
- Filter by KYC status
- View onboarding progress
- See DIDIT verification status

**Columns**:
- Name
- Email
- Phone
- Role
- KYC Status (Pending/Approved/Rejected)
- Onboarding Status (Complete/Step 1/Step 2/Not Started)
- Account Status (Active/Inactive)
- Actions

### Editing Users

**How to**:
1. Click the edit icon (pencil) next to a user
2. Modal opens with editable fields:
   - First Name
   - Last Name
   - Email
   - Phone
   - Role
3. Onboarding details displayed (read-only):
   - Onboarding progress
   - Phone verified status
   - DIDIT KYC status
4. Click "Save Changes"

**What can be edited**:
- ✅ Name (First + Last)
- ✅ Email
- ✅ Phone
- ✅ Role

**What cannot be edited**:
- ❌ Onboarding status (system-managed)
- ❌ KYC status (use KYC tab)
- ❌ DIDIT verification (system-managed)

### Deactivating Users

**How to**:
1. Click the ban icon (🚫) next to a user
2. Confirm the action
3. User's `isActive` field set to `false`
4. User can no longer log in

**Note**: You cannot deactivate your own account.

---

## Project Management

### Viewing Projects

**URL**: Dashboard → Projects Tab

**Features**:
- Paginated project list (20 per page)
- Search by project name or code
- Filter by status (Draft/Listed/Fundraising/etc.)
- Filter by published status
- View land value and location

**Columns**:
- Project Name
- Code
- Location (City, State)
- Status (Draft/Listed/Fundraising/etc.)
- Published (Published/Unpublished)
- Land Value
- Actions

### Publishing Projects

**How to**:
1. Click the eye icon (👁️) next to an unpublished project
2. Confirm the action
3. Project's `isPublic` field set to `true`
4. If status is `draft` or `approved`, automatically changes to `listed`
5. Project now visible on user frontend at `/projects`

**Requirements**:
- Only admin can publish projects
- Once published, project appears to all users
- Published projects can be invested in

### Unpublishing Projects

**How to**:
1. Click the eye-slash icon (👁️/) next to a published project
2. Confirm the action
3. Project's `isPublic` field set to `false`
4. Project hidden from user frontend
5. Existing subscriptions not affected

### Deleting Projects

**How to**:
1. Click the trash icon (🗑️) next to a project
2. Confirm the deletion (cannot be undone)
3. Project permanently deleted from database

**Warning**: This action cannot be undone. Consider unpublishing instead if project might be needed later.

---

## KYC Management

### Viewing KYC Submissions

**URL**: Dashboard → KYC Management Tab

**Features**:
- Filter by status (Pending/Submitted/Approved/Rejected)
- View submission dates
- See DIDIT verification status
- Pending KYC count badge on tab

**Columns**:
- Name
- Email
- Phone
- Submission Date
- KYC Status
- DIDIT Status
- Actions

### Reviewing KYC

**How to**:
1. Click "Review" next to a user
2. Modal opens with complete user information:
   - Basic information (Name, Email, Phone, DOB)
   - DIDIT verification details (if completed)
   - Professional details
   - Address
   - Investment preferences
3. Review all information carefully

### Approving KYC

**How to**:
1. In KYC Review Modal, click "Approve KYC" button
2. Confirm the action
3. User's `kycStatus` set to `'approved'`
4. User sees updated status in their dashboard immediately

**What happens**:
- ✅ User's KYC status badge turns green
- ✅ User can proceed with investments
- ✅ Status reflected across platform
- ✅ Audit log entry created

### Rejecting KYC

**How to**:
1. In KYC Review Modal, click "Reject" button
2. Rejection reason form appears
3. Enter detailed rejection reason (required)
4. Click "Confirm Rejection"
5. User's `kycStatus` set to `'rejected'`
6. Rejection reason stored in `kycRejectionReason` field

**What happens**:
- ❌ User's KYC status badge turns red
- ❌ User notified of rejection (if email configured)
- ❌ User can re-submit KYC with corrections
- ❌ Audit log entry created with reason

---

## Dashboard Statistics

The dashboard displays real-time statistics:

### Users
- Total users
- Active users
- Inactive users

### KYC
- Pending submissions
- Approved users
- Total users with KYC

### Projects
- Total projects
- Published projects
- Draft projects
- Fundraising projects

Statistics auto-refresh every 30 seconds.

---

## Security

### Access Control
- Only users with `role: 'admin'` can access admin console
- Non-admin users redirected to unauthorized page
- JWT tokens expire after configured duration
- Auto-logout on token expiration

### Audit Logging
All admin actions are logged:
- User updates
- User deactivations
- Project publications/unpublications
- Project deletions
- KYC approvals/rejections

View audit logs via backend API: `GET /api/v1/admin/activity`

---

## Troubleshooting

### Cannot Log In

**Issue**: "Access denied. Admin privileges required."

**Solution**:
1. Check if your user has `role: 'admin'`
2. Verify in MongoDB: `db.users.findOne({ email: "your@email.com" })`
3. If role is not admin, update it manually
4. Clear browser cache and retry

### Dashboard Not Loading

**Issue**: Blank screen or loading spinner forever

**Solutions**:
1. Check if backend is running on port 5000
2. Check browser console for errors
3. Verify CORS settings in backend allow localhost:3001
4. Check `NEXT_PUBLIC_API_URL` in .env

### API Errors

**Issue**: "Failed to load users/projects/KYC"

**Solutions**:
1. Check backend logs for errors
2. Verify JWT token is being sent (check Network tab)
3. Verify admin routes are registered in server.js
4. Check MongoDB connection

### Changes Not Reflecting

**Issue**: Updates not visible after save

**Solutions**:
1. Check browser console for errors
2. Verify API response is successful
3. Wait for next auto-refresh (30 seconds)
4. Click manual refresh button
5. Hard refresh browser (Ctrl+F5)

### CORS Errors

**Issue**: "CORS policy blocked"

**Solution**:
Add admin frontend URL to backend CORS config:
```javascript
// server.js
const allowedOrigins = [
  'http://localhost:3000', // User frontend
  'http://localhost:3001'  // Admin frontend
];
```

---

## Best Practices

### User Management
- ✅ Always verify user information before making changes
- ✅ Use deactivation instead of deletion when possible
- ✅ Document reason when changing user roles
- ❌ Don't deactivate your own admin account

### Project Management
- ✅ Review project details before publishing
- ✅ Unpublish instead of delete when uncertain
- ✅ Keep draft projects for future use
- ❌ Don't delete projects with active subscriptions

### KYC Management
- ✅ Provide clear, detailed rejection reasons
- ✅ Verify DIDIT data matches manual entries
- ✅ Review all sections before approving
- ❌ Don't approve incomplete KYC submissions

---

## Keyboard Shortcuts

- `Ctrl + R` - Refresh current page
- `Esc` - Close modal
- `Tab` - Navigate between form fields
- `Enter` - Submit form/confirm action

---

## Support

For issues or questions:
1. Check this guide first
2. Review backend logs
3. Check browser console
4. Contact development team

---

**Admin Console Version**: 1.0.0  
**Last Updated**: October 2024  
**Backend API Version**: v1

