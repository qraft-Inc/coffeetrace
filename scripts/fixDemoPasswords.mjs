import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://dbUser:dbUserPassword@cluster0.2ng5fgc.mongodb.net/coffeetrace?retryWrites=true&w=majority';
const DEMO_PASSWORD = 'Demo123!';

async function fixDemoUsersPasswords() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const demoEmails = [
      'admin@coffeetrace-demo.com',
      'farmer@coffeetrace-demo.com',
      'coop@coffeetrace-demo.com',
      'buyer@coffeetrace-demo.com',
      'investor@coffeetrace-demo.com'
    ];

    console.log('🔍 Checking demo users...\n');

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    for (const email of demoEmails) {
      const user = await usersCollection.findOne({ email });
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      const hasPasswordHash = !!user.passwordHash;
      const hasPassword = !!user.password;

      console.log(`📧 ${email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has passwordHash: ${hasPasswordHash}`);
      console.log(`   Has password: ${hasPassword}`);

      // Update to use correct password
      await usersCollection.updateOne(
        { email },
        {
          $set: { 
            passwordHash: hashedPassword,
            isActive: true,
            isVerified: true
          },
          $unset: { password: '' }
        }
      );

      console.log(`   ✅ Updated with correct password\n`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('📊 DEMO USERS - LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    console.log(`🔐 PASSWORD FOR ALL ACCOUNTS: ${DEMO_PASSWORD}\n`);
    console.log('─────────────────────────────────────────────────────────────────\n');
    console.log('👤 ADMIN:    admin@coffeetrace-demo.com');
    console.log('👤 FARMER:   farmer@coffeetrace-demo.com');
    console.log('👤 COOP:     coop@coffeetrace-demo.com');
    console.log('👤 BUYER:    buyer@coffeetrace-demo.com');
    console.log('👤 INVESTOR: investor@coffeetrace-demo.com');
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('\n🌐 Sign in at: http://localhost:3000/auth/signin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

fixDemoUsersPasswords();
