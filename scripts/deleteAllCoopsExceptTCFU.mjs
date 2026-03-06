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

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coffeetrace';

// Define schema
const CooperativeSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Cooperative = mongoose.models.Cooperative || mongoose.model('Cooperative', CooperativeSchema);

async function deleteAllExceptTCFU() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find TCFU cooperative
    const tcfu = await Cooperative.findOne({ name: /Tooro Coffee Farmers Union/i });
    
    if (!tcfu) {
      console.log('⚠️  Warning: Tooro Coffee Farmers Union (TCFU) not found in database');
      console.log('Listing all cooperatives:');
      const allCoops = await Cooperative.find().select('name registrationNumber').lean();
      console.log(allCoops);
    } else {
      console.log(`✅ Found TCFU: ${tcfu.name} (ID: ${tcfu._id})`);
    }

    // Delete all cooperatives except TCFU
    const deleteResult = await Cooperative.deleteMany({
      _id: { $ne: tcfu?._id }
    });

    console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} cooperatives`);

    // Show remaining cooperatives
    const remaining = await Cooperative.find().select('name registrationNumber').lean();
    console.log(`\n📊 Remaining cooperatives (${remaining.length}):`);
    remaining.forEach((coop, idx) => {
      console.log(`  ${idx + 1}. ${coop.name} (${coop.registrationNumber})`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ DB connection closed');
  }
}

deleteAllExceptTCFU();
