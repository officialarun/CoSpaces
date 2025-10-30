/**
 * Check Admin User Status
 * 
 * Verifies if admin user exists and shows their details
 * Run: node packages/backend/scripts/check-admin.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function checkAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables!');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminEmail = 'official.pandeyarun0600@gmail.com';

    // Check if user exists
    const user = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User NOT FOUND with email:', adminEmail);
      console.log('\n💡 The user was not created. Run this to create:');
      console.log('node packages/backend/scripts/create-admin.js\n');
      process.exit(0);
    }

    console.log('✅ User EXISTS in database!\n');
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email:', user.email);
    console.log('👤 Role:', user.role);
    console.log('📱 Phone:', user.phone || 'Not set');
    console.log('🔐 Has Password:', !!user.password);
    console.log('✉️  Email Verified:', user.isEmailVerified);
    console.log('✅ Is Active:', user.isActive !== false);
    console.log('📋 KYC Status:', user.kycStatus);
    console.log('🎯 Onboarding Complete:', user.onboardingCompleted);
    console.log('🔑 Auth Provider:', user.authProvider || 'local');
    console.log('🆔 Google ID:', user.googleId || 'Not linked');
    console.log('═══════════════════════════════════════════\n');

    // Check if admin
    if (user.role === 'admin') {
      console.log('✅ User IS an admin!\n');
      
      if (!user.password) {
        console.log('⚠️  WARNING: User has no password set!');
        console.log('This might be a Google OAuth only account.\n');
        console.log('To set a password, run:');
        console.log('node packages/backend/scripts/reset-admin-password.js\n');
      } else {
        console.log('✅ User has password set (hashed)\n');
        console.log('🎯 You should be able to login with:');
        console.log('   Email: official.pandeyarun0600@gmail.com');
        console.log('   Password: (the one set when created)\n');
        console.log('💡 If password not working, reset it with:');
        console.log('   node packages/backend/scripts/reset-admin-password.js\n');
      }
    } else {
      console.log('⚠️  User is NOT an admin!');
      console.log('Current role:', user.role);
      console.log('\nTo promote to admin, run:');
      console.log('node packages/backend/scripts/create-admin.js\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmin();

