const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const logger = require('../utils/logger');
const { encrypt, decrypt } = require('../utils/encryption');
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');

class DiditService {
  constructor() {
    this.apiKey = process.env.DIDIT_API_KEY;
    this.baseURL = process.env.DIDIT_BASE_URL || 'https://verification.didit.me';
    
    // Initialize axios instance with x-api-key authentication
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': this.apiKey
      },
      timeout: 60000 // Increase timeout for document processing
    });
  }

  /**
   * Verify ID document directly using DIDIT API
   * @param {Buffer} documentImage - Document image buffer
   * @param {String} userId - User ID
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Verification results
   */
  async verifyIdDocument(documentImage, userId, metadata = {}) {
    try {
      // Ensure we have a buffer
      if (!Buffer.isBuffer(documentImage)) {
        throw new Error('Document image must be a Buffer');
      }

      // Log verification attempt
      await AuditLog.logEvent({
        userId,
        eventType: 'kyc_submitted',
        eventCategory: 'kyc_aml',
        action: 'DIDIT ID verification initiated',
        details: {
          metadata,
          imageSize: documentImage.length,
          timestamp: new Date().toISOString()
        }
      });

      logger.info(`DIDIT ID verification initiated for user ${userId}`, {
        imageLength: documentImage.length
      });

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('front_image', documentImage, {
        filename: 'document.jpg',
        contentType: 'image/jpeg'
      });
      formData.append('vendor_data', userId.toString());

      logger.info('Sending multipart request to DIDIT:', {
        url: `${this.baseURL}/v2/id-verification/`,
        fields: ['front_image', 'vendor_data'],
        imageSize: documentImage.length
      });

      // Call DIDIT ID verification endpoint with multipart/form-data
      const response = await this.api.post('/v2/id-verification/', formData, {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': this.apiKey
        }
      });

      const verificationData = response.data;

      // Log complete DIDIT response for debugging
      console.log('===== DIDIT VERIFICATION RESPONSE =====');
      console.log('Full Response:', JSON.stringify(verificationData, null, 2));
      console.log('ID Verification Data:', JSON.stringify(verificationData.id_verification, null, 2));
      console.log('=========================================');

      logger.info('DIDIT response received:', {
        status: verificationData.id_verification?.status,
        requestId: verificationData.request_id,
        hasDateOfBirth: !!verificationData.id_verification?.date_of_birth,
        hasAge: !!verificationData.id_verification?.age,
        hasGender: !!verificationData.id_verification?.gender,
        hasAddress: !!verificationData.id_verification?.parsed_address
      });

      // Store verified data
      await this.storeVerifiedData(userId, verificationData);

      logger.info(`DIDIT ID verification completed for user ${userId}`);

      return {
        verified: verificationData.id_verification?.status !== 'Declined',
        data: verificationData
      };
    } catch (error) {
      // Log detailed error information
      console.log('===== DIDIT API ERROR =====');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('DIDIT Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('===========================');
      
      logger.error('DIDIT ID verification failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      await AuditLog.logEvent({
        userId,
        eventType: 'kyc_rejected',
        eventCategory: 'kyc_aml',
        action: 'DIDIT ID verification failed',
        details: {
          error: error.message,
          statusCode: error.response?.status,
          response: error.response?.data
        },
        status: 'error'
      });
      
      // Include DIDIT's error message if available
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message;
      
      throw new Error('Failed to verify ID document: ' + errorMessage);
    }
  }


  /**
   * Get verification status for a user
   * @param {String} userId - User ID
   * @returns {Object} - Verification status and data
   */
  async getVerificationStatus(userId) {
    try {
      const user = await User.findById(userId).select('diditVerification');
      
      if (!user) {
        throw new Error('User not found');
      }

      const verificationData = user.diditVerification?.verificationData;

      const statusResponse = {
        isVerified: user.diditVerification?.isVerified || false,
        verifiedAt: user.diditVerification?.verifiedAt,
        aadhaarVerified: user.diditVerification?.aadhaarVerified || false,
        ageVerified: user.diditVerification?.ageVerified || false,
        addressVerified: user.diditVerification?.addressVerified || false,
        verifiedData: verificationData ? {
          name: verificationData.verifiedName,
          dob: verificationData.verifiedDOB,
          age: verificationData.verifiedAge,
          gender: verificationData.verifiedGender,
          address: verificationData.verifiedAddress,
          aadhaarLast4: verificationData.encryptedAadhaar 
            ? decrypt(verificationData.encryptedAadhaar) 
            : null
        } : null,
        // Detailed field-level verification status
        verifiedFields: {
          dob: !!verificationData?.verifiedDOB,
          age: !!verificationData?.verifiedAge,
          gender: !!verificationData?.verifiedGender,
          name: !!verificationData?.verifiedName,
          address: {
            full: user.diditVerification?.addressVerified || false,
            street: !!(verificationData?.verifiedAddress?.street),
            city: !!(verificationData?.verifiedAddress?.city),
            state: !!(verificationData?.verifiedAddress?.state),
            pincode: !!(verificationData?.verifiedAddress?.pincode),
            country: !!(verificationData?.verifiedAddress?.country)
          }
        }
      };

      console.log('===== GET VERIFICATION STATUS =====');
      console.log('User ID:', userId);
      console.log('IsVerified:', statusResponse.isVerified);
      console.log('Verified Data:', JSON.stringify(statusResponse.verifiedData, null, 2));
      console.log('Verified Fields:', JSON.stringify(statusResponse.verifiedFields, null, 2));
      console.log('====================================');

      return statusResponse;
    } catch (error) {
      logger.error('Failed to get verification status:', error);
      throw error;
    }
  }

  /**
   * Store verified data securely in user document
   * @param {String} userId - User ID
   * @param {Object} verificationData - Data from DIDIT (complete response)
   */
  async storeVerifiedData(userId, verificationData) {
    try {
      const idVerification = verificationData.id_verification;
      
      if (!idVerification) {
        throw new Error('Invalid verification data format');
      }

      console.log('===== STORING DIDIT DATA =====');
      console.log('User ID:', userId);
      console.log('DOB from DIDIT:', idVerification.date_of_birth);
      console.log('Age from DIDIT:', idVerification.age);
      console.log('Gender from DIDIT:', idVerification.gender);
      console.log('Full Name from DIDIT:', idVerification.full_name);
      console.log('================================');

      // Extract only last 4 digits of document number and encrypt
      const documentLast4 = idVerification.document_number 
        ? idVerification.document_number.slice(-4) 
        : null;
      const encryptedDocument = documentLast4 ? encrypt(documentLast4) : null;

      // Parse address from formatted_address or parsed_address
      let addressData = {};
      let hasAddressDetails = false;
      
      if (idVerification.parsed_address) {
        addressData = {
          street: idVerification.parsed_address.street_1 || idVerification.parsed_address.street_2 || null,
          city: idVerification.parsed_address.city || null,
          state: idVerification.parsed_address.region || null,
          pincode: idVerification.parsed_address.postal_code || null,
          country: idVerification.parsed_address.country || 'India'
        };
        // Check if we have meaningful address data (not just country)
        hasAddressDetails = !!(addressData.street || addressData.city || addressData.state || addressData.pincode);
      } else if (idVerification.address) {
        // Fallback to simple address string parsing
        addressData = {
          street: idVerification.address,
          city: null,
          state: null,
          pincode: null,
          country: 'India'
        };
        hasAddressDetails = !!idVerification.address;
      } else {
        // No address provided, only set country
        addressData = {
          street: null,
          city: null,
          state: null,
          pincode: null,
          country: 'India'
        };
      }

      // Track which fields are actually verified (have data)
      const verifiedFields = [];
      const hasDOB = !!idVerification.date_of_birth;
      const hasAge = !!idVerification.age;
      const hasGender = !!idVerification.gender;
      
      if (hasDOB) verifiedFields.push('dob');
      if (hasAge) verifiedFields.push('age');
      if (hasGender) verifiedFields.push('gender');
      if (hasAddressDetails) verifiedFields.push('address');
      if (idVerification.full_name) verifiedFields.push('name');
      if (idVerification.document_number) verifiedFields.push('document');

      // Check if profile data already exists
      const hasExisting = await this.hasExistingData(userId);

      // Update user with verified data
      const updateData = {
        'diditVerification.isVerified': idVerification.status !== 'Declined',
        'diditVerification.verifiedAt': new Date(),
        'diditVerification.aadhaarVerified': !!idVerification.document_number,
        'diditVerification.ageVerified': hasAge,
        'diditVerification.addressVerified': hasAddressDetails,
        'diditVerification.diditUserId': verificationData.request_id,
        'diditVerification.verificationData.encryptedAadhaar': encryptedDocument,
        'diditVerification.verificationData.verifiedName': idVerification.full_name || null,
        'diditVerification.verificationData.verifiedDOB': hasDOB ? new Date(idVerification.date_of_birth) : null,
        'diditVerification.verificationData.verifiedAge': idVerification.age || null,
        'diditVerification.verificationData.verifiedGender': idVerification.gender || null,
        'diditVerification.verificationData.verifiedAddress': addressData,
        'diditVerification.verificationData.documentType': idVerification.document_type || null,
        'diditVerification.verificationData.verificationProof': verificationData.request_id
      };

      // Also update main profile fields if not already set (and if DIDIT provided them)
      if (!hasExisting) {
        if (hasDOB) {
          updateData.dateOfBirth = new Date(idVerification.date_of_birth);
        }
        if (hasGender && idVerification.gender) {
          // Normalize gender to match our enum
          const genderMap = {
            'M': 'male',
            'Male': 'male', 
            'MALE': 'male',
            'F': 'female',
            'Female': 'female',
            'FEMALE': 'female',
            'O': 'other',
            'Other': 'other',
            'OTHER': 'other'
          };
          updateData.gender = genderMap[idVerification.gender] || idVerification.gender.toLowerCase();
        }
        // Only set address if we have actual address details (not just country)
        if (hasAddressDetails) {
          updateData.address = addressData;
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

      console.log('===== DATA STORED IN DATABASE =====');
      console.log('Stored DOB:', updatedUser.dateOfBirth);
      console.log('Stored Gender:', updatedUser.gender);
      console.log('DIDIT Verification Data:', JSON.stringify(updatedUser.diditVerification.verificationData, null, 2));
      console.log('Verified Fields:', verifiedFields);
      console.log('====================================');

      // Log successful verification
      await AuditLog.logEvent({
        userId,
        eventType: 'kyc_approved',
        eventCategory: 'kyc_aml',
        action: 'DIDIT ID verification completed',
        details: {
          verifiedFields, // Only fields that actually have data
          documentType: idVerification.document_type,
          verificationStatus: idVerification.status,
          requestId: verificationData.request_id
        },
        status: 'success'
      });

      logger.info(`DIDIT verified data stored for user ${userId}`);
    } catch (error) {
      logger.error('Failed to store verified data:', error);
      
      await AuditLog.logEvent({
        userId,
        eventType: 'kyc_rejected',
        eventCategory: 'kyc_aml',
        action: 'DIDIT verification data storage failed',
        details: {
          error: error.message
        },
        status: 'error'
      });
      
      throw error;
    }
  }


  /**
   * Calculate age from date of birth
   * @param {String|Date} dob - Date of birth
   * @returns {Number} - Age in years
   */
  calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Check if user already has profile data
   * @param {String} userId - User ID
   * @returns {Boolean} - True if user has existing data
   */
  async hasExistingData(userId) {
    const user = await User.findById(userId).select('dateOfBirth address');
    return !!(user.dateOfBirth || user.address?.street);
  }
}

module.exports = new DiditService();

