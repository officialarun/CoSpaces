const crypto = require('crypto');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  if (!text) return null;
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

/**
 * Hash sensitive data (one-way)
 */
function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate a secure random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Mask PII data for display
 */
function maskPII(text, visibleChars = 4) {
  if (!text || text.length <= visibleChars) return text;
  return text.slice(0, visibleChars) + '*'.repeat(text.length - visibleChars);
}

/**
 * Mask Aadhaar number (show only last 4 digits)
 */
function maskAadhaar(aadhaar) {
  if (!aadhaar) return '';
  return 'XXXX-XXXX-' + aadhaar.slice(-4);
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateToken,
  maskPII,
  maskAadhaar
};

