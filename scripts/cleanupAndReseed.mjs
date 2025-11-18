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

async function cleanupAndReseed() {
  try {
    console.log('🧹 Cleaning up old seeded farmers...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all users with @coffeetrace.ug email
    const deletedUsers = await mongoose.connection.collection('users').deleteMany({
      email: { $regex: '@coffeetrace\\.ug$' }
    });
    console.log(`🗑️  Deleted ${deletedUsers.deletedCount} user accounts`);

    // Delete all farmers linked to those users
    const deletedFarmers = await mongoose.connection.collection('farmers').deleteMany({
      email: { $regex: '@coffeetrace\\.ug$' }
    });
    console.log(`🗑️  Deleted ${deletedFarmers.deletedCount} farmer profiles`);

    console.log('\n✅ Cleanup complete! Now run: npm run seed:outgrowers');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanupAndReseed();
