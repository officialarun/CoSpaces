module.exports = (data) => {
  const { userName, projectName, equityPercentage, investmentAmount, signingUrl, dashboardUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Sign Your Shareholder Agreement</title>
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
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="color: #667eea; font-size: 64px;">✍️</div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; text-align: center;">Sign Your Shareholder Agreement</h2>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your Shareholder Agreement for <strong>${projectName}</strong> is ready for your signature! 📄
              </p>
              
              <!-- Investment Summary -->
              <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Your Investment</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px;">Project:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px;">Investment Amount:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">₹${investmentAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px;">Equity Percentage:</td>
                    <td style="padding: 8px 0; color: #667eea; font-size: 16px; font-weight: bold; text-align: right;">${equityPercentage.toFixed(4)}%</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #fff5f7; border-left: 4px solid #f56565; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; color: #742a2a; font-size: 16px; font-weight: bold;">⚠️ Action Required</h3>
                <p style="margin: 0; color: #c53030; font-size: 15px; line-height: 1.6;">
                  Please review and e-sign your Shareholder Agreement within <strong>30 days</strong>.
                </p>
              </div>
              
              <div style="background: #edf2f7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px;">What's in the Agreement?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Your equity ownership details</li>
                  <li>Share allocation and certificate information</li>
                  <li>Rights and obligations as a shareholder</li>
                  <li>SPV governance structure</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${signingUrl || dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 18px 48px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                  View & Sign Agreement
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                The signing process is secure and takes just a few minutes.
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

