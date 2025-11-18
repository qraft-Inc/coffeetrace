/**
 * Seed script to add Coffee Trace OutGrowers to the database
 * Run with: node scripts/seedOutgrowers.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envFile = readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.error('⚠️  Could not load .env.local, using existing environment variables');
  }
}

loadEnvFile();

// Import models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'coopAdmin', 'buyer', 'investor', 'admin'], default: 'farmer' },
  phone: String,
  farmerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
}, { timestamps: true });

const FarmerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  farmSize: { type: Number, required: true },
  altitude: Number,
  primaryVariety: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined },
    country: { type: String, default: 'Uganda' },
    region: { type: String, default: 'Western' },
    district: String,
  },
  certifications: [String],
  profilePhoto: String,
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
  totalLots: { type: Number, default: 0 },
  totalYieldKg: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);

// Coffee Trace OutGrowers data
const outgrowers = [
  { name: 'Kisembo David', acres: 28 },
  { name: 'Kenema Stella', acres: 30 },
  { name: 'Kiiza Oliva', acres: 2 },
  { name: 'Machati', acres: 1 },
  { name: 'Mwesige John', acres: 3 },
  { name: 'Twinobusingye Bosco', acres: 2.5 },
  { name: 'Habasa Abel', acres: 4 },
  { name: 'Kadehere', acres: 1 },
  { name: 'Nyakaisiki Mable', acres: 1 },
  { name: 'Tusingwire Mackline', acres: 0.5 },
  { name: 'Tumukugize Maureen', acres: 1.4 },
  { name: 'Atuhaire Provia', acres: 0.7 },
  { name: 'Asiimwe Grace', acres: 0.3 },
  { name: 'Tumuramwe Sylvia', acres: 1.2 },
  { name: 'Kyomugisha Angela', acres: 1 },
  { name: 'Tumukunde Vanansio', acres: 1 },
  { name: 'Nyinganira Joseph', acres: 1 },
  { name: 'Tulinawe Deus', acres: 1 },
  { name: 'Muramuzi Bruno', acres: 1.2 },
  { name: 'Asiimwe Combine', acres: 3.6 },
  { name: 'Anyijuka Grace', acres: 1 },
  { name: 'Kamara Edward', acres: 0.5 },
  { name: 'Kansiime Grace', acres: 1 },
  { name: 'Twesiime Grace', acres: 1 },
  { name: 'Kemigisha Scovia', acres: 0.7 },
  { name: 'Akankwatsa Ritiam', acres: 1 },
  { name: 'Tumwebaze Annet', acres: 1 },
  { name: 'Tibifumura Angelina', acres: 1 },
  { name: 'Twikirize Phiona', acres: 1.3 },
  { name: 'Kobusinge Margaret', acres: 1 },
  { name: 'Tulyahebwa Angela', acres: 2 },
  { name: 'Musimenta Rovina', acres: 1 },
  { name: 'Orikiriza Phiromina', acres: 0.7 },
  { name: 'Twehikire Justus', acres: 2 },
  { name: 'Musimenta Kate', acres: 2 },
  { name: 'Ahebwa Catherine', acres: 1 },
  { name: 'Abyampa Dorovico', acres: 1 },
  { name: 'Nyakaisiki Sheba', acres: 20 },
  { name: 'Rajabu Amooti', acres: 2 },
  { name: 'Twesigye Fred', acres: 1 },
  { name: 'Kemigisa Betty', acres: 15 },
  { name: 'Kalege Israel', acres: 25 },
  { name: 'Agaba Christopher', acres: 6 },
  { name: 'Tumukugize William', acres: 3 },
  { name: 'Agaba Andrew', acres: 17 },
  { name: 'Mugisha Posiano', acres: 7 },
  { name: 'Kanyebire Posiano', acres: 2 },
  { name: 'Ngiramahoro Gerald', acres: 5 },
  { name: 'Akandwanaho Emmanuel', acres: 18 },
  { name: 'Nkuranga Amooti', acres: 5 },
  { name: 'Mujjungu Frank', acres: 8 },
  { name: 'Mrs Rwamwenge', acres: 10 },
];

// Helper function to generate email from name
function generateEmail(name) {
  return name.toLowerCase().replace(/\s+/g, '.') + '@coffeetrace.ug';
}

// Helper function to convert acres to hectares
function acresToHectares(acres) {
  return (acres * 0.404686).toFixed(2);
}

async function seedOutgrowers() {
  try {
    console.log('🌱 Starting Coffee Trace OutGrowers seed...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let successCount = 0;
    let errorCount = 0;

    // Default password for all farmers
    const defaultPassword = 'CoffeeTrace2025';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    for (const grower of outgrowers) {
      try {
        const email = generateEmail(grower.name);
        const farmSizeHectares = parseFloat(acresToHectares(grower.acres));

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          console.log(`⚠️  ${grower.name} already exists, skipping...`);
          continue;
        }

        // Create user account
        const user = await User.create({
          name: grower.name,
          email,
          passwordHash,
          role: 'farmer',
          phone: '+256700000000', // Placeholder
          isActive: true,
        });

        // Create farmer profile
        const farmer = await Farmer.create({
          userId: user._id,
          name: grower.name,
          farmSize: farmSizeHectares,
          altitude: 1500, // Default altitude for Western Uganda
          primaryVariety: 'Arabica',
          location: {
            type: 'Point',
            coordinates: [30.0, 0.0], // Kasese, Uganda approximate coordinates
            country: 'Uganda',
            region: 'Western',
            district: 'Kasese',
          },
          certifications: ['Organic'],
          isVerified: true,
          totalLots: 0,
          totalYieldKg: 0,
        });

        // Link farmer profile to user
        user.farmerProfile = farmer._id;
        await user.save();

        console.log(`✅ Added: ${grower.name} (${grower.acres} acres / ${farmSizeHectares} ha)`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error adding ${grower.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Successfully added: ${successCount} farmers`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`\n🔐 Default password for all farmers: ${defaultPassword}`);
    console.log('📧 Email format: firstname.lastname@coffeetrace.ug');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed function
seedOutgrowers();
