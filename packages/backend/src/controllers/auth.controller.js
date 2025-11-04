const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const logger = require('../utils/logger');
const { encrypt } = require('../utils/encryption');
const notificationController = require('./notification.controller');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Signup
exports.signup = async (req, res, next) => {
  try {
    const {
      email,
      phone,
      password,
      userType,
      firstName,
      lastName,
      entityName,
      entityType
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or phone'
      });
    }

    // Create user
    const userData = {
      email,
      phone,
      password,
      userType,
      role: 'investor'
    };

    if (userType === 'individual') {
      userData.firstName = firstName;
      userData.lastName = lastName;
    } else {
      userData.entityName = entityName;
      userData.entityType = entityType;
    }

    const user = await User.create(userData);

    // Generate verification tokens
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const phoneVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailVerificationToken = emailVerificationToken;
    user.phoneVerificationToken = phoneVerificationToken;
    await user.save();

    // TODO: Send verification email and SMS
    // await sendVerificationEmail(user, emailVerificationToken);
    // await sendVerificationSMS(user, phoneVerificationToken);

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'user_signup',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      performedByRole: user.role,
      action: 'User signed up',
      description: `New user registered: ${user.email}`,
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // Send welcome email (non-blocking)
    notificationController.sendWelcomeEmail(user).catch(err => 
      logger.error('Failed to send welcome email', { userId: user._id, error: err.message })
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email and phone.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          role: user.role,
          kycStatus: user.kycStatus
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await AuditLog.logEvent({
        eventType: 'failed_login_attempt',
        eventCategory: 'authentication',
        severity: 'warning',
        performedByEmail: email,
        action: 'Failed login attempt',
        description: `Login attempt with non-existent email: ${email}`,
        request: {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      await AuditLog.logEvent({
        eventType: 'failed_login_attempt',
        eventCategory: 'security',
        severity: 'warning',
        performedBy: user._id,
        performedByEmail: user.email,
        action: 'Login attempt on locked account',
        request: {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return res.status(403).json({
        error: 'Account is locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      await user.incLoginAttempts();

      await AuditLog.logEvent({
        eventType: 'failed_login_attempt',
        eventCategory: 'authentication',
        severity: 'warning',
        performedBy: user._id,
        performedByEmail: user.email,
        action: 'Failed login attempt',
        description: 'Invalid password',
        request: {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // If MFA is enabled, require MFA verification
    if (user.mfaEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, mfaVerified: false },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({
        success: true,
        mfaRequired: true,
        tempToken
      });
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log successful login
    await AuditLog.logEvent({
      eventType: 'user_login',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      performedByRole: user.role,
      action: 'User logged in',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          role: user.role,
          kycStatus: user.kycStatus,
          displayName: user.displayName,
          mfaEnabled: user.mfaEnabled
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify MFA during login
exports.verifyMFALogin = async (req, res, next) => {
  try {
    const { tempToken, mfaToken } = req.body;

    if (!tempToken || !mfaToken) {
      return res.status(400).json({
        error: 'Temp token and MFA token are required'
      });
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (decoded.mfaVerified) {
      return res.status(400).json({
        error: 'Invalid temp token'
      });
    }

    // Find user
    const user = await User.findById(decoded.id).select('+mfaSecret');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify MFA token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 2
    });

    if (!verified) {
      await AuditLog.logEvent({
        eventType: 'failed_login_attempt',
        eventCategory: 'authentication',
        severity: 'warning',
        performedBy: user._id,
        performedByEmail: user.email,
        action: 'Failed MFA verification',
        request: {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return res.status(401).json({
        error: 'Invalid MFA token'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log successful login
    await AuditLog.logEvent({
      eventType: 'user_login',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      performedByRole: user.role,
      action: 'User logged in with MFA',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          role: user.role,
          kycStatus: user.kycStatus,
          displayName: user.displayName,
          mfaEnabled: user.mfaEnabled
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    await AuditLog.logEvent({
      eventType: 'user_logout',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: req.user._id,
      performedByEmail: req.user.email,
      performedByRole: req.user.role,
      action: 'User logged out',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Setup MFA
exports.setupMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.mfaEnabled) {
      return res.status(400).json({
        error: 'MFA is already enabled'
      });
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `FractionalLand (${user.email})`,
      issuer: 'FractionalLand'
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Save secret temporarily (not enabled yet)
    user.mfaSecret = secret.base32;
    user.mfaBackupCodes = backupCodes.map(code => encrypt(code));
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        backupCodes
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify and enable MFA
exports.verifyMFA = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user._id).select('+mfaSecret');

    if (!user.mfaSecret) {
      return res.status(400).json({
        error: 'MFA setup not initiated'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        error: 'Invalid MFA token'
      });
    }

    user.mfaEnabled = true;
    await user.save();

    await AuditLog.logEvent({
      eventType: 'mfa_enabled',
      eventCategory: 'security',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      action: 'MFA enabled',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Disable MFA
exports.disableMFA = async (req, res, next) => {
  try {
    const { password, mfaToken } = req.body;

    const user = await User.findById(req.user._id).select('+password +mfaSecret');

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }

    // Verify MFA token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        error: 'Invalid MFA token'
      });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = [];
    await user.save();

    await AuditLog.logEvent({
      eventType: 'mfa_disabled',
      eventCategory: 'security',
      severity: 'warning',
      performedBy: user._id,
      performedByEmail: user.email,
      action: 'MFA disabled',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // TODO: Send reset password email
    // await sendPasswordResetEmail(user, resetToken);

    await AuditLog.logEvent({
      eventType: 'user_password_change',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      action: 'Password reset requested',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.',
      // For development only
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await AuditLog.logEvent({
      eventType: 'user_password_change',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      action: 'Password reset completed',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    await AuditLog.logEvent({
      eventType: 'user_password_change',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      action: 'Password changed',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify phone
exports.verifyPhone = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ phoneVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid verification token'
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification
exports.resendVerification = async (req, res, next) => {
  try {
    const { email, type } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: 'If your email is registered, verification will be sent.'
      });
    }

    if (type === 'email') {
      if (user.isEmailVerified) {
        return res.status(400).json({
          error: 'Email is already verified'
        });
      }

      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = emailVerificationToken;
      await user.save();

      // TODO: Send verification email
    } else if (type === 'phone') {
      if (user.isPhoneVerified) {
        return res.status(400).json({
          error: 'Phone is already verified'
        });
      }

      const phoneVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      user.phoneVerificationToken = phoneVerificationToken;
      await user.save();

      // TODO: Send verification SMS
    }

    res.json({
      success: true,
      message: 'Verification sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    // User is authenticated via passport
    const user = req.user;

    // Generate JWT token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'user_login',
      eventCategory: 'authentication',
      severity: 'info',
      performedBy: user._id,
      performedByEmail: user.email,
      performedByRole: user.role,
      action: 'User logged in via Google OAuth',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // Determine redirect URL based on state parameter
    let redirectURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    try {
      if (req.query.state) {
        const state = JSON.parse(decodeURIComponent(req.query.state));
        if (state.isAdmin && state.redirectUrl) {
          redirectURL = state.redirectUrl;
        }
      }
    } catch (error) {
      logger.warn('Failed to parse OAuth state parameter:', error);
    }

    // Redirect to frontend with token
    res.redirect(`${redirectURL}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  } catch (error) {
    logger.error('Google OAuth callback error:', error);
    
    // Determine error redirect URL
    let redirectURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      if (req.query.state) {
        const state = JSON.parse(decodeURIComponent(req.query.state));
        if (state.isAdmin && state.redirectUrl) {
          redirectURL = state.redirectUrl;
        }
      }
    } catch (err) {
      // Use default URL
    }
    
    res.redirect(`${redirectURL}/login?error=oauth_failed`);
  }
};

