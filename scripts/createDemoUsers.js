/**
 * Create Demo Users for Platform Testing
 * Creates users with different roles and proper password hashing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Define schemas inline
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['farmer', 'coopAdmin', 'buyer', 'investor', 'admin'], default: 'farmer' },
  farmerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
  emailVerified: Date,
  lastLogin: Date,
}, { timestamps: true });

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
  }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
}, { timestamps: true });

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
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);
const Cooperative = mongoose.models.Cooperative || mongoose.model('Cooperative', CooperativeSchema);

// Demo users configuration
const DEMO_PASSWORD = 'Demo123!'; // Simple password for all demo accounts

const demoUsers = [
  {
    role: 'admin',
    name: 'Admin Demo',
    email: 'admin@coffeetrace-demo.com',
    description: 'Full platform administrator with all permissions',
  },
  {
    role: 'farmer',
    name: 'John Farmer',
    email: 'farmer@coffeetrace-demo.com',
    description: 'Farmer with verified profile, lots, and listings',
    farmerData: {
      phoneNumber: '+256700111222',
      location: { type: 'Point', coordinates: [32.5825, 0.3476] },
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
      ],
      verificationStatus: 'verified',
    },
  },
  {
    role: 'coopAdmin',
    name: 'Cooperative Manager',
    email: 'coop@coffeetrace-demo.com',
    description: 'Cooperative administrator managing multiple farmers',
    coopData: {
      name: 'Kampala Coffee Cooperative',
      registrationNumber: 'KCC-2020-001',
      email: 'info@kampalacoffee.org',
      phoneNumber: '+256700999888',
      location: { type: 'Point', coordinates: [32.5825, 0.3476] },
      address: {
        district: 'Kampala',
        region: 'Central',
        country: 'Uganda',
      },
      memberCount: 150,
      verificationStatus: 'verified',
    },
  },
  {
    role: 'buyer',
    name: 'Coffee Buyer',
    email: 'buyer@coffeetrace-demo.com',
    description: 'International buyer/roaster looking for quality coffee',
  },
  {
    role: 'investor',
    name: 'Investment Manager',
    email: 'investor@coffeetrace-demo.com',
    description: 'Investor tracking portfolio and impact metrics',
  },
];

async function createDemoUsers() {
  try {
    console.log('🌱 Creating demo users for platform testing...\n');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Hash the demo password
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    console.log('🔐 Password hashed successfully\n');

    // Delete existing demo users
    console.log('Clearing existing demo users...');
    const deletedUsers = await User.deleteMany({ 
      email: { $regex: '@coffeetrace-demo.com$' } 
    });
    console.log(`Deleted ${deletedUsers.deletedCount} existing demo users\n`);

    // Create users
    console.log('Creating demo users...\n');
    const createdUsers = [];

    for (const demoUser of demoUsers) {
      let user;
      let farmer = null;
      let cooperative = null;

      // Create cooperative first if needed
      if (demoUser.coopData) {
        cooperative = await Cooperative.create(demoUser.coopData);
        console.log(`  ✓ Created cooperative: ${cooperative.name}`);
      }

      // Create farmer profile if needed
      if (demoUser.farmerData) {
        const farmerData = { 
          ...demoUser.farmerData, 
          name: demoUser.name,
        };
        farmer = await Farmer.create(farmerData);
        console.log(`  ✓ Created farmer profile: ${farmer.name}`);
      }

      // Create user
      const userData = {
        name: demoUser.name,
        email: demoUser.email,
        passwordHash: hashedPassword,
        isActive: true,
        role: demoUser.role,
        emailVerified: new Date(),
      };

      if (farmer) {
        userData.farmerProfile = farmer._id;
      }

      if (cooperative) {
        userData.cooperativeId = cooperative._id;
      }

      user = await User.create(userData);

      // Update farmer with userId
      if (farmer) {
        farmer.userId = user._id;
        await farmer.save();
      }

      createdUsers.push({
        ...demoUser,
        userId: user._id,
        farmerId: farmer?._id,
        cooperativeId: cooperative?._id,
      });

      console.log(`  ✓ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log(`    Description: ${demoUser.description}\n`);
    }

    // Print summary table
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('📊 DEMO USERS CREATED - LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    console.log('🔐 PASSWORD FOR ALL ACCOUNTS: Demo123!\n');
    console.log('─────────────────────────────────────────────────────────────────\n');

    for (const user of createdUsers) {
      console.log(`👤 ${user.role.toUpperCase()}`);
      console.log(`   Name:        ${user.name}`);
      console.log(`   Email:       ${user.email}`);
      console.log(`   Password:    ${DEMO_PASSWORD}`);
      console.log(`   Description: ${user.description}`);
      console.log(`   Dashboard:   /dashboard/${user.role}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════════\n');

    console.log('📝 QUICK START:\n');
    console.log('1. Go to http://localhost:3001/auth/signin');
    console.log('2. Use any email above with password: Demo123!');
    console.log('3. You will be redirected to the appropriate dashboard\n');

    console.log('🎯 DEMO SCENARIOS:\n');
    console.log('• FARMER:    Create lots, list in marketplace, track traceability');
    console.log('• COOP:      Manage farmers, verify quality, coordinate logistics');
    console.log('• BUYER:     Browse marketplace, make offers, view traceability');
    console.log('• INVESTOR:  View analytics, track impact, monitor portfolio');
    console.log('• ADMIN:     Manage all users, approve documents, system overview\n');

    console.log('✅ Demo users created successfully!\n');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
createDemoUsers();
