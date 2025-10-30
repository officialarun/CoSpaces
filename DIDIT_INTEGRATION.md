# DIDIT Integration Guide

## Overview

This platform integrates DIDIT for Aadhaar-based KYC verification, providing secure identity verification for users during onboarding and from the dashboard.

## What is DIDIT?

DIDIT is a decentralized identity verification platform that enables secure Aadhaar-based KYC verification in India. It provides:
- Aadhaar eKYC verification
- Age verification
- Address/location verification
- Secure data handling compliant with Indian regulations

## Getting DIDIT API Credentials

### Step 1: Sign Up for DIDIT

1. **Visit DIDIT Website**:
   - Production: https://didit.me
   - Documentation: https://docs.didit.me
   - Developer Portal: https://developer.didit.me (if available)

2. **Create Developer Account**:
   - Sign up with business email
   - Complete company/entity verification
   - Provide business documents (GST, PAN, incorporation certificate)

3. **Request API Access**:
   - Fill out API access request form
   - Specify use case: "Fractional Land SPV Platform - Investor KYC"
   - Wait for approval (typically 2-5 business days)

### Step 2: Get API Credentials

Once approved, you'll receive:

1. **API Key / Client ID**: Unique identifier for your application
2. **API Secret / Client Secret**: Secret key for authentication
3. **Webhook Secret**: Secret for validating webhook signatures
4. **Environment URLs**:
   - Sandbox: For testing
   - Production: For live transactions

### Step 3: Configure Redirect URLs

In DIDIT developer portal, configure allowed redirect URLs:

**Development**:
- `http://localhost:3001/api/v1/didit/callback`
- `http://localhost:3000/didit/callback`

**Production**:
- `https://yourdomain.com/api/v1/didit/callback`
- `https://yourdomain.com/didit/callback`

### Step 4: Test in Sandbox

Before going live:
1. Use sandbox credentials
2. Test with dummy Aadhaar numbers (provided by DIDIT)
3. Verify webhook delivery
4. Test error scenarios

## Environment Configuration

### Backend Configuration

Create/update `packages/backend/.env`:

```env
# DIDIT Configuration
DIDIT_API_KEY=your_didit_api_key_here
DIDIT_API_SECRET=your_didit_api_secret_here
DIDIT_WEBHOOK_SECRET=your_webhook_secret_here
DIDIT_ENVIRONMENT=sandbox
DIDIT_BASE_URL=https://sandbox-api.didit.me
DIDIT_REDIRECT_URL=http://localhost:3001/api/v1/didit/callback

# Production (comment out for development)
# DIDIT_ENVIRONMENT=production
# DIDIT_BASE_URL=https://api.didit.me
# DIDIT_REDIRECT_URL=https://yourdomain.com/api/v1/didit/callback
```

### Frontend Configuration

Create/update `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_DIDIT_ENABLED=true
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## User Flow

### During Onboarding (Step 1)

1. User lands on onboarding Step 1
2. DIDIT verification card is displayed with two options:
   - **"Verify with Aadhaar"** (Recommended)
   - **"Skip and fill manually"**

3. **If user clicks "Verify with Aadhaar"**:
   - Popup/redirect to DIDIT verification page
   - User enters Aadhaar number
   - DIDIT sends OTP to Aadhaar-linked mobile
   - User enters OTP
   - DIDIT verifies and returns data
   - Form auto-fills with verified data
   - User proceeds to Step 2

4. **If user clicks "Skip"**:
   - Regular manual form is shown
   - User fills all fields manually
   - User can verify later from dashboard

### From Dashboard (If Skipped)

1. Dashboard shows "Not Verified" badge
2. User clicks "Verify Now with DIDIT"
3. Redirected to verification page
4. Same DIDIT flow as above
5. Success → Dashboard updated with verified badge
6. Verified data updates user profile

## Verified Data

DIDIT provides the following verified information:

- **Name**: Full name as per Aadhaar
- **Date of Birth**: DOB from Aadhaar
- **Age**: Calculated age
- **Address**: Complete address from Aadhaar
  - Street/House number
  - City/Town
  - State
  - Pincode
  - Country (India)
- **Gender**: Gender from Aadhaar
- **Aadhaar Number**: Last 4 digits only (encrypted)

## Security & Privacy

### Data Storage
- **Aadhaar Number**: Only last 4 digits stored, encrypted
- **Verified Data**: Stored encrypted in database
- **Full Aadhaar**: Never stored on our servers
- **DIDIT Proof Token**: Stored for audit purposes

### Compliance
- **UIDAI Guidelines**: Compliant with Aadhaar storage rules
- **Data Protection**: All PII encrypted at rest
- **Audit Trail**: All verification attempts logged
- **User Consent**: Explicit consent before verification

## API Endpoints

### Initiate Verification
```
POST /api/v1/didit/initiate
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "verificationUrl": "https://didit.me/verify?session=xxx",
    "sessionId": "session_xxx"
  }
}
```

### Check Verification Status
```
GET /api/v1/didit/status
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "isVerified": true,
    "verifiedAt": "2025-10-29T10:30:00Z",
    "verifiedData": {
      "name": "John Doe",
      "dob": "1990-01-01",
      "age": 35,
      "address": {...}
    }
  }
}
```

### Webhook (DIDIT to Platform)
```
POST /api/v1/didit/webhook
X-DIDIT-Signature: <signature>

