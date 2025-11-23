import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://dbUser:dbUserPassword@cluster0.2ng5fgc.mongodb.net/coffeetrace?retryWrites=true&w=majority';
const DEMO_PASSWORD = 'Demo123!';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['farmer', 'buyer', 'coopAdmin', 'investor', 'admin'],
    default: 'farmer' 
  },
  phone: String,
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const farmerSchema = new mongoose.Schema({
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
  verificationStatus: { type: String, default: 'verified' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);

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

async function createTeamDemoUsers() {
  try {
    console.log('🌱 Creating team demo users...\n');
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    console.log('🔐 Password hashed successfully\n');

    const createdUsers = [];

    for (const demoUser of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: demoUser.email });
        if (existingUser) {
          console.log(`⚠️  ${demoUser.email} already exists, skipping...`);
          continue;
        }

        let farmer = null;

        // Create farmer profile if needed
        if (demoUser.farmerData) {
          farmer = await Farmer.create({
            ...demoUser.farmerData,
            name: demoUser.name,
          });
          console.log(`  ✓ Created farmer profile: ${farmer.name}`);
        }

        // Create user
        const userData = {
          name: demoUser.name,
          email: demoUser.email,
          passwordHash: hashedPassword,
          role: demoUser.role,
          isActive: true,
          isVerified: true,
        };

        if (farmer) {
          userData.farmerProfile = farmer._id;
        }

        const user = await User.create(userData);

        // Update farmer with userId
        if (farmer) {
          farmer.userId = user._id;
          await farmer.save();
        }

        createdUsers.push(demoUser);
        console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}\n`);

      } catch (error) {
        console.error(`❌ Error creating ${demoUser.email}:`, error.message);
      }
    }

    if (createdUsers.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════════════════');
      console.log('📊 DEMO USERS CREATED - LOGIN CREDENTIALS');
      console.log('═══════════════════════════════════════════════════════════════════\n');
      console.log(`🔐 PASSWORD FOR ALL ACCOUNTS: ${DEMO_PASSWORD}\n`);
      console.log('─────────────────────────────────────────────────────────────────\n');

      for (const user of createdUsers) {
        console.log(`👤 ${user.role.toUpperCase()}`);
        console.log(`   Name:        ${user.name}`);
        console.log(`   Email:       ${user.email}`);
        console.log(`   Password:    ${DEMO_PASSWORD}`);
        console.log(`   Description: ${user.description}`);
        console.log(`   Dashboard:   /dashboard/${user.role === 'coopAdmin' ? 'coop' : user.role}`);
        console.log('');
      }

      console.log('═══════════════════════════════════════════════════════════════════\n');
      console.log('🌐 Sign in at: http://localhost:3000/auth/signin\n');
    } else {
      console.log('\n✅ All demo users already exist in the database!');
      console.log(`🔐 Password for all accounts: ${DEMO_PASSWORD}`);
      console.log('🌐 Sign in at: http://localhost:3000/auth/signin\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createTeamDemoUsers();
