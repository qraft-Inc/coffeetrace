/**
 * Seed Marketplace with Sample Listings
 * Creates sample farmers, lots, and marketplace listings
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

// Define schemas inline to avoid import issues
const FarmerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phoneNumber: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  address: {
    village: String,
    district: String,
    region: String,
    country: { type: String, default: 'Uganda' },
  },
  farmSize: Number,
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String,
  }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
}, { timestamps: true });

const TraceEventSchema = new mongoose.Schema({
  step: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gps: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  note: String,
});

const LotSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
  traceId: { type: String, unique: true, default: () => uuidv4(), required: true },
  harvestDate: { type: Date, required: true },
  variety: { type: String, required: true },
  quantityKg: { type: Number, required: true, min: 0 },
  moisture: { type: Number, min: 0, max: 100 },
  qualityScore: { type: Number, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['harvested', 'processed', 'stored', 'listed', 'under_offer', 'sold', 'exported', 'delivered'],
    default: 'listed',
  },
  events: [TraceEventSchema],
  qrCodeUrl: String,
}, { timestamps: true });

const ListingSchema = new mongoose.Schema({
  lotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lot', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pricePerKg: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'UGX', 'KES', 'RWF'] },
  minQuantityKg: { type: Number, default: 1, min: 0 },
  availableQuantityKg: { type: Number, required: true, min: 0 },
  description: { type: String, maxlength: 2000 },
  postedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  status: {
    type: String,
    enum: ['open', 'under_offer', 'sold', 'expired', 'cancelled'],
    default: 'open',
  },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  tags: [String],
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ['farmer', 'coopAdmin', 'buyer', 'investor', 'admin'], default: 'farmer' },
  farmerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
}, { timestamps: true });

const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);
const Lot = mongoose.models.Lot || mongoose.model('Lot', LotSchema);
const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Sample data
const sampleFarmers = [
  {
    name: 'John Mukasa',
    phoneNumber: '+256700123456',
    location: {
      type: 'Point',
      coordinates: [32.5825, 0.3476], // Kampala region
    },
    address: {
      village: 'Kasubi',
      district: 'Kampala',
      region: 'Central',
      country: 'Uganda',
    },
    farmSize: 5.2,
    certifications: [
      {
        name: 'Organic',
        issuedBy: 'Uganda Organic Certification',
        issuedDate: new Date('2023-01-15'),
        expiryDate: new Date('2026-01-15'),
      },
      {
        name: 'Fair Trade',
        issuedBy: 'Fair Trade International',
        issuedDate: new Date('2022-06-20'),
        expiryDate: new Date('2025-06-20'),
      },
    ],
    verificationStatus: 'verified',
  },
  {
    name: 'Sarah Namusoke',
    phoneNumber: '+256750987654',
    location: {
      type: 'Point',
      coordinates: [30.0619, -1.9441], // Near Lake Victoria
    },
    address: {
      village: 'Buikwe',
      district: 'Mukono',
      region: 'Central',
      country: 'Uganda',
    },
    farmSize: 8.5,
    certifications: [
      {
        name: 'Rainforest Alliance',
        issuedBy: 'Rainforest Alliance',
        issuedDate: new Date('2023-03-10'),
        expiryDate: new Date('2026-03-10'),
      },
    ],
    verificationStatus: 'verified',
  },
  {
    name: 'Peter Okello',
    phoneNumber: '+256772333444',
    location: {
      type: 'Point',
      coordinates: [34.4514, 1.0004], // Eastern Uganda
    },
    address: {
      village: 'Budadiri',
      district: 'Sironko',
      region: 'Eastern',
      country: 'Uganda',
    },
    farmSize: 12.0,
    certifications: [
      {
        name: 'UTZ Certified',
        issuedBy: 'UTZ',
        issuedDate: new Date('2022-09-05'),
        expiryDate: new Date('2025-09-05'),
      },
    ],
    verificationStatus: 'verified',
  },
  {
    name: 'Grace Atim',
    phoneNumber: '+256704555666',
    location: {
      type: 'Point',
      coordinates: [32.4467, 2.7747], // Northern Uganda
    },
    address: {
      village: 'Pece',
      district: 'Gulu',
      region: 'Northern',
      country: 'Uganda',
    },
    farmSize: 6.8,
    certifications: [
      {
        name: 'Organic',
        issuedBy: 'Uganda Organic Certification',
        issuedDate: new Date('2023-05-20'),
        expiryDate: new Date('2026-05-20'),
      },
    ],
    verificationStatus: 'verified',
  },
  {
    name: 'Robert Byaruhanga',
    phoneNumber: '+256788777888',
    location: {
      type: 'Point',
      coordinates: [30.2581, -0.9275], // Southwestern Uganda
    },
    address: {
      village: 'Rwenshama',
      district: 'Kasese',
      region: 'Western',
      country: 'Uganda',
    },
    farmSize: 15.3,
    certifications: [],
    verificationStatus: 'verified',
  },
];

const createLotData = (farmerId, farmerLocation, variety, index) => {
  const varieties = {
    'Arabica': { price: 4.5, quality: 85 + Math.random() * 10 },
    'Robusta': { price: 2.8, quality: 75 + Math.random() * 10 },
    'SL28': { price: 6.2, quality: 88 + Math.random() * 8 },
    'Geisha': { price: 12.5, quality: 92 + Math.random() * 6 },
  };

  const varietyData = varieties[variety] || varieties['Arabica'];
  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() - Math.floor(Math.random() * 60)); // 0-60 days ago

  return {
    farmerId,
    traceId: uuidv4(),
    harvestDate,
    variety,
    quantityKg: 500 + Math.floor(Math.random() * 2000), // 500-2500kg
    moisture: 10.5 + Math.random() * 2, // 10.5-12.5%
    qualityScore: varietyData.quality,
    status: 'listed',
    events: [
      {
        step: 'harvested',
        timestamp: harvestDate,
        gps: farmerLocation,
        note: `Fresh ${variety} harvest from certified farm`,
      },
      {
        step: 'processed',
        timestamp: new Date(harvestDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        gps: farmerLocation,
        note: 'Washed and fermented following best practices',
      },
      {
        step: 'dried',
        timestamp: new Date(harvestDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        gps: farmerLocation,
        note: 'Sun-dried to optimal moisture level',
      },
      {
        step: 'graded',
        timestamp: new Date(harvestDate.getTime() + 12 * 24 * 60 * 60 * 1000),
        gps: farmerLocation,
        note: `Quality assessment completed - Grade: ${varietyData.quality > 88 ? 'AA' : varietyData.quality > 82 ? 'A' : 'B'}`,
      },
    ],
  };
};

async function seedMarketplace() {
  try {
    console.log('🌱 Starting marketplace seeding...\n');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing marketplace data...');
    await Listing.deleteMany({});
    await Lot.deleteMany({});
    await Farmer.deleteMany({});
    const deletedUsers = await User.deleteMany({ email: { $regex: '@marketplace-demo.com$' } });
    console.log(`Deleted ${deletedUsers.deletedCount} demo users\n`);

    // Create users for each farmer
    console.log('Creating demo users...');
    const users = [];
    for (let i = 0; i < sampleFarmers.length; i++) {
      const user = await User.create({
        name: sampleFarmers[i].name,
        email: `farmer${i + 1}@marketplace-demo.com`,
        password: '$2a$10$YourHashedPasswordHere', // In production, use proper password hashing
        role: 'farmer',
      });
      users.push(user);
      console.log(`  ✓ Created user: ${user.name} (${user.email})`);
    }
    console.log(`\n✅ Created ${users.length} users\n`);

    // Create farmers
    console.log('Creating farmers...');
    const farmers = [];
    for (let i = 0; i < sampleFarmers.length; i++) {
      const farmerData = { ...sampleFarmers[i], userId: users[i]._id };
      const farmer = await Farmer.create(farmerData);
      farmers.push(farmer);
      
      // Update user with farmer profile reference
      users[i].farmerProfile = farmer._id;
      await users[i].save();
      
      console.log(`  ✓ ${farmer.name} - ${farmer.address.district}, ${farmer.farmSize}ha`);
    }
    console.log(`\n✅ Created ${farmers.length} farmers\n`);

    // Create lots and listings
    console.log('Creating lots and marketplace listings...');
    const varieties = ['Arabica', 'Robusta', 'SL28', 'Geisha'];
    const listings = [];
    let lotCount = 0;

    for (const farmer of farmers) {
      // Create 2-3 lots per farmer
      const numLots = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numLots; i++) {
        const variety = varieties[Math.floor(Math.random() * varieties.length)];
        const lotData = createLotData(farmer._id, farmer.location, variety, lotCount);
        const lot = await Lot.create(lotData);
        lotCount++;

        // Create listing for this lot
        const priceMultiplier = {
          'Arabica': 4.5,
          'Robusta': 2.8,
          'SL28': 6.2,
          'Geisha': 12.5,
        };

        const basePrice = priceMultiplier[variety];
        const qualityBonus = (lot.qualityScore - 80) * 0.05; // 5 cents per quality point above 80
        const pricePerKg = basePrice + qualityBonus;

        const listing = await Listing.create({
          lotId: lot._id,
          sellerId: farmer.userId,
          pricePerKg: parseFloat(pricePerKg.toFixed(2)),
          currency: 'USD',
          minQuantityKg: 50,
          availableQuantityKg: lot.quantityKg,
          description: `Premium ${variety} coffee from ${farmer.address.district} district. ${lot.qualityScore > 88 ? 'Exceptional quality with cupping score above 88.' : 'High quality, carefully processed.'} ${farmer.certifications.length > 0 ? `Certified: ${farmer.certifications.map(c => c.name).join(', ')}.` : ''} Traceable from farm to export.`,
          status: 'open',
          isFeatured: lot.qualityScore > 88,
          tags: [variety, farmer.address.region, lot.qualityScore > 88 ? 'premium' : 'standard'],
        });

        listings.push(listing);

        console.log(`  ✓ ${farmer.name} - ${variety} ${lot.quantityKg}kg @ $${pricePerKg.toFixed(2)}/kg (Quality: ${lot.qualityScore.toFixed(1)})`);
      }
    }

    console.log(`\n✅ Created ${lotCount} lots and ${listings.length} listings\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 MARKETPLACE SEEDING SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Users:        ${users.length}`);
    console.log(`Farmers:      ${farmers.length}`);
    console.log(`Lots:         ${lotCount}`);
    console.log(`Listings:     ${listings.length} (${listings.filter(l => l.isFeatured).length} featured)`);
    console.log('═══════════════════════════════════════\n');

    console.log('📦 Listings by variety:');
    const varietyCounts = {};
    for (const listing of listings) {
      const lot = await Lot.findById(listing.lotId);
      varietyCounts[lot.variety] = (varietyCounts[lot.variety] || 0) + 1;
    }
    Object.entries(varietyCounts).forEach(([variety, count]) => {
      console.log(`  ${variety}: ${count} listings`);
    });

    console.log('\n✅ Marketplace seeding completed successfully!');
    console.log('\n🌐 Visit http://localhost:3001/marketplace to see your listings\n');

  } catch (error) {
    console.error('❌ Error seeding marketplace:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the seeder
seedMarketplace();
