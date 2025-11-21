import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvFile() {
  try {
    const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.error('Error loading .env.local:', error.message);
  }
}

loadEnvFile();

async function cleanupOrphanedUsers() {
  try {
    console.log('🧹 Cleaning up orphaned users...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find users with buyer role but no buyerProfile
    const orphanedBuyers = await mongoose.connection.collection('users').find({
      role: 'buyer',
      buyerProfile: { $exists: false }
    }).toArray();

    // Find users with farmer role but no farmerProfile
    const orphanedFarmers = await mongoose.connection.collection('users').find({
      role: 'farmer',
      farmerProfile: { $exists: false }
    }).toArray();

    const totalOrphaned = orphanedBuyers.length + orphanedFarmers.length;

    if (totalOrphaned === 0) {
      console.log('✅ No orphaned users found!');
    } else {
      console.log(`Found ${orphanedBuyers.length} orphaned buyers`);
      console.log(`Found ${orphanedFarmers.length} orphaned farmers`);

      // Delete orphaned buyers
      if (orphanedBuyers.length > 0) {
        const buyerIds = orphanedBuyers.map(u => u._id);
        await mongoose.connection.collection('users').deleteMany({
          _id: { $in: buyerIds }
        });
        console.log(`🗑️  Deleted ${orphanedBuyers.length} orphaned buyer accounts:`);
        orphanedBuyers.forEach(u => console.log(`   - ${u.email}`));
      }

      // Delete orphaned farmers
      if (orphanedFarmers.length > 0) {
        const farmerIds = orphanedFarmers.map(u => u._id);
        await mongoose.connection.collection('users').deleteMany({
          _id: { $in: farmerIds }
        });
        console.log(`🗑️  Deleted ${orphanedFarmers.length} orphaned farmer accounts:`);
        orphanedFarmers.forEach(u => console.log(`   - ${u.email}`));
      }

      console.log('\n✅ Cleanup complete! You can now sign up again.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanupOrphanedUsers();
