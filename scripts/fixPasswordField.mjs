import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://dbUser:dbUserPassword@cluster0.2ng5fgc.mongodb.net/coffeetrace?retryWrites=true&w=majority';

async function fixPasswordFields() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find users with 'password' field instead of 'passwordHash'
    const usersWithPasswordField = await usersCollection.find({ 
      password: { $exists: true } 
    }).toArray();

    console.log(`Found ${usersWithPasswordField.length} users with 'password' field\n`);

    if (usersWithPasswordField.length === 0) {
      // Check all users
      const allUsers = await usersCollection.find({}).toArray();
      console.log(`Total users in database: ${allUsers.length}`);
      
      if (allUsers.length > 0) {
        console.log('\n📋 Existing users:');
        allUsers.forEach(user => {
          console.log(`  - ${user.email} (${user.role}) - Has passwordHash: ${!!user.passwordHash}, Has password: ${!!user.password}`);
        });
      }
    } else {
      // Fix each user
      for (const user of usersWithPasswordField) {
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: { passwordHash: user.password },
            $unset: { password: '' }
          }
        );
        console.log(`✅ Fixed user: ${user.email}`);
      }
      console.log(`\n✅ Fixed ${usersWithPasswordField.length} users!`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

fixPasswordFields();
