module.exports = (data) => {
  const { userName, userEmail, dashboardUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CoSpaces</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f7fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">CoSpaces</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Invest in Global Alternative Assets</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px;">Welcome, ${userName}! 🎉</h2>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for joining <strong>CoSpaces</strong> – the platform for fractional land investments through Special Purpose Vehicles (SPVs).
              </p>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                You've taken the first step towards diversifying your portfolio with curated real estate opportunities.
              </p>
              
              <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 18px;">Next Steps:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                  <li>Complete your KYC verification</li>
                  <li>Browse investment opportunities</li>
                  <li>Start investing with low minimums</li>
                </ul>
              </div>
              
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                <strong>Important:</strong> You'll need to complete KYC verification before you can invest. This typically takes 24-48 hours.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f7fafc; padding: 30px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #718096; font-size: 14px;">
                <strong>CoSpaces</strong> – Democratizing Land Investments
              </p>
              <p style="margin: 0 0 16px 0; color: #a0aec0; font-size: 12px;">
                Questions? Email us at <a href="mailto:support@devopsenthusiasts.solutions" style="color: #667eea; text-decoration: none;">support@devopsenthusiasts.solutions</a>
              </p>
              <p style="margin: 0; color: #cbd5e0; font-size: 11px;">
                © ${new Date().getFullYear()} CoSpaces. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

