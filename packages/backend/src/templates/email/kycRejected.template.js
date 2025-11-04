module.exports = (data) => {
  const { userName, reason, dashboardUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Verification Issue</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f7fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f56565 0%, #c53030 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">CoSpaces</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px;">KYC Verification Issue</h2>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We were unable to approve your KYC verification at this time.
              </p>
              
              <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; color: #742a2a; font-size: 16px; font-weight: bold;">Reason:</h3>
                <p style="margin: 0; color: #c53030; font-size: 15px; line-height: 1.6;">
                  ${reason || 'The submitted documents do not meet our verification requirements.'}
                </p>
              </div>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Please review the reason above and resubmit your KYC documents with the correct information.
              </p>
              
              <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px;">Common Issues:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #718096; font-size: 14px; line-height: 1.8;">
                  <li>Blurry or unclear document images</li>
                  <li>Expired identification documents</li>
                  <li>Mismatched information</li>
                  <li>Incomplete documentation</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  Resubmit KYC
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you have questions or need assistance, please contact our support team.
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

