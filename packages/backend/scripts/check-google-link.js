const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function checkGoogleLink() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminEmail = 'official.pandeyarun0600@gmail.com';
    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ User not found:', adminEmail);
      return;
    }

    console.log('👤 User Found:');
    console.log('=====================================');
    console.log('Email:', user.email);
    console.log('Name:', user.firstName, user.lastName);
    console.log('Role:', user.role);
    console.log('Auth Provider:', user.authProvider);
    console.log('Google ID:', user.googleId || '❌ NOT LINKED');
    console.log('Has Password:', user.password ? '✅ Yes' : '❌ No');
    console.log('Is Active:', user.isActive);
    console.log('Email Verified:', user.isEmailVerified);
    console.log('Phone:', user.phone);
    console.log('KYC Status:', user.kycStatus);
    console.log('Onboarding Completed:', user.onboardingCompleted);
    console.log('=====================================\n');

    if (user.role === 'admin') {
      console.log('✅ User has admin role');
    } else {
      console.log('❌ User is NOT admin, role is:', user.role);
    }

    if (user.googleId) {
      console.log('✅ Google account is linked');
    } else {
      console.log('⚠️  Google account NOT linked yet');
      console.log('   This is normal if you haven\'t logged in with Google before.');
    }

    console.log('\n📋 Expected behavior when logging in with Google:');
    console.log('1. User should login via Google');
    console.log('2. Backend will link Google ID to this user');
    console.log('3. authProvider will change to "google"');
    console.log('4. User should be redirected to admin dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkGoogleLink();

