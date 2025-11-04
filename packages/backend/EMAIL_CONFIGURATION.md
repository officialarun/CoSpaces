# Email Notification Configuration

## ZeptoMail Environment Variables

Add the following environment variables to your `.env` file in `packages/backend/.env`:

```env
# ZeptoMail Configuration
ZEPTOMAIL_URL=https://api.zeptomail.in/v1.1/email
ZEPTOMAIL_TOKEN=Zoho-enczapikey PHtE6r0JS73r3zZ980MCtP+9E8DyPd96+e9neFIS445FXqAFF01d/Y0ix2Xm/xl/UKIUFfebwd4657mb4OuMdGu8ZGseWmqyqK3sx/VYSPOZsbq6x00ct1QcdkPaUo/qe9No0iPfvdvbNA==
ZEPTOMAIL_FROM_ADDRESS=noreply@devopsenthusiasts.solutions
ZEPTOMAIL_FROM_NAME=CoSpaces

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Configuration Details

- **ZEPTOMAIL_URL**: The ZeptoMail API endpoint (default: https://api.zeptomail.in/v1.1/email)
- **ZEPTOMAIL_TOKEN**: Your ZeptoMail API token (get this from Zoho Mail Agent settings)
- **ZEPTOMAIL_FROM_ADDRESS**: The verified sender email address
- **ZEPTOMAIL_FROM_NAME**: The display name for emails (default: CoSpaces)
- **FRONTEND_URL**: Your frontend application URL (for generating links in emails)

## Email Templates Available

1. **Welcome Email** - Sent after user signup
2. **KYC Submitted** - Confirmation when KYC is submitted
3. **KYC Approved** - Notification when KYC is approved
4. **KYC Rejected** - Notification when KYC is rejected with reason
5. **Subscription Created** - Confirmation when subscription is created
6. **Subscription Approved** - Notification when subscription is approved
7. **Payment Confirmed** - Confirmation when payment is received
8. **SHA Ready** - Notification when Shareholder Agreement is ready to sign
9. **SHA Signed** - Confirmation when agreement is signed
10. **Distribution Announced** - Notification when distribution is announced
11. **Distribution Paid** - Confirmation when distribution payment is completed
12. **Project Update** - General project updates for investors

## Testing Emails

After adding the environment variables:

1. Restart your backend server
2. Sign up a new user - you should receive a welcome email
3. Complete KYC - you should receive KYC status emails
4. Make a subscription - you should receive subscription emails

## Troubleshooting

If emails are not sending:

1. Check if ZEPTOMAIL_TOKEN is correctly set
2. Verify that ZEPTOMAIL_FROM_ADDRESS is verified in your Zoho Mail Agent
3. Check backend logs for email errors
4. Ensure the `zeptomail` npm package is installed (`npm list zeptomail`)

## Production Configuration

For production, update:
- `FRONTEND_URL` to your production frontend URL (e.g., https://yourapp.com)
- Ensure all email addresses are verified in Zoho Mail Agent
- Consider setting up email retry mechanisms
- Monitor email sending logs

