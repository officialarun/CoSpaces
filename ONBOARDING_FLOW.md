# Onboarding Flow Documentation

## Overview

The platform implements a mandatory 2-step onboarding process for all new users (both email signup and Google OAuth). Users cannot access the dashboard or any protected features until they complete the onboarding.

## Flow Diagram

```
┌─────────────────┐
│  Signup/Login   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│ Is Onboarding   │─No──▶│ Onboarding Step 1│
│   Complete?     │      │ (Personal Details)│
└────────┬────────┘      └────────┬──────────┘
         │                        │
        Yes                       ▼
         │               ┌──────────────────┐
         │               │ Onboarding Step 2│
         │               │  (Preferences)   │
         │               └────────┬──────────┘
         │                        │
         └────────┬───────────────┘
                  ▼
         ┌────────────────┐
         │   Dashboard    │
         └────────────────┘
```

## User Journey

### 1. **New User Signup/Login**
- **Email Signup**: User creates account with email/password
- **Google OAuth**: User signs up/logs in with Google account

### 2. **Onboarding Step 1: Personal & Professional Details**
**Route**: `/onboarding/step1`

**Fields Collected**:
- **Personal Information**:
  - Date of Birth
  - Full Address (Street, City, State, Pincode, Country)

- **Professional Details**:
  - Occupation (Salaried, Self-employed, Business Owner, Professional, Retired, Student, Other)
  - Company/Organization (conditional)
  - Designation (conditional)
  - Years of Experience (conditional)
  - Education Level (High School, Undergraduate, Postgraduate, Doctorate, Other)
  - Annual Income Range (Below ₹5L, ₹5-10L, ₹10-25L, ₹25-50L, ₹50L-1Cr, Above ₹1Cr)

**Progress**: 50% Complete

**Next**: Automatically proceeds to Step 2 on successful submission

### 3. **Onboarding Step 2: Investment Preferences**
**Route**: `/onboarding/step2`

**Fields Collected**:
- **Land Type Preferences** (Multi-select):
  - 🌾 Agricultural
  - 🏘️ Residential
  - 🏢 Commercial
  - 🏭 Industrial
  - 🏗️ Mixed Use

- **Preferred Locations** (Dynamic list):
  - City, State, Pincode
  - Users can add multiple locations

- **Investment Goals**:
  - Capital Appreciation
  - Regular Income (Rental/Lease)
  - Portfolio Diversification
  - Tax Benefits
  - Other

- **Risk Appetite**:
  - Conservative (Low risk, stable returns)
  - Moderate (Balanced risk & returns)
  - Aggressive (Higher risk, higher returns)

- **Investment Horizon**:
  - Short Term (< 3 years)
  - Medium Term (3-5 years)
  - Long Term (> 5 years)

- **Investment Amount Range**:
  - Minimum Investment Amount (₹)
  - Maximum Investment Amount (₹)

**Progress**: 100% Complete

**Next**: Redirects to Dashboard on successful completion

## Technical Implementation

### Backend

#### User Model Updates
Added fields to `User.model.js`:
```javascript
{
  onboardingCompleted: Boolean,
  onboardingStep: Number, // 0 = not started, 1 = step 1 completed, 2 = all completed
  professionalDetails: {
    occupation: String,
    company: String,
    designation: String,
    yearsOfExperience: Number,
    education: String,
    annualIncome: String
  },
  investmentPreferences: {
    landTypes: [String],
    preferredLocations: [{ city, state, pincode }],
    investmentGoal: String,
    riskAppetite: String,
    investmentHorizon: String,
    minimumInvestmentAmount: Number,
    maximumInvestmentAmount: Number
  }
}
```

#### API Endpoints
- `PUT /api/v1/users/onboarding/step1` - Save Step 1 data
- `PUT /api/v1/users/onboarding/step2` - Save Step 2 data & mark onboarding complete

### Frontend

#### Protected Routes
The `ProtectedRoute` component automatically checks onboarding status:
- If `onboardingStep === 0`: Redirects to `/onboarding/step1`
- If `onboardingStep === 1`: Redirects to `/onboarding/step2`
- If `onboardingCompleted === true`: Allows access to all routes

#### Auth Flow Integration
1. **Email Login** (`/login`): Checks user.onboardingCompleted after login
2. **Email Signup** (`/signup`): Redirects to `/onboarding/step1`
3. **Google OAuth** (`/auth/callback`): Fetches user data and redirects based on onboarding status

## Design Features

### User Experience
- **Progress Indicator**: Visual progress bar showing completion percentage
- **Step Navigation**: Back button on Step 2 to return to Step 1
- **Smart Forms**: Conditional fields based on user selections
- **Centered Layout**: Clean, focused design with minimal distractions
- **Validation**: Real-time validation with helpful error messages

### Visual Elements
- **Gradient Background**: Modern blue-to-indigo gradient
- **Card Layout**: White cards with rounded corners and shadows
- **Icons**: Emoji icons for land types for better visual appeal
- **Color Coding**: 
  - Primary: Indigo (#4F46E5)
  - Success: Green
  - Error: Red
  - Warning: Yellow/Orange

## Business Logic

### Why This Data is Collected

1. **Personal Details**: Required for KYC compliance and legal documentation
2. **Professional Details**: Helps assess investor eligibility and risk profile
3. **Income Information**: Critical for compliance with private placement rules
4. **Investment Preferences**: 
   - Enables personalized project recommendations
   - Helps match investors with suitable opportunities
   - Aids in risk assessment and suitability checks
5. **Risk Appetite**: Ensures investors are shown appropriate opportunities
6. **Investment Range**: Filters projects within user's budget

### Compliance Considerations

- **Accredited Investor Status**: Income and professional data helps determine accreditation
- **Private Placement Limits**: Income verification ensures compliance with regulatory caps
- **Suitability Requirements**: Risk appetite and investment horizon ensure suitable placements
- **KYC/AML**: Address and professional details support KYC verification

## Future Enhancements

1. **Skip & Complete Later**: Option for users to skip onboarding (with limited access)
2. **Edit Preferences**: Settings page to update investment preferences
3. **Recommendation Engine**: Use preferences to auto-suggest projects
4. **Progress Persistence**: Save partial progress in Step 1 and Step 2
5. **Enhanced Validation**: 
   - Pincode verification with state/city
   - Company email verification for professionals
   - Document upload for income proof
6. **Onboarding Analytics**: Track drop-off rates and optimize flow

## Testing Checklist

- [ ] Email signup → redirects to Step 1
- [ ] Google OAuth signup → redirects to Step 1
- [ ] Complete Step 1 → redirects to Step 2
- [ ] Complete Step 2 → redirects to Dashboard
- [ ] Login with incomplete onboarding → resumes at correct step
- [ ] Login with complete onboarding → goes to Dashboard
- [ ] Back button on Step 2 → returns to Step 1
- [ ] Form validation on all required fields
- [ ] Mobile responsiveness
- [ ] Error handling for API failures

## Support & Questions

For technical questions about the onboarding flow, contact the development team.
For business logic questions, contact the compliance team.

