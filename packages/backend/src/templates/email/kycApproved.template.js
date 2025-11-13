module.exports = (data) => {
  const { userName, dashboardUrl, projectsUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Approved</title>
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
                <div style="color: #48bb78; font-size: 64px;">✅</div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; text-align: center;">KYC Approved!</h2>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Great news! Your KYC verification has been <strong>approved</strong>. 🎉
              </p>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                You now have full access to invest in our curated real estate opportunities through Special Purpose Vehicles (SPVs).
              </p>
              
              <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; color: #22543d; font-size: 18px;">What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #2f855a; font-size: 15px; line-height: 1.8;">
                  <li>Browse available investment projects</li>
                  <li>Review project details and documentation</li>
                  <li>Start investing with low minimums</li>
                  <li>Track your portfolio performance</li>
                </ul>
              </div>
              
              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${projectsUrl}" style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 0 8px;">
                  Browse Projects
                </a>
                <a href="${dashboardUrl}" style="display: inline-block; background: #edf2f7; color: #2d3748; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 0 8px;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                Happy investing! 🚀
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

