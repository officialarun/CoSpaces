const crypto = require('crypto');
const logger = require('../utils/logger');

class MockESignService {
  /**
   * Mock initiate eSign process
   * @param {String} documentUrl - URL of the document
   * @param {Object} signerDetails - Signer information
   * @param {String} userId - User ID
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Mock eSign response
   */
  async mockInitiateESign(documentUrl, signerDetails, userId, metadata = {}) {
    try {
      logger.info('Mock eSign initiation started', {
        userId,
        signerEmail: signerDetails.email,
        agreementId: metadata.agreementId
      });

      // Generate mock eSignRequestId
      const agreementId = metadata.agreementId || crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      const eSignRequestId = `mock_${agreementId}_${timestamp}`;

      // Generate mock hash (SHA256 of agreement ID + timestamp)
      const hashInput = `${agreementId}_${timestamp}_${userId}`;
      const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

      // Generate mock signing URL (local route)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const signingUrl = `${frontendUrl}/dashboard/sha-signing/verify/${agreementId}`;

      logger.info('Mock eSign initiated successfully', {
        eSignRequestId,
        hash: hash.substring(0, 16) + '...',
        signingUrl
      });

      return {
        eSignRequestId,
        hash,
        signingUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isMock: true
      };
    } catch (error) {
      logger.error('Mock eSign initiation failed:', error);
      throw error;
    }
  }

  /**
   * Mock verify signature
   * @param {String} signature - Signature to verify
   * @param {String} hash - Expected hash
   * @returns {Boolean} - Always returns true for mock
   */
  mockVerifySignature(signature, hash) {
    // For mock implementation, always return true
    // In real implementation, this would verify against DIDIT
    return true;
  }

  /**
   * Mock sign document
   * @param {String} agreementId - Agreement ID
   * @param {String} userId - User ID
   * @param {Object} metadata - Additional metadata (IP, user agent, etc.)
   * @returns {Object} - Mock signature result
   */
  async mockSignDocument(agreementId, userId, metadata = {}) {
    try {
      const timestamp = Date.now();
      
      // Generate mock signature hash
      const signatureInput = `${agreementId}_${userId}_${timestamp}`;
      const signatureHash = crypto.createHash('sha256').update(signatureInput).digest('hex');

      // Generate mock certificate
      const certificate = `MOCK_CERT_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

      logger.info('Mock document signed', {
        agreementId,
        userId,
        signatureHash: signatureHash.substring(0, 16) + '...',
        timestamp: new Date(timestamp).toISOString()
      });

      return {
        eSignRequestId: `mock_${agreementId}_${timestamp}`,
        status: 'signed',
        signedAt: new Date(timestamp),
        certificate,
        signatureHash,
        metadata: {
          ...metadata,
          isMock: true,
          mockSignedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Mock document signing failed:', error);
      throw error;
    }
  }
}

module.exports = new MockESignService();

