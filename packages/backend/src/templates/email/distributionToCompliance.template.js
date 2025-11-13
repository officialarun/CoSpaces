module.exports = (data) => {
  const { userName, projectName, distributionNumber, grossProceeds, netDistributableAmount, distributionType, assetManagerName, approvalUrl, dashboardUrl } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Distribution Compliance Review Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f7fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">CoSpaces</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="color: #f6ad55; font-size: 64px;">⚖️</div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; text-align: center;">Compliance Review Required</h2>
              
              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                A distribution for <strong>${projectName}</strong> has been approved by the Asset Manager and now requires your compliance review before it can proceed to final admin approval.
              </p>
              
              <!-- Distribution Details -->
              <div style="background: linear-gradient(135deg, #feebc8 0%, #fbd38d 100%); border: 2px solid #f6ad55; border-radius: 12px; padding: 30px; margin: 24px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; font-weight: bold;">Distribution Number:</td>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; text-align: right; font-weight: 600;">${distributionNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; font-weight: bold;">Project:</td>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; text-align: right; font-weight: 600;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; font-weight: bold;">Type:</td>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; text-align: right; text-transform: capitalize;">${distributionType.replace(/_/g, ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; font-weight: bold;">Gross Proceeds:</td>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; text-align: right; font-weight: 600;">₹${grossProceeds.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; font-weight: bold;">Net Distributable:</td>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; text-align: right; font-weight: 600;">₹${netDistributableAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; font-weight: bold;">Approved By:</td>
                    <td style="padding: 8px 0; color: #7c2d12; font-size: 14px; text-align: right;">${assetManagerName}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px; font-weight: bold;">Compliance Checklist:</p>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Verify TDS calculations and rates</li>
                  <li>Review deduction amounts (if any)</li>
                  <li>Ensure regulatory compliance</li>
                  <li>Check investor distribution breakdowns</li>
                  <li>Approve or request changes</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${approvalUrl}" style="display: inline-block; background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Review & Approve Distribution
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0 0; color: #718096; font-size: 13px; text-align: center; line-height: 1.6;">
                You can also access this distribution from your <a href="${dashboardUrl}" style="color: #f6ad55; text-decoration: none;">Compliance Dashboard</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px;">
                This is an automated notification from CoSpaces Platform
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 11px;">
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

