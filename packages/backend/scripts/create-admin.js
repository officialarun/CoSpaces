/**
 * Create Admin User Script
 * 
 * Creates an admin user that can login via:
 * 1. Email & Password
 * 2. Google OAuth (if email matches Google account)
 * 
 * Run: node packages/backend/scripts/create-admin.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables!');
      console.log('\n📝 Please ensure .env file exists at: packages/backend/.env');
      console.log('With the following content:');
      console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminEmail = 'official.pandeyarun0600@gmail.com';

    // Check if user already exists by email
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      console.log('👤 User already exists with this email');
      console.log('Current role:', existingUser.role);
      console.log('Phone:', existingUser.phone || 'Not set');
      
      if (existingUser.role === 'admin') {
        console.log('✅ User is already an admin!');
        console.log('\n═══════════════════════════════════════════');
        console.log('📧 Email:', existingUser.email);
        console.log('👤 Role:', existingUser.role);
        console.log('📱 Phone:', existingUser.phone || 'Not set');
        console.log('═══════════════════════════════════════════\n');
        console.log('🎯 You can login at: http://localhost:3001');
        console.log('- Email/Password: Use your existing password');
        console.log('- Google OAuth: Click "Continue with Google"\n');
      } else {
        console.log('\n🔄 Promoting user to admin...');
        existingUser.role = 'admin';
        existingUser.isActive = true;
        existingUser.kycStatus = 'approved';
        existingUser.onboardingCompleted = true;
        existingUser.onboardingStep = 2;
        await existingUser.save();
        
        console.log('✅ User promoted to admin successfully!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📧 Email:', existingUser.email);
        console.log('👤 Role: admin');
        console.log('📱 Phone:', existingUser.phone || 'Not set');
        console.log('═══════════════════════════════════════════\n');
        console.log('🎯 You can now login at: http://localhost:3001');
        console.log('- Email/Password: Use your existing password');
        console.log('- Google OAuth: Click "Continue with Google"\n');
      }
      
      process.exit(0);
    }

    // Create new admin user
    console.log('🔄 Creating new admin user...');
    
    // Use a different phone number (change this to your actual number if needed)
    const adminPhone = '+919876543211'; // Changed last digit to avoid conflict
    
    const admin = await User.create({
      email: adminEmail,
      password: 'Admin@12345', // Will be hashed automatically by pre-save hook
      phone: adminPhone, // Your phone number
      role: 'admin', // Admin role for console access
      firstName: 'Arun',
      lastName: 'Pandey',
      userType: 'individual',
      authProvider: 'local', // Will be updated to 'google' on first Google login
      kycStatus: 'approved',
      isEmailVerified: true,
      isActive: true,
      onboardingCompleted: true,
      onboardingStep: 2,
      consents: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date()
      }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin@12345');
    console.log('👤 Role:', admin.role);
    console.log('📱 Phone:', admin.phone);
    console.log('═══════════════════════════════════════════\n');
    
    console.log('🎯 How to Login:\n');
    console.log('1️⃣  Email & Password:');
    console.log('   - Go to: http://localhost:3001');
    console.log('   - Email: official.pandeyarun0600@gmail.com');
    console.log('   - Password: Admin@12345\n');
    
    console.log('2️⃣  Google OAuth:');
    console.log('   - Go to: http://localhost:3001');
    console.log('   - Click "Continue with Google"');
    console.log('   - Login with official.pandeyarun0600@gmail.com');
    console.log('   - Will auto-link to this admin account\n');
    
    console.log('💡 Tips:');
    console.log('   - Change password after first login');
    console.log('   - Google OAuth will link automatically on first use');
    console.log('   - You can use either login method anytime\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    if (error.code === 11000) {
      console.log('\n⚠️  Duplicate key error - User might already exist');
      console.log('Try updating the existing user to admin role instead:');
      console.log('db.users.updateOne(');
      console.log('  { email: "official.pandeyarun0600@gmail.com" },');
      console.log('  { $set: { role: "admin" } }');
      console.log(')');
    }
    
    process.exit(1);
  }
}

// Run the script
createAdmin();

