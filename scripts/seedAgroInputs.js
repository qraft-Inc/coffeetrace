const mongoose = require('mongoose');

// Define schemas directly since models use ES6 exports
const AgroInputSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'RWF' },
    unit: { type: String, default: 'per unit' },
  },
  stock: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 10 },
  specifications: {
    brand: String,
    variety: String,
    germination: String,
    composition: String,
    weight: String,
    manufacturer: String,
    material: String,
    warranty: String,
    capacity: String,
    volume: String,
    application: String,
    activeIngredient: String,
    tests: String,
    parameters: String,
    area: String,
    engine: String,
    coverage: String,
    power: String,
    flow: String,
  },
  certifications: [String],
  tags: [String],
  creditAvailable: { type: Boolean, default: false },
  creditTerms: {
    downPaymentPercentage: Number,
    installmentMonths: Number,
    interestRate: Number,
  },
  paymentOptions: [String],
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  views: { type: Number, default: 0 },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
}, { timestamps: true });

const CooperativeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
});

const UserSchema = new mongoose.Schema({
  name: String,
  role: String,
});

const AgroInput = mongoose.models.AgroInput || mongoose.model('AgroInput', AgroInputSchema);
const Cooperative = mongoose.models.Cooperative || mongoose.model('Cooperative', CooperativeSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coffeetrace';

const agroInputsData = [
  // Seeds
  {
    name: 'Premium Arabica Coffee Seeds',
    description: 'High-quality Arabica coffee seeds suitable for high-altitude planting. Disease-resistant variety with excellent yield potential.',
    category: 'seeds',
    price: { amount: 38.50, currency: 'USD', unit: 'per kg' },
    stock: 500,
    lowStockThreshold: 50,
    specifications: {
      brand: 'CoffeeGrow',
      variety: 'Bourbon',
      germination: '95%',
    },
    certifications: ['Organic Certified', 'Quality Assured'],
    tags: ['coffee', 'arabica', 'bourbon', 'seeds'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 20,
      installmentMonths: 6,
      interestRate: 5,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit'],
  },
  {
    name: 'Hybrid Robusta Coffee Seeds',
    description: 'Robust and high-yielding Robusta coffee seeds. Perfect for lower altitude farms with excellent disease resistance.',
    category: 'seeds',
    price: { amount: 27.00, currency: 'USD', unit: 'per kg' },
    stock: 750,
    lowStockThreshold: 75,
    specifications: {
      brand: 'FarmSelect',
      variety: 'Robusta Hybrid',
      germination: '92%',
    },
    tags: ['coffee', 'robusta', 'hybrid', 'seeds'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 15,
      installmentMonths: 4,
      interestRate: 4,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit'],
  },

  // Fertilizers
  {
    name: 'Organic Coffee Fertilizer NPK 10-20-10',
    description: 'Complete organic fertilizer specially formulated for coffee plants. Rich in nitrogen, phosphorus, and potassium.',
    category: 'fertilizers',
    price: { amount: 19.25, currency: 'USD', unit: 'per 50kg bag' },
    stock: 1200,
    lowStockThreshold: 100,
    specifications: {
      brand: 'AgroFert',
      composition: 'NPK 10-20-10',
      weight: '50kg',
      manufacturer: 'Rwanda Agro Solutions',
    },
    certifications: ['Organic Certified', 'ECO Friendly'],
    tags: ['fertilizer', 'organic', 'npk', 'coffee'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 25,
      installmentMonths: 3,
      interestRate: 3,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit', 'installment'],
  },
  {
    name: 'Compost Manure Premium Grade',
    description: 'Well-decomposed organic compost manure. Improves soil structure and provides essential nutrients.',
    category: 'fertilizers',
    price: { amount: 11.50, currency: 'USD', unit: 'per 50kg bag' },
    stock: 2000,
    lowStockThreshold: 200,
    specifications: {
      brand: 'EcoGrow',
      composition: 'Organic Compost',
      weight: '50kg',
    },
    certifications: ['Organic Certified'],
    tags: ['compost', 'organic', 'manure'],
    creditAvailable: false,
    paymentOptions: ['cash', 'mobile_money'],
  },
  {
    name: 'Foliar Spray Nutrient Booster',
    description: 'Quick-action foliar spray for rapid nutrient absorption. Contains micronutrients essential for coffee plant health.',
    category: 'fertilizers',
    price: { amount: 9.25, currency: 'USD', unit: 'per 5L' },
    stock: 600,
    lowStockThreshold: 50,
    specifications: {
      brand: 'QuickGrow',
      volume: '5 liters',
      application: 'Foliar spray',
    },
    tags: ['fertilizer', 'foliar', 'micronutrients'],
    creditAvailable: false,
    paymentOptions: ['cash', 'mobile_money'],
  },

  // Pesticides
  {
    name: 'Coffee Berry Borer Control',
    description: 'Effective biological control for coffee berry borer. Safe for organic farming and environmentally friendly.',
    category: 'pesticides',
    price: { amount: 13.85, currency: 'USD', unit: 'per liter' },
    stock: 400,
    lowStockThreshold: 40,
    specifications: {
      brand: 'BioPest',
      activeIngredient: 'Beauveria bassiana',
      volume: '1 liter',
      manufacturer: 'Bio Solutions Ltd',
    },
    certifications: ['Organic Approved', 'Eco Safe'],
    tags: ['pesticide', 'organic', 'coffee borer', 'biological'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 30,
      installmentMonths: 2,
      interestRate: 2,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit'],
  },
  {
    name: 'Fungicide for Coffee Leaf Rust',
    description: 'Systemic fungicide for prevention and control of coffee leaf rust. Long-lasting protection.',
    category: 'pesticides',
    price: { amount: 16.90, currency: 'USD', unit: 'per liter' },
    stock: 300,
    lowStockThreshold: 30,
    specifications: {
      brand: 'CropGuard',
      activeIngredient: 'Copper Hydroxide',
      volume: '1 liter',
    },
    certifications: ['Approved for Use'],
    tags: ['fungicide', 'leaf rust', 'coffee disease'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 25,
      installmentMonths: 3,
      interestRate: 3,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit'],
  },

  // Tools
  {
    name: 'Professional Pruning Shears',
    description: 'Heavy-duty pruning shears for coffee tree maintenance. Ergonomic design with sharp, durable blades.',
    category: 'tools',
    price: { amount: 6.50, currency: 'USD', unit: 'per piece' },
    stock: 250,
    lowStockThreshold: 25,
    specifications: {
      brand: 'FarmTool Pro',
      material: 'Carbon Steel',
      warranty: '1 year',
    },
    tags: ['pruning', 'shears', 'tools', 'maintenance'],
    creditAvailable: false,
    paymentOptions: ['cash', 'mobile_money'],
  },
  {
    name: 'Coffee Harvesting Basket',
    description: 'Traditional woven basket designed for coffee cherry harvesting. Durable and comfortable to carry.',
    category: 'tools',
    price: { amount: 2.70, currency: 'USD', unit: 'per piece' },
    stock: 500,
    lowStockThreshold: 50,
    specifications: {
      brand: 'Local Craft',
      material: 'Woven Bamboo',
      capacity: '10kg',
    },
    tags: ['basket', 'harvesting', 'traditional'],
    creditAvailable: false,
    paymentOptions: ['cash', 'mobile_money'],
  },
  {
    name: 'Soil pH Testing Kit',
    description: 'Complete soil testing kit for pH and nutrient analysis. Essential for optimal coffee growing conditions.',
    category: 'tools',
    price: { amount: 11.50, currency: 'USD', unit: 'per kit' },
    stock: 150,
    lowStockThreshold: 15,
    specifications: {
      brand: 'SoilTest Pro',
      tests: '100 applications',
      parameters: 'pH, N, P, K',
    },
    tags: ['soil test', 'ph', 'analysis'],
    creditAvailable: false,
    paymentOptions: ['cash', 'mobile_money'],
  },

  // Equipment
  {
    name: 'Coffee Pulping Machine - Manual',
    description: 'Manual coffee pulping machine for small to medium farms. Easy to operate and maintain.',
    category: 'equipment',
    price: { amount: 346.00, currency: 'USD', unit: 'per unit' },
    stock: 20,
    lowStockThreshold: 5,
    specifications: {
      brand: 'CoffeeTech',
      capacity: '200kg per hour',
      material: 'Stainless Steel',
      warranty: '2 years',
    },
    certifications: ['Quality Assured'],
    tags: ['pulping', 'machine', 'processing'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 30,
      installmentMonths: 12,
      interestRate: 8,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit', 'installment'],
  },
  {
    name: 'Coffee Drying Rack System',
    description: 'Complete raised drying bed system. UV-resistant mesh for optimal coffee drying.',
    category: 'equipment',
    price: { amount: 654.00, currency: 'USD', unit: 'per 10m²' },
    stock: 15,
    lowStockThreshold: 3,
    specifications: {
      brand: 'DryFast',
      area: '10 square meters',
      material: 'UV-resistant mesh',
      capacity: '500kg wet coffee',
    },
    tags: ['drying', 'rack', 'processing'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 35,
      installmentMonths: 18,
      interestRate: 10,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit', 'installment'],
  },
  {
    name: 'Motorized Coffee Sprayer',
    description: 'Gasoline-powered sprayer for efficient pesticide and fertilizer application. Adjustable nozzle.',
    category: 'equipment',
    price: { amount: 246.00, currency: 'USD', unit: 'per unit' },
    stock: 30,
    lowStockThreshold: 5,
    specifications: {
      brand: 'SprayMaster',
      capacity: '25 liters',
      engine: '2-stroke gasoline',
      warranty: '1 year',
    },
    tags: ['sprayer', 'motorized', 'application'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 25,
      installmentMonths: 9,
      interestRate: 6,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit', 'installment'],
  },

  // Irrigation
  {
    name: 'Drip Irrigation Kit - 1 Hectare',
    description: 'Complete drip irrigation system for 1 hectare. Water-efficient and easy to install.',
    category: 'irrigation',
    price: { amount: 923.00, currency: 'USD', unit: 'per kit' },
    stock: 12,
    lowStockThreshold: 3,
    specifications: {
      brand: 'IrrigPro',
      coverage: '1 hectare',
      material: 'UV-resistant tubing',
      warranty: '3 years',
    },
    certifications: ['Water Efficient'],
    tags: ['irrigation', 'drip', 'water saving'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 40,
      installmentMonths: 24,
      interestRate: 12,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit', 'installment'],
  },
  {
    name: 'Water Storage Tank - 5000L',
    description: 'Food-grade plastic water storage tank. UV-stabilized for outdoor use.',
    category: 'irrigation',
    price: { amount: 500.00, currency: 'USD', unit: 'per tank' },
    stock: 25,
    lowStockThreshold: 5,
    specifications: {
      brand: 'AquaStore',
      capacity: '5000 liters',
      material: 'Food-grade HDPE',
      warranty: '5 years',
    },
    tags: ['water', 'storage', 'tank'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 30,
      installmentMonths: 12,
      interestRate: 7,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit', 'installment'],
  },
  {
    name: 'Solar Water Pump System',
    description: 'Solar-powered water pump for irrigation. Eco-friendly and cost-effective.',
    category: 'irrigation',
    price: { amount: 1923.00, currency: 'USD', unit: 'per system' },
    stock: 8,
    lowStockThreshold: 2,
    specifications: {
      brand: 'SolarPump',
      power: '1.5kW solar panel',
      flow: '3000L per hour',
      warranty: '5 years',
    },
    certifications: ['Solar Certified', 'Energy Efficient'],
    tags: ['solar', 'pump', 'irrigation', 'renewable'],
    creditAvailable: true,
    creditTerms: {
      downPaymentPercentage: 50,
      installmentMonths: 36,
      interestRate: 15,
    },
    paymentOptions: ['cash', 'mobile_money', 'credit', 'installment'],
  },
];

async function seedAgroInputs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all cooperatives
    const cooperatives = await Cooperative.find();
    if (cooperatives.length === 0) {
      console.log('No cooperatives found. Please create cooperatives first.');
      process.exit(1);
    }

    // Get an admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Products will be created without a creator.');
    }

    console.log(`Found ${cooperatives.length} cooperatives`);
    console.log('Clearing existing agro-input products...');
    await AgroInput.deleteMany({});

    console.log('Seeding agro-input products...');
    let productsCreated = 0;

    for (const productData of agroInputsData) {
      // Randomly assign to a cooperative
      const randomCoop = cooperatives[Math.floor(Math.random() * cooperatives.length)];

      const product = new AgroInput({
        ...productData,
        cooperativeId: randomCoop._id,
        createdBy: adminUser?._id,
        status: 'active',
        views: Math.floor(Math.random() * 100),
        approvedBy: adminUser?._id,
        approvedAt: new Date(),
      });

      await product.save();
      productsCreated++;
      console.log(`✓ Created: ${product.name} (${product.category}) - ${randomCoop.name}`);
    }

    console.log(`\n✅ Successfully seeded ${productsCreated} agro-input products!`);
    console.log('Products are distributed across cooperatives and ready for purchase.');

    // Print summary by category
    const summary = await AgroInput.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log('\nCategory Summary:');
    summary.forEach((cat) => {
      console.log(`  ${cat._id}: ${cat.count} products (${cat.totalStock} total stock)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding agro-inputs:', error);
    process.exit(1);
  }
}

seedAgroInputs();
