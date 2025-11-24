require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const FarmerSchema = new mongoose.Schema({}, { strict: false });
const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);

const placeholderStories = [
  {
    profilePhotoUrl: 'https://images.unsplash.com/photo-1595475884562-073c30d45670',
    location: {
      type: 'Point',
      coordinates: [30.2745, 0.6710], // Fort Portal, Uganda
      district: 'Fort Portal',
      region: 'Western Region',
      country: 'Uganda'
    },
    farmBoundary: {
      type: 'Polygon',
      coordinates: [[
        [30.2745, 0.6710],
        [30.2755, 0.6710],
        [30.2755, 0.6700],
        [30.2745, 0.6700],
        [30.2745, 0.6710]
      ]]
    },
    farmSize: 2.5,
    farmSizeUnit: 'hectares',
    numberOfTrees: 1200,
    altitude: 1800,
    primaryVariety: 'Bourbon',
    varieties: [
      { name: 'Bourbon', percentage: 70 },
      { name: 'Typica', percentage: 30 }
    ],
    plantingDensity: 2500,
    shade: 'partial',
    soilType: 'volcanic',
    climateZone: 'tropical_highland',
    rainfall: {
      annual: 1500,
      pattern: 'bimodal'
    },
    certifications: [
      { name: 'Organic Certified', issuedBy: 'USDA Organic', issuedDate: new Date('2022-01-15'), expiryDate: new Date('2025-01-15') },
      { name: 'Fair Trade', issuedBy: 'Fair Trade USA', issuedDate: new Date('2021-06-01'), expiryDate: new Date('2024-06-01') }
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e', caption: 'Coffee cherries ready for harvest' },
      { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e', caption: 'Our processing facility' },
      { url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31', caption: 'Drying coffee beans in the sun' }
    ],
    totalYieldKg: 3500
  },
  {
    profilePhotoUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e',
    location: {
      type: 'Point',
      coordinates: [30.2800, 0.6650],
      district: 'Fort Portal',
      region: 'Western Region',
      country: 'Uganda'
    },
    farmBoundary: {
      type: 'Polygon',
      coordinates: [[
        [30.2800, 0.6650],
        [30.2813, 0.6650],
        [30.2813, 0.6637],
        [30.2800, 0.6637],
        [30.2800, 0.6650]
      ]]
    },
    farmSize: 3.8,
    farmSizeUnit: 'hectares',
    numberOfTrees: 1800,
    altitude: 1650,
    primaryVariety: 'Catuai',
    varieties: [
      { name: 'Catuai', percentage: 60 },
      { name: 'Bourbon', percentage: 40 }
    ],
    plantingDensity: 2200,
    shade: 'full',
    soilType: 'clay',
    climateZone: 'tropical',
    rainfall: {
      annual: 1800,
      pattern: 'seasonal'
    },
    certifications: [
      { name: 'Rainforest Alliance', issuedBy: 'RA-Cert', issuedDate: new Date('2021-09-10'), expiryDate: new Date('2024-09-10') }
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', caption: 'Morning on the farm' },
      { url: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb', caption: 'Hand-picking ripe cherries' }
    ],
    totalYieldKg: 4200
  },
  {
    profilePhotoUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb',
    location: {
      type: 'Point',
      coordinates: [30.2690, 0.6780],
      district: 'Fort Portal',
      region: 'Western Region',
      country: 'Uganda'
    },
    farmBoundary: {
      type: 'Polygon',
      coordinates: [[
        [30.2690, 0.6780],
        [30.2698, 0.6780],
        [30.2698, 0.6772],
        [30.2690, 0.6772],
        [30.2690, 0.6780]
      ]]
    },
    farmSize: 1.5,
    farmSizeUnit: 'hectares',
    numberOfTrees: 800,
    altitude: 2000,
    primaryVariety: 'Gesha',
    varieties: [
      { name: 'Gesha', percentage: 80 },
      { name: 'Typica', percentage: 20 }
    ],
    plantingDensity: 2000,
    shade: 'partial',
    soilType: 'volcanic',
    climateZone: 'tropical_highland',
    rainfall: {
      annual: 1400,
      pattern: 'bimodal'
    },
    certifications: [
      { name: 'Organic Certified', issuedBy: 'USDA Organic', issuedDate: new Date('2023-03-20'), expiryDate: new Date('2026-03-20') },
      { name: 'Specialty Coffee', issuedBy: 'SCA', issuedDate: new Date('2023-01-15'), expiryDate: new Date('2026-01-15') }
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd', caption: 'High altitude coffee plants' },
      { url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf', caption: 'Sorting and selecting the best beans' },
      { url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31', caption: 'Sun-drying process' }
    ],
    totalYieldKg: 2800
  },
  {
    profilePhotoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
    location: {
      type: 'Point',
      coordinates: [30.2850, 0.6820],
      district: 'Fort Portal',
      region: 'Western Region',
      country: 'Uganda'
    },
    farmBoundary: {
      type: 'Polygon',
      coordinates: [[
        [30.2850, 0.6820],
        [30.2869, 0.6820],
        [30.2869, 0.6802],
        [30.2850, 0.6802],
        [30.2850, 0.6820]
      ]]
    },
    farmSize: 5.2,
    farmSizeUnit: 'hectares',
    numberOfTrees: 2400,
    altitude: 1700,
    primaryVariety: 'Caturra',
    varieties: [
      { name: 'Caturra', percentage: 50 },
      { name: 'Catuai', percentage: 30 },
      { name: 'Bourbon', percentage: 20 }
    ],
    plantingDensity: 2400,
    shade: 'minimal',
    soilType: 'loam',
    climateZone: 'tropical',
    rainfall: {
      annual: 1600,
      pattern: 'seasonal'
    },
    certifications: [
      { name: 'UTZ Certified', issuedBy: 'UTZ', issuedDate: new Date('2022-05-01'), expiryDate: new Date('2025-05-01') }
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e', caption: 'Fresh coffee cherries' },
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', caption: 'Our family farm' }
    ],
    totalYieldKg: 5800
  }
];

async function seedFarmerStories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get all farmers
    const farmers = await Farmer.find({}).limit(10);
    console.log(`Found ${farmers.length} farmers`);

    if (farmers.length === 0) {
      console.log('No farmers found to seed');
      return;
    }

    let updated = 0;

    for (let i = 0; i < farmers.length; i++) {
      const farmer = farmers[i];
      const storyData = placeholderStories[i % placeholderStories.length];

      // Only update if farmer doesn't already have location/polygon data
      const needsUpdate = !farmer.location || !farmer.farmBoundary;

      if (needsUpdate) {
        await Farmer.findByIdAndUpdate(farmer._id, {
          $set: storyData
        });
        console.log(`✓ Updated farmer: ${farmer.name || farmer._id}`);
        updated++;
      } else {
        console.log(`- Skipped farmer: ${farmer.name || farmer._id} (already has data)`);
      }
    }

    console.log(`\n✓ Successfully updated ${updated} farmers with story data`);
    
  } catch (error) {
    console.error('Error seeding farmer stories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

seedFarmerStories();
