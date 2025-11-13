module.exports = (data) => {
  const { userName, projectName, distributionAmount, utr, paymentDate, dashboardUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Distribution Payment Completed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f7fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">CoSpaces</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="color: #48bb78; font-size: 64px;">💸</div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; text-align: center;">Distribution Payment Completed!</h2>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your distribution payment for <strong>${projectName}</strong> has been successfully transferred to your bank account! 🎉
              </p>
              
              <!-- Payment Amount -->
              <div style="background: #f0fff4; border: 2px solid #48bb78; border-radius: 12px; padding: 30px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #22543d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Payment Credited</p>
                <h3 style="margin: 0; color: #22543d; font-size: 42px; font-weight: bold;">₹${distributionAmount.toLocaleString('en-IN')}</h3>
              </div>
              
              <!-- Payment Details -->
              <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Payment Details</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px;">Project:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #22543d; font-size: 14px; font-weight: bold; text-align: right;">₹${distributionAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px;">UTR Number:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">${utr || 'Processing'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #718096; font-size: 14px;">Payment Date:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: bold; text-align: right;">${paymentDate}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #edf2f7; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px;">📄 Tax Documents</h3>
                <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                  Your TDS certificate (Form 16) will be available for download from your dashboard shortly.
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  View Transaction History
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #718096; font-size: 13px; line-height: 1.6; text-align: center;">
                <em>Please check your bank account. It may take 1-2 business days for the amount to reflect.</em>
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
                Questions? Email us at <a href="mailto:support@plotacre.in" style="color: #48bb78; text-decoration: none;">support@devopsenthusiasts.solutions</a>
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

