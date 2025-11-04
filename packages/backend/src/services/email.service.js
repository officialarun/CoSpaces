const { SendMailClient } = require('zeptomail');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog.model');

class EmailService {
  constructor() {
    this.url = process.env.ZEPTOMAIL_URL || 'https://api.zeptomail.in/v1.1/email';
    this.token = process.env.ZEPTOMAIL_TOKEN;
    this.fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || 'noreply@devopsenthusiasts.solutions';
    this.fromName = process.env.ZEPTOMAIL_FROM_NAME || 'CoSpaces';
    
    if (!this.token) {
      logger.warn('ZEPTOMAIL_TOKEN not configured. Email service will not function.');
    } else {
      this.client = new SendMailClient({ url: this.url, token: this.token });
    }
  }

  /**
   * Send email using ZeptoMail
   * @param {Object} options - Email options
   * @param {String} options.to - Recipient email address
   * @param {String} options.toName - Recipient name
   * @param {String} options.subject - Email subject
   * @param {String} options.htmlBody - HTML content
   * @param {String} options.userId - User ID for audit logging
   * @param {String} options.eventType - Event type for audit logging
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail(options) {
    try {
      const { to, toName, subject, htmlBody, userId, eventType = 'email_sent' } = options;

      if (!this.client) {
        throw new Error('Email service not configured. Please set ZEPTOMAIL_TOKEN.');
      }

      if (!to || !subject || !htmlBody) {
        throw new Error('Missing required email fields: to, subject, htmlBody');
      }

      logger.info('Sending email', {
        to,
        subject,
        eventType
      });

      const mailOptions = {
        from: {
          address: this.fromAddress,
          name: this.fromName
        },
        to: [
          {
            email_address: {
              address: to,
              name: toName || 'User'
            }
          }
        ],
        subject,
        htmlbody: htmlBody
      };

      const result = await this.client.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to,
        subject,
        eventType
      });

      // Log to audit trail
      if (userId) {
        await AuditLog.logEvent({
          userId,
          eventType,
          eventCategory: 'notification',
          action: `Email sent: ${subject}`,
          details: {
            to,
            subject,
            sentAt: new Date()
          }
        });
      }

      return {
        success: true,
        result
      };
    } catch (error) {
      logger.error('Email sending failed', {
        to: options.to,
        subject: options.subject,
        error: error.message,
        stack: error.stack
      });

      // Log failed email attempt
      if (options.userId) {
        try {
          await AuditLog.logEvent({
            userId: options.userId,
            eventType: 'email_failed',
            eventCategory: 'notification',
            action: `Email failed: ${options.subject}`,
            details: {
              to: options.to,
              subject: options.subject,
              error: error.message,
              failedAt: new Date()
            }
          });
        } catch (auditError) {
          logger.error('Failed to log email failure', auditError);
        }
      }

      throw error;
    }
  }

  /**
   * Send email with retry logic
   * @param {Object} options - Email options
   * @param {Number} maxRetries - Maximum retry attempts (default: 3)
   * @returns {Promise<Object>} - Send result
   */
  async sendEmailWithRetry(options, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.sendEmail(options);
        return result;
      } catch (error) {
        lastError = error;
        logger.warn(`Email send attempt ${attempt} failed`, {
          to: options.to,
          subject: options.subject,
          error: error.message
        });
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    logger.error(`Email send failed after ${maxRetries} attempts`, {
      to: options.to,
      subject: options.subject,
      error: lastError.message
    });
    
    throw lastError;
  }

  /**
   * Send bulk emails (for distributions, project updates)
   * @param {Array} emailList - Array of email options objects
   * @returns {Promise<Object>} - Results summary
   */
  async sendBulkEmails(emailList) {
    const results = {
      total: emailList.length,
      success: 0,
      failed: 0,
      errors: []
    };

    logger.info(`Sending bulk emails`, { count: emailList.length });

    // Send emails in parallel with a concurrency limit
    const concurrencyLimit = 10;
    const chunks = [];
    
    for (let i = 0; i < emailList.length; i += concurrencyLimit) {
      chunks.push(emailList.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(emailOptions =>
        this.sendEmail(emailOptions)
          .then(() => {
            results.success++;
          })
          .catch(error => {
            results.failed++;
            results.errors.push({
              to: emailOptions.to,
              error: error.message
            });
          })
      );

      await Promise.allSettled(promises);
    }

    logger.info('Bulk email sending completed', results);
    return results;
  }
}

module.exports = new EmailService();

