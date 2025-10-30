/**
 * Reset Admin Password
 * 
 * Resets password for admin user
 * Run: node packages/backend/scripts/reset-admin-password.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function resetPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables!');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminEmail = 'official.pandeyarun0600@gmail.com';
    const newPassword = 'Admin@12345';

    // Find user
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.log('❌ User NOT FOUND with email:', adminEmail);
      console.log('\n💡 Create the user first with:');
      console.log('node packages/backend/scripts/create-admin.js\n');
      process.exit(0);
    }

    console.log('✅ User found!\n');
    console.log('🔄 Resetting password...\n');

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.isActive = true;
    user.role = 'admin'; // Ensure admin role
    user.kycStatus = 'approved';
    user.isEmailVerified = true;
    user.onboardingCompleted = true;
    user.onboardingStep = 2;
    
    await user.save();

    console.log('✅ Password reset successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email:', user.email);
    console.log('🔑 New Password: Admin@12345');
    console.log('👤 Role:', user.role);
    console.log('📱 Phone:', user.phone || 'Not set');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('🎯 You can now login at: http://localhost:3001');
    console.log('   Email: official.pandeyarun0600@gmail.com');
    console.log('   Password: Admin@12345\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();

