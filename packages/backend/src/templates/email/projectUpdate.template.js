module.exports = (data) => {
  const { userName, projectName, updateType, updateMessage, dashboardUrl } = data;
  
  const updateTitles = {
    status_change: 'Project Status Update',
    milestone: 'Project Milestone Achieved',
    document: 'New Document Available',
    general: 'Project Update'
  };
  
  const updateIcons = {
    status_change: '📢',
    milestone: '🎯',
    document: '📄',
    general: '📰'
  };
  
  const title = updateTitles[updateType] || updateTitles.general;
  const icon = updateIcons[updateType] || updateIcons.general;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>${title}</title>
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
                <div style="font-size: 64px;">${icon}</div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; text-align: center;">${title}</h2>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                There's an update regarding your investment in <strong>${projectName}</strong>.
              </p>
              
              <!-- Update Message -->
              <div style="background: #f7fafc; border-left: 4px solid #667eea; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 18px;">Update Details</h3>
                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.7;">
                  ${updateMessage}
                </p>
              </div>
              
              <p style="margin: 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                You can view more details and track the progress of your investment in your dashboard.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  View Project Details
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                Thank you for being part of this investment journey!
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
                Questions? Email us at <a href="mailto:support@plotacre.in" style="color: #667eea; text-decoration: none;">support@devopsenthusiasts.solutions</a>
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

