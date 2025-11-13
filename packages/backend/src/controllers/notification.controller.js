const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// Import email templates
const welcomeTemplate = require('../templates/email/welcome.template');
const kycSubmittedTemplate = require('../templates/email/kycSubmitted.template');
const kycApprovedTemplate = require('../templates/email/kycApproved.template');
const kycRejectedTemplate = require('../templates/email/kycRejected.template');
const paymentConfirmedTemplate = require('../templates/email/paymentConfirmed.template');
const shaReadyTemplate = require('../templates/email/shaReady.template');
const shaSignedTemplate = require('../templates/email/shaSigned.template');
const distributionAnnouncementTemplate = require('../templates/email/distributionAnnouncement.template');
const distributionPaidTemplate = require('../templates/email/distributionPaid.template');
const distributionToAssetManagerTemplate = require('../templates/email/distributionToAssetManager.template');
const distributionToComplianceTemplate = require('../templates/email/distributionToCompliance.template');
const projectUpdateTemplate = require('../templates/email/projectUpdate.template');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

class NotificationController {
  /**
   * Send welcome email after signup
   */
  async sendWelcomeEmail(user) {
    try {
      const userName = user.firstName || user.email;
      const dashboardUrl = `${FRONTEND_URL}/dashboard`;

      const htmlBody = welcomeTemplate({
        userName,
        userEmail: user.email,
        dashboardUrl
      });

      await emailService.sendEmail({
        to: user.email,
        toName: userName,
        subject: 'Welcome to CoSpaces! 🎉',
        htmlBody,
        userId: user._id,
        eventType: 'welcome_email_sent'
      });

      logger.info('Welcome email sent', { userId: user._id, email: user.email });
    } catch (error) {
      logger.error('Failed to send welcome email', { userId: user._id, error: error.message });
      // Don't throw - email failures shouldn't block signup
    }
  }

