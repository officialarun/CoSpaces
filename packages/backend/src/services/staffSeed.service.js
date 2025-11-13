const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const logger = require('../utils/logger');

/**
 * Seeds a staff member account
 * Sets up all required fields for immediate login (email/password and Google OAuth)
 * @param {Object} userData - Staff member data
 * @param {String} userData.email - Staff email
 * @param {String} userData.password - Staff password (will be hashed)
 * @param {String} userData.firstName - First name
 * @param {String} userData.lastName - Last name
 * @param {String} userData.role - Role (asset_manager or compliance_officer)
 * @param {String} userData.phone - Phone number (optional)
 * @param {ObjectId} createdBy - Admin user ID who created this staff member
 * @returns {Promise<Object>} Seeded user object
 */
async function seedStaffMember(userData, createdBy) {
  try {
    const { email, password, firstName, lastName, role, phone } = userData;

    // Validate role
    if (!['asset_manager', 'compliance_officer'].includes(role)) {
      throw new Error(`Invalid role for staff member: ${role}. Must be 'asset_manager' or 'compliance_officer'`);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Create user with all required fields
    const staffUser = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      phone: phone || '',
      firstName,
      lastName,
      userType: 'individual',
      role,
      authProvider: 'local', // Can be updated to 'google' when they use Google OAuth
      isEmailVerified: true, // Staff emails are pre-verified
      isActive: true,
      onboardingCompleted: true,
      onboardingStep: 2,
      kycStatus: 'approved', // Staff don't need KYC verification
      consents: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date()
      }
    });

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'staff_member_created',
      eventCategory: 'user',
      performedBy: createdBy,
      targetEntity: { entityType: 'user', entityId: staffUser._id },
      action: `Staff member created: ${role}`,
      details: {
        email: staffUser.email,
        role: staffUser.role,
        firstName: staffUser.firstName,
        lastName: staffUser.lastName
      }
    });

    logger.info(`Staff member seeded: ${staffUser.email} (${role})`);

    return staffUser;
  } catch (error) {
    logger.error('Error seeding staff member:', error);
    throw error;
  }
}

module.exports = {
  seedStaffMember
};

