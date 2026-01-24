const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CooperativeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: String,
  email: String,
  phoneNumber: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  address: {
    district: String,
    region: String,
    country: { type: String, default: 'Uganda' },
  },
  memberCount: { type: Number, default: 0 },
  verificationStatus: String,
}, { timestamps: true });

const Cooperative = mongoose.models.Cooperative || mongoose.model('Cooperative', CooperativeSchema);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coffeetrace';

const cooperatives = [
  {
    name: 'Tooro Coffee Farmers Union (TCFU)',
    registrationNumber: 'TCFU-2025-001',
    email: 'info@tcfu.org',
    phoneNumber: '+256772000111',
    location: { type: 'Point', coordinates: [30.6771, 0.6934] },
    address: { district: 'Kabarole', region: 'Western', country: 'Uganda' },
    memberCount: 420,
    verificationStatus: 'verified',
  },
  {
    name: 'Kampala Coffee Cooperative',
    registrationNumber: 'KCC-2020-001',
    email: 'info@kampalacoffee.org',
    phoneNumber: '+256700999888',
    location: { type: 'Point', coordinates: [32.5825, 0.3476] },
    address: { district: 'Kampala', region: 'Central', country: 'Uganda' },
    memberCount: 150,
    verificationStatus: 'verified',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Seeding cooperatives (upsert by registrationNumber)...');

    for (const coop of cooperatives) {
      const filter = coop.registrationNumber ? { registrationNumber: coop.registrationNumber } : { name: coop.name };
      const updated = await Cooperative.findOneAndUpdate(
        filter,
        { $set: coop },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  ✓ Upserted cooperative: ${updated.name} (id: ${updated._id})`);
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('DB connection closed.');
  }
}

seed();