Payload:
{
  "event": "verification.completed",
  "userId": "user_xxx",
  "sessionId": "session_xxx",
  "verifiedData": {...}
}
```

## Testing Guide

### Sandbox Mode

1. Set `DIDIT_ENVIRONMENT=sandbox` in .env
2. Use DIDIT-provided test Aadhaar numbers:
   - `999999990019` (Test Aadhaar - Success)
   - `999999990027` (Test Aadhaar - Failure)

3. Test OTP: Usually `123456` in sandbox

### Test Scenarios

1. **Successful Verification**:
   - Use test Aadhaar
   - Complete OTP verification
   - Verify data auto-fills correctly
   - Check database for stored data

2. **Failed Verification**:
   - Use invalid Aadhaar
   - Verify error handling
   - Check user can retry or skip

3. **Skip Functionality**:
   - Click "Skip" button
   - Fill form manually
   - Verify later from dashboard

4. **Dashboard Verification**:
   - Login as unverified user
   - Navigate to verification page
   - Complete verification
   - Verify dashboard updates

## Troubleshooting

### Common Issues

**Issue**: "Invalid API credentials"
- **Solution**: Check DIDIT_API_KEY and DIDIT_API_SECRET in .env
- Verify credentials in DIDIT developer portal

**Issue**: "Redirect URL mismatch"
- **Solution**: Ensure DIDIT_REDIRECT_URL matches configured URL in DIDIT portal
- Check for http vs https, trailing slashes

**Issue**: "Webhook not received"
- **Solution**: 
  - Verify DIDIT_WEBHOOK_SECRET is correct
  - Check webhook URL is publicly accessible (use ngrok for local testing)
  - Review DIDIT webhook logs in developer portal

**Issue**: "Aadhaar data not auto-filling"
- **Solution**:
  - Check user.diditVerification.isVerified is true
  - Verify verifiedData is populated in database
  - Check console for JavaScript errors

**Issue**: "Verification timeout"
- **Solution**:
  - DIDIT verification sessions expire after 15 minutes
  - User needs to restart verification process

## Production Checklist

Before going live:

- [ ] Obtain production API credentials from DIDIT
- [ ] Update .env with production credentials
- [ ] Configure production redirect URLs in DIDIT portal
- [ ] Set up webhook endpoint (must be HTTPS with valid SSL)
- [ ] Test complete flow in production environment
- [ ] Enable audit logging
- [ ] Set up monitoring for failed verifications
- [ ] Review data encryption implementation
- [ ] Ensure compliance with UIDAI guidelines
- [ ] Add terms & conditions for Aadhaar usage
- [ ] Get user consent before verification

## Support

### DIDIT Support
- Email: support@didit.me
- Documentation: https://docs.didit.me
- Status Page: https://status.didit.me

### Platform Support
- For integration issues, contact development team
- For compliance questions, contact legal/compliance team

## References

- [DIDIT Documentation](https://docs.didit.me)
- [UIDAI Aadhaar Guidelines](https://uidai.gov.in)
- [UIDAI Authentication Guidelines](https://uidai.gov.in/ecosystem/authentication-devices-documents/aadhaar-authentication-api-documents.html)
- [India Data Protection Laws](https://www.meity.gov.in/data-protection-framework)

---

**Last Updated**: October 29, 2025  
**Version**: 1.0

