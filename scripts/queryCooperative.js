const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CooperativeSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Cooperative = mongoose.models.Cooperative || mongoose.model('Cooperative', CooperativeSchema);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coffeetrace';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Try to find by registration number first, then by name
    const byReg = await Cooperative.findOne({ registrationNumber: 'TCFU-2025-001' }).lean();
    const byName = !byReg && await Cooperative.findOne({ name: /Tooro Coffee Farmers Union/i }).lean();

    const doc = byReg || byName;
    if (!doc) {
      console.log('TCFU cooperative not found in database.');
    } else {
      console.log('TCFU cooperative document:');
      console.log(JSON.stringify(doc, null, 2));
    }
  } catch (err) {
    console.error('Error querying cooperative:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('DB connection closed');
  }
}

run();
