/**
 * Migration Script: Fix Phone Index
 * 
 * Problem: The phone_1 index doesn't allow multiple null values,
 * causing duplicate key errors for Google OAuth users without phone numbers.
 * 
 * Solution: Drop the old index and recreate it as a sparse index.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixPhoneIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('\n📊 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${JSON.stringify(index)}`);
    });

    // Check if phone_1 index exists
    const phoneIndex = indexes.find(idx => idx.name === 'phone_1');
    
    if (phoneIndex) {
      console.log('\n🗑️  Dropping old phone_1 index...');
      await usersCollection.dropIndex('phone_1');
      console.log('✅ Old phone_1 index dropped');
    } else {
      console.log('\n⚠️  phone_1 index not found (may have been dropped already)');
    }

    // Create new sparse index
    console.log('\n🔨 Creating new sparse phone index...');
    await usersCollection.createIndex(
      { phone: 1 }, 
      { 
        sparse: true,
        unique: true,
        name: 'phone_1'
      }
    );
    console.log('✅ New sparse phone index created');

    console.log('\n📊 Updated indexes:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: sparse=${index.sparse || false}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('🚀 You can now create multiple Google OAuth users without phone numbers.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
fixPhoneIndex();

