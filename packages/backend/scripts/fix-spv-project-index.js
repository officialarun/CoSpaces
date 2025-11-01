/**
 * Migration Script: Fix SPV Project Index
 * 
 * Problem: The project_1 index doesn't allow multiple null values,
 * causing duplicate key errors when creating SPVs without projects.
 * 
 * Solution: Drop the old index and let Mongoose recreate it as a sparse index.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function fixSPVProjectIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const spvsCollection = db.collection('spvs');

    console.log('\n📊 Current indexes:');
    const indexes = await spvsCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)} (sparse: ${index.sparse || false}, unique: ${index.unique || false})`);
    });

    // Check if project_1 index exists
    const projectIndex = indexes.find(idx => idx.name === 'project_1');
    
    if (projectIndex) {
      console.log('\n🗑️  Dropping old project_1 index...');
      console.log(`   Current index: unique=${projectIndex.unique || false}, sparse=${projectIndex.sparse || false}`);
      await spvsCollection.dropIndex('project_1');
      console.log('✅ Old project_1 index dropped');
      console.log('   (Mongoose will recreate it as sparse unique on next model load)');
    } else {
      console.log('\n⚠️  project_1 index not found (may have been dropped already)');
    }

    console.log('\n📊 Updated indexes:');
    const newIndexes = await spvsCollection.indexes();
    newIndexes.forEach(index => {
      if (index.key.hasOwnProperty('project')) {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)} (sparse: ${index.sparse || false}, unique: ${index.unique || false})`);
      }
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('🚀 Restart your backend server to let Mongoose recreate the index as sparse unique.');
    console.log('   After restart, you can create multiple SPVs without projects.');

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
fixSPVProjectIndex();


