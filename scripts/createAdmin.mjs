import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://dbUser:dbUserPassword@cluster0.2ng5fgc.mongodb.net/coffeetrace?retryWrites=true&w=majority';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['farmer', 'buyer', 'coopAdmin', 'investor', 'admin'],
    default: 'farmer' 
  },
  phone: String,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Admin details
    const adminData = {
      name: 'Super Admin',
      email: 'admin@coffeetrace.com',
      password: 'Admin@CoffeeTrace2025', // Strong password
      role: 'admin',
      phone: '+256 700 000000',
      isVerified: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Role: ${existingAdmin.role}`);
      console.log('\n💡 You can sign in with your existing credentials.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = new User({
      ...adminData,
      password: hashedPassword,
    });

    await admin.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('─'.repeat(50));
    console.log(`📧 Email:    ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`👤 Role:     ${adminData.role}`);
    console.log('─'.repeat(50));
    console.log('\n🔐 Please save these credentials securely!');
    console.log('🌐 Sign in at: http://localhost:3000/auth/signin');
    console.log('📊 Dashboard: http://localhost:3000/dashboard/admin\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createAdminUser();
