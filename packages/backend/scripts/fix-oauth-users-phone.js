/**
 * Migration script to fix OAuth users who don't have phone field
 * This script initializes the phone field for existing Google OAuth users
 */

const mongoose = require('mongoose');
const User = require('../src/models/User.model');
require('dotenv').config();

async function fixOAuthUsersPhone() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all OAuth users who don't have phone field (or have undefined)
    const oauthUsers = await User.find({
      authProvider: 'google',
      $or: [
        { phone: { $exists: false } },
        { phone: null },
        { phone: undefined }
      ]
    });

    console.log(`Found ${oauthUsers.length} OAuth users without phone field`);

    let updated = 0;
    for (const user of oauthUsers) {
      // Initialize phone field if it doesn't exist
      if (user.phone === undefined || user.phone === null) {
        user.phone = null;
        if (user.isPhoneVerified === undefined) {
          user.isPhoneVerified = false;
        }
        await user.save();
        updated++;
        console.log(`✅ Updated user: ${user.email} (${user._id})`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} users.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  fixOAuthUsersPhone();
}

module.exports = { fixOAuthUsersPhone };