  /**
   * Send KYC status emails
   */
  async sendKYCEmail(user, status, reason = null) {
    try {
      const userName = user.firstName || user.email;
      const dashboardUrl = `${FRONTEND_URL}/dashboard/kyc-status`;
      const projectsUrl = `${FRONTEND_URL}/projects`;

      let htmlBody, subject;

      switch (status) {
        case 'submitted':
          htmlBody = kycSubmittedTemplate({ userName, dashboardUrl });
          subject = 'KYC Submitted Successfully';
          break;

        case 'approved':
          htmlBody = kycApprovedTemplate({ userName, dashboardUrl, projectsUrl });
          subject = 'KYC Approved - Start Investing! 🎉';
          break;

        case 'rejected':
          htmlBody = kycRejectedTemplate({ userName, reason, dashboardUrl });
          subject = 'KYC Verification Issue';
          break;

        default:
          logger.warn('Unknown KYC status', { status });
          return;
      }

      await emailService.sendEmail({
        to: user.email,
        toName: userName,
        subject,
        htmlBody,
        userId: user._id,
        eventType: `kyc_${status}_email_sent`
      });

      logger.info('KYC email sent', { userId: user._id, status });
    } catch (error) {
      logger.error('Failed to send KYC email', { userId: user._id, status, error: error.message });
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentEmail(user, payment, project) {
    try {
      const userName = user.firstName || user.email;
      const projectName = project?.projectName || 'the project';
      const amount = payment.amount || 0;
      const transactionId = payment.paymentId || payment.razorpayPaymentId || 'N/A';
      const dashboardUrl = `${FRONTEND_URL}/dashboard/investments`;

      const htmlBody = paymentConfirmedTemplate({
        userName,
        projectName,
        amount,
        transactionId,
        dashboardUrl
      });

      await emailService.sendEmail({
        to: user.email,
        toName: userName,
        subject: 'Payment Confirmed - Investment Complete! 💰',
        htmlBody,
        userId: user._id,
        eventType: 'payment_confirmed_email_sent'
      });

      logger.info('Payment confirmation email sent', { userId: user._id, paymentId: payment._id });
    } catch (error) {
      logger.error('Failed to send payment email', { userId: user._id, error: error.message });
    }
  }

  /**
   * Send SHA (Shareholder Agreement) emails
   */
  async sendSHAEmail(user, agreement, action, equityDistribution = null) {
    try {
      const userName = user.firstName || user.email;
      const projectName = agreement.project?.projectName || 'the project';
      const dashboardUrl = `${FRONTEND_URL}/dashboard/sha-signing`;
      const signingUrl = `${FRONTEND_URL}/dashboard/sha-signing`;

      let htmlBody, subject;

      switch (action) {
        case 'ready_to_sign':
          htmlBody = shaReadyTemplate({
            userName,
            projectName,
            equityPercentage: equityDistribution?.equityPercentage || 0,
            investmentAmount: equityDistribution?.investmentAmount || 0,
            signingUrl,
            dashboardUrl
          });
          subject = 'Sign Your Shareholder Agreement ✍️';
          break;

        case 'signed':
          htmlBody = shaSignedTemplate({
            userName,
            projectName,
            dashboardUrl
          });
          subject = 'Shareholder Agreement Signed Successfully! ✅';
          break;

        default:
          logger.warn('Unknown SHA action', { action });
          return;
      }

      await emailService.sendEmail({
        to: user.email,
        toName: userName,
        subject,
        htmlBody,
        userId: user._id,
        eventType: `sha_${action}_email_sent`
      });

      logger.info('SHA email sent', { userId: user._id, action, agreementId: agreement._id });
    } catch (error) {
      logger.error('Failed to send SHA email', { userId: user._id, error: error.message });
    }
  }

  /**
   * Send distribution emails
   */
  async sendDistributionEmail(user, distribution, action) {
    try {
      const userName = user.firstName || user.email;
      const projectName = distribution.project?.projectName || 'the project';
      const dashboardUrl = `${FRONTEND_URL}/dashboard/distributions`;

      // Find this user's distribution details
      const userDistribution = distribution.investorDistributions.find(
        inv => String(inv.investor) === String(user._id) || String(inv.investor._id) === String(user._id)
      );

      if (!userDistribution) {
        logger.warn('User distribution not found', { userId: user._id, distributionId: distribution._id });
        return;
      }

      const distributionAmount = userDistribution.netAmount || 0;
      const utr = userDistribution.utr;
      const paymentDate = userDistribution.paymentDate 
        ? new Date(userDistribution.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'To be announced';

      let htmlBody, subject;

      switch (action) {
        case 'announced':
          htmlBody = distributionAnnouncementTemplate({
            userName,
            projectName,
            distributionAmount,
            distributionDate: paymentDate,
            dashboardUrl
          });
          subject = 'Distribution Announced! 💰';
          break;

        case 'paid':
          htmlBody = distributionPaidTemplate({
            userName,
            projectName,
            distributionAmount,
            utr,
            paymentDate,
            dashboardUrl
          });
          subject = 'Distribution Payment Completed! 💸';
          break;

        default:
          logger.warn('Unknown distribution action', { action });
          return;
      }

      await emailService.sendEmail({
        to: user.email,
        toName: userName,
        subject,
        htmlBody,
        userId: user._id,
        eventType: `distribution_${action}_email_sent`
      });

      logger.info('Distribution email sent', { userId: user._id, action, distributionId: distribution._id });
    } catch (error) {
      logger.error('Failed to send distribution email', { userId: user._id, error: error.message });
    }
  }

  /**
   * Send distribution notification to asset manager
   */
  async sendDistributionToAssetManagerEmail(assetManager, distribution) {
    try {
      const userName = assetManager.firstName || assetManager.email;
      const projectName = distribution.project?.projectName || 'the project';
      const distributionNumber = distribution.distributionNumber || 'N/A';
      const grossProceeds = distribution.grossProceeds || 0;
      const netDistributableAmount = distribution.netDistributableAmount || 0;
      const distributionType = distribution.distributionType || 'final_sale_proceeds';
      
      // Dashboard URL - asset manager dashboard
      const dashboardUrl = `${FRONTEND_URL}/dashboard/asset-manager`;
      const approvalUrl = `${FRONTEND_URL}/dashboard/asset-manager?distributionId=${distribution._id}`;

      const htmlBody = distributionToAssetManagerTemplate({
        userName,
        projectName,
        distributionNumber,
        grossProceeds,
        netDistributableAmount,
        distributionType,
        approvalUrl,
        dashboardUrl
      });

      const subject = `Distribution Approval Required: ${projectName} 📋`;

      await emailService.sendEmail({
        to: assetManager.email,
        toName: userName,
        subject,
        htmlBody,
        userId: assetManager._id,
        eventType: 'distribution_to_asset_manager_email_sent'
      });

      logger.info('Distribution to asset manager email sent', {
        userId: assetManager._id,
        distributionId: distribution._id,
        distributionNumber
      });
    } catch (error) {
      logger.error('Failed to send distribution to asset manager email', {
        userId: assetManager._id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send distribution notification to compliance officer
   */
  async sendDistributionToComplianceEmail(complianceOfficer, distribution) {
    try {
      const userName = complianceOfficer.firstName || complianceOfficer.email;
      const projectName = distribution.project?.projectName || 'the project';
      const distributionNumber = distribution.distributionNumber || 'N/A';
      const grossProceeds = distribution.grossProceeds || 0;
      const netDistributableAmount = distribution.netDistributableAmount || 0;
      const distributionType = distribution.distributionType || 'final_sale_proceeds';
      
      // Get asset manager name who approved
      const assetManagerName = distribution.approvals?.assetManagerApproval?.approvedBy 
        ? `${distribution.approvals.assetManagerApproval.approvedBy.firstName || ''} ${distribution.approvals.assetManagerApproval.approvedBy.lastName || ''}`.trim() || 'Asset Manager'
        : 'Asset Manager';
      
      // Dashboard URL - compliance dashboard
      const dashboardUrl = `${FRONTEND_URL}/dashboard/compliance`;
      const approvalUrl = `${FRONTEND_URL}/dashboard/compliance?distributionId=${distribution._id}`;

      const htmlBody = distributionToComplianceTemplate({
        userName,
        projectName,
        distributionNumber,
        grossProceeds,
        netDistributableAmount,
        distributionType,
        assetManagerName,
        approvalUrl,
        dashboardUrl
      });

      const subject = `Compliance Review Required: ${projectName} ⚖️`;

      await emailService.sendEmail({
        to: complianceOfficer.email,
        toName: userName,
        subject,
        htmlBody,
        userId: complianceOfficer._id,
        eventType: 'distribution_to_compliance_email_sent'
      });

      logger.info('Distribution to compliance email sent', {
        userId: complianceOfficer._id,
        distributionId: distribution._id,
        distributionNumber
      });
    } catch (error) {
      logger.error('Failed to send distribution to compliance email', {
        userId: complianceOfficer._id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send project update emails to all investors
   */
  async sendProjectUpdateEmail(users, project, updateType, updateMessage) {
    try {
      const projectName = project.projectName || 'the project';
      const dashboardUrl = `${FRONTEND_URL}/projects/${project._id}`;

      const emailList = users.map(user => ({
        to: user.email,
        toName: user.firstName || user.email,
        subject: `Update: ${projectName}`,
        htmlBody: projectUpdateTemplate({
          userName: user.firstName || user.email,
          projectName,
          updateType,
          updateMessage,
          dashboardUrl
        }),
        userId: user._id,
        eventType: 'project_update_email_sent'
      }));

      const results = await emailService.sendBulkEmails(emailList);
      
      logger.info('Project update emails sent', {
        projectId: project._id,
        updateType,
        totalRecipients: users.length,
        successCount: results.success,
        failedCount: results.failed
      });

      return results;
    } catch (error) {
      logger.error('Failed to send project update emails', { projectId: project._id, error: error.message });
      throw error;
    }
  }
}

module.exports = new NotificationController();

