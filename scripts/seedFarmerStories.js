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
    farmSizeUnit: 'acres',
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
    story: "I inherited this coffee farm from my father 15 years ago in the beautiful hills of Fort Portal, Uganda. What started as 2.5 acres of Bourbon and Typica varieties has grown into a thriving organic operation. Every morning, I walk through my 1,200 coffee trees, checking each plant with care. The volcanic soil here is perfect for coffee, and our bimodal rainfall pattern ensures two harvest seasons each year. I'm proud to be certified organic and Fair Trade, showing my commitment to sustainable farming practices. My family has been growing coffee for three generations, and I hope to pass this knowledge and passion to my children. Each cup of coffee from my farm tells the story of our land, our dedication, and the rich heritage of Ugandan coffee.",
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
    farmSize: 3.0,
    farmSizeUnit: 'acres',
    numberOfTrees: 1500,
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
    story: "Growing coffee in Fort Portal has been my life's work for over 20 years. My 3-acre farm is home to 1,500 Catuai and Bourbon trees, all grown under full shade to preserve the natural forest ecosystem. I believe in working with nature, not against it. The clay soil retains moisture well, which is essential during our dry seasons. Being Rainforest Alliance certified means I follow strict environmental and social standards - something I'm deeply proud of. I hand-pick only the ripest cherries, ensuring the highest quality in every batch. My farm produces about 4,200 kg annually, and each bean represents hours of careful attention and love for the craft. Coffee farming isn't just a job for me; it's a way of life that connects me to the land and to coffee lovers around the world.",
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
    farmSize: 1.8,
    farmSizeUnit: 'acres',
    numberOfTrees: 900,
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
    story: "My journey in coffee began 12 years ago when I decided to focus on specialty varieties. My 1.8-acre farm specializes in Gesha - a premium cultivar known for its exceptional cup quality and unique floral notes. Though my farm is smaller, I focus on quality over quantity. At 2,000 meters altitude, the cooler temperatures allow the coffee cherries to develop slowly, creating the complex flavors that specialty roasters seek. I practice integrated pest management and use only organic fertilizers. Each of my 900 trees receives individual attention. I've invested in modern processing equipment to ensure consistent quality, and my dedication has earned me certifications in both organic and Specialty Coffee Association standards. My coffee has won regional cupping competitions, and I'm constantly experimenting with processing methods to bring out the best in my beans. Growing Gesha is a labor of love that requires patience and precision.",
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
    farmSize: 4.2,
    farmSizeUnit: 'acres',
    numberOfTrees: 2100,
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
    story: "Coffee has been in my family for four generations here in Fort Portal. My great-grandfather planted the first trees on this land, and today I manage 4.2 acres with 2,100 Caturra and Catuai trees. I believe in honoring traditional methods while embracing sustainable innovations. Our farm uses a combination of shade-grown techniques and modern drip irrigation to ensure optimal growing conditions year-round. The 1,700-meter altitude gives our coffee a balanced profile that's beloved by roasters worldwide. We're certified UTZ, a commitment that requires constant vigilance but results in healthier soil and better coffee. My wife and I work the farm together, and we've trained our three children in every aspect of coffee cultivation. We produce about 5,800 kg annually, and every kilogram represents our family's dedication to excellence and sustainability. When you drink our coffee, you're tasting generations of knowledge and passion for Ugandan coffee heritage.",
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

      // Update story field for all farmers
      await Farmer.findByIdAndUpdate(farmer._id, {
        $set: { story: storyData.story }
      });
      console.log(`✓ Updated farmer: ${farmer.name || farmer._id}`);
      updated++;
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
