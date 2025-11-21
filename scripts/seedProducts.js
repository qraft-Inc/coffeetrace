/**
 * Product Seeding Script
 * Seeds the marketplace with coffee products, agro inputs, and other agricultural products
 * 
 * Run with: node scripts/seedProducts.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Product Schema inline (to avoid import issues)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, required: true },
  category: {
    type: String,
    enum: [
      'coffee_green',
      'coffee_roasted',
      'coffee_specialty',
      'coffee_cascara',
      'coffee_other',
      'tea',
      'bananas',
      'vanilla',
      'livestock',
      'seeds',
      'seedlings',
      'fertilizers',
      'pesticides',
      'tools',
      'equipment',
      'irrigation',
      'packaging',
      'other',
    ],
    required: true,
  },
  subcategory: String,
  description: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supplierName: { type: String, required: true },
  images: [{ url: String, alt: String }],
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'UGX' },
  unit: { type: String, required: true },
  stockQuantity: { type: Number, default: 0, min: 0 },
  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: Number,
  isOrganic: { type: Boolean, default: false },
  isCertified: { type: Boolean, default: false },
  certifications: [{ name: String, certificateUrl: String }],
  specifications: { type: Map, of: String },
  usageInstructions: String,
  ratings: {
    average: { type: Number, default: 4.5, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  totalSales: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  bulkDiscounts: [{ minQuantity: Number, discountPercentage: Number }],
  supplierVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const products = [
  // ===== COFFEE PRODUCTS =====
  {
    name: 'Arabica Green Coffee Beans - Premium Grade AA',
    slug: 'arabica-green-coffee-aa',
    category: 'coffee_green',
    subcategory: 'Arabica',
    description: 'Premium Grade AA Arabica green coffee beans from the highlands of Mount Elgon. Altitude: 1,600-1,800m. Ideal for specialty roasters seeking exceptional cup quality with notes of citrus, chocolate, and floral undertones.',
    supplierName: 'Coffee Trap Agencies',
    images: [
      { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800', alt: 'Green Coffee Beans' }
    ],
    price: 12000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 5000,
    minOrderQuantity: 50,
    isOrganic: true,
    isCertified: true,
    certifications: [
      { name: 'Organic Certification' },
      { name: 'Fair Trade' },
      { name: 'Rainforest Alliance' }
    ],
    specifications: new Map([
      ['Grade', 'AA'],
      ['Screen Size', '17-18'],
      ['Moisture', '10-12%'],
      ['Processing', 'Washed'],
      ['Harvest Season', '2024/2025'],
      ['Cupping Score', '85+']
    ]),
    ratings: { average: 4.8, count: 124 },
    totalSales: 2500,
    isFeatured: true,
    bulkDiscounts: [
      { minQuantity: 500, discountPercentage: 5 },
      { minQuantity: 1000, discountPercentage: 10 }
    ],
    supplierVerified: true,
  },
  {
    name: 'Robusta Green Coffee Beans - Grade A',
    slug: 'robusta-green-coffee-a',
    category: 'coffee_green',
    subcategory: 'Robusta',
    description: 'High-quality Grade A Robusta green coffee from Kasese district. Perfect for espresso blends with strong body, earthy notes, and excellent crema production. Low acidity, high caffeine content.',
    supplierName: 'Coffee Trap Agencies',
    images: [
      { url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800', alt: 'Robusta Coffee Beans' }
    ],
    price: 8500,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 8000,
    minOrderQuantity: 50,
    isCertified: true,
    certifications: [{ name: 'UTZ Certified' }],
    specifications: new Map([
      ['Grade', 'A'],
      ['Screen Size', '15-16'],
      ['Moisture', '11-13%'],
      ['Processing', 'Natural'],
      ['Defects', '<5 per 300g']
    ]),
    ratings: { average: 4.5, count: 89 },
    totalSales: 4200,
    isFeatured: true,
    bulkDiscounts: [
      { minQuantity: 1000, discountPercentage: 8 },
      { minQuantity: 2000, discountPercentage: 12 }
    ],
    supplierVerified: true,
  },
  {
    name: 'Roasted Coffee Beans - Medium Roast',
    slug: 'roasted-coffee-medium',
    category: 'coffee_roasted',
    subcategory: 'Medium Roast',
    description: 'Freshly roasted 100% Arabica coffee beans with a balanced medium roast. Roasted within 48 hours of order. Perfect for filter coffee, French press, or pour-over. Notes of caramel, nuts, and mild chocolate.',
    supplierName: 'Kampala Coffee Roasters',
    images: [
      { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800', alt: 'Roasted Coffee Beans' }
    ],
    price: 18000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 500,
    minOrderQuantity: 5,
    maxOrderQuantity: 100,
    isOrganic: true,
    isCertified: true,
    certifications: [{ name: 'Organic' }, { name: 'Fair Trade' }],
    specifications: new Map([
      ['Roast Level', 'Medium (City+)'],
      ['Origin', 'Mount Elgon, Uganda'],
      ['Roast Date', 'Made to Order'],
      ['Bean Type', '100% Arabica'],
      ['Recommended Brew', 'Filter, French Press']
    ]),
    usageInstructions: 'Grind fresh before brewing. Use 15-18g per 250ml water. Best consumed within 4 weeks of roasting.',
    ratings: { average: 4.9, count: 156 },
    totalSales: 850,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Roasted Coffee Beans - Dark Roast Espresso',
    slug: 'roasted-coffee-dark-espresso',
    category: 'coffee_roasted',
    subcategory: 'Dark Roast',
    description: 'Bold dark roast espresso blend combining Arabica and Robusta. Rich, full-bodied with notes of dark chocolate, caramel, and slight smokiness. Excellent crema. Perfect for espresso machines and stovetop moka pots.',
    supplierName: 'Kampala Coffee Roasters',
    images: [
      { url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800', alt: 'Dark Roast Coffee' }
    ],
    price: 19500,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 400,
    minOrderQuantity: 5,
    specifications: new Map([
      ['Roast Level', 'Dark (Full City+)'],
      ['Blend', '70% Arabica, 30% Robusta'],
      ['Origin', 'Uganda - Multi-origin'],
      ['Best For', 'Espresso, Moka Pot']
    ]),
    ratings: { average: 4.7, count: 98 },
    totalSales: 620,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Specialty Micro-lot - SL28 Honey Processed',
    slug: 'specialty-microlot-sl28-honey',
    category: 'coffee_specialty',
    subcategory: 'Micro-lot',
    description: 'Exceptional micro-lot from a single estate in Sipi Falls. SL28 varietal, honey processed. Limited production of only 300kg. Cupping score: 88.5. Tasting notes: Jasmine, peach, bergamot, honey sweetness, silky body.',
    supplierName: 'Sipi Falls Estate',
    images: [
      { url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800', alt: 'Specialty Coffee' }
    ],
    price: 35000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 150,
    minOrderQuantity: 10,
    maxOrderQuantity: 50,
    isOrganic: true,
    isCertified: true,
    certifications: [
      { name: 'Organic' },
      { name: 'Specialty Coffee Association' }
    ],
    specifications: new Map([
      ['Cupping Score', '88.5'],
      ['Varietal', 'SL28'],
      ['Processing', 'Honey (Yellow)'],
      ['Altitude', '1,800m'],
      ['Harvest', 'Single Estate'],
      ['Lot Size', '300kg']
    ]),
    ratings: { average: 5.0, count: 23 },
    totalSales: 120,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Specialty Micro-lot - Geisha Natural',
    slug: 'specialty-microlot-geisha-natural',
    category: 'coffee_specialty',
    subcategory: 'Micro-lot',
    description: 'Rare Geisha varietal, natural processed. One of Uganda\'s finest coffees. Cupping score: 90+. Explosive aromatics with notes of tropical fruit, passion fruit, mango, floral jasmine, wine-like acidity. Extremely limited quantity.',
    supplierName: 'Mount Elgon Estates',
    images: [
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', alt: 'Geisha Coffee' }
    ],
    price: 65000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 50,
    minOrderQuantity: 5,
    maxOrderQuantity: 20,
    isOrganic: true,
    isCertified: true,
    certifications: [{ name: 'Organic' }, { name: 'SCA Certified' }],
    specifications: new Map([
      ['Cupping Score', '90.5'],
      ['Varietal', 'Geisha'],
      ['Processing', 'Natural (Anaerobic)'],
      ['Altitude', '1,900m'],
      ['Lot Size', '80kg']
    ]),
    ratings: { average: 5.0, count: 8 },
    totalSales: 25,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Coffee Cascara (Dried Coffee Cherry Tea)',
    slug: 'coffee-cascara-tea',
    category: 'coffee_cascara',
    subcategory: 'Cascara',
    description: 'Dried coffee cherry husks from washed Arabica coffee processing. Makes a unique, sweet tea with notes of hibiscus, rose hip, cherry, and honey. Rich in antioxidants. Sustainable use of coffee by-product.',
    supplierName: 'Coffee Trap Agencies',
    images: [
      { url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', alt: 'Coffee Cascara' }
    ],
    price: 15000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 200,
    minOrderQuantity: 5,
    isOrganic: true,
    specifications: new Map([
      ['Origin', 'Uganda Arabica Cherry'],
      ['Processing', 'Sun-dried'],
      ['Moisture', '<12%'],
      ['Caffeine', 'Low (1/4 of coffee)']
    ]),
    usageInstructions: 'Steep 15-20g per liter of water at 90°C for 4-5 minutes. Can be served hot or cold. Great as iced tea with honey and lemon.',
    ratings: { average: 4.6, count: 42 },
    totalSales: 180,
    isFeatured: false,
    supplierVerified: true,
  },
  {
    name: 'Coffee Wood & Sawdust (Composting Material)',
    slug: 'coffee-wood-sawdust',
    category: 'coffee_other',
    subcategory: 'By-products',
    description: 'Dried coffee wood chips and sawdust from pruned coffee trees. Excellent for composting, mulching, or as substrate for mushroom cultivation. Rich in nutrients, pest-resistant.',
    supplierName: 'Eco-Farm Supplies',
    images: [
      { url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', alt: 'Coffee Wood' }
    ],
    price: 3000,
    currency: 'UGX',
    unit: 'bag (50kg)',
    stockQuantity: 500,
    minOrderQuantity: 10,
    isOrganic: true,
    specifications: new Map([
      ['Material', 'Coffee Tree Prunings'],
      ['Particle Size', 'Mixed (chips + sawdust)'],
      ['Moisture', '<15%'],
      ['Use', 'Composting, Mulch, Substrate']
    ]),
    ratings: { average: 4.3, count: 18 },
    totalSales: 320,
    isFeatured: false,
    supplierVerified: true,
  },

  // ===== TEA =====
  {
    name: 'Black Tea - CTC Grade',
    slug: 'black-tea-ctc',
    category: 'tea',
    subcategory: 'Black Tea',
    description: 'Premium CTC (Crush, Tear, Curl) black tea from the slopes of Mount Rwenzori. Strong, full-bodied with malty notes. Perfect for breakfast tea. Produces excellent color and brisk flavor.',
    supplierName: 'Rwenzori Tea Estates',
    images: [
      { url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800', alt: 'Black Tea' }
    ],
    price: 8000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 1000,
    minOrderQuantity: 20,
    isCertified: true,
    certifications: [{ name: 'Rainforest Alliance' }],
    specifications: new Map([
      ['Grade', 'CTC BP1'],
      ['Origin', 'Rwenzori, Uganda'],
      ['Moisture', '<7%'],
      ['Tannin', 'Medium-High']
    ]),
    ratings: { average: 4.4, count: 67 },
    totalSales: 1850,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Green Tea - Orthodox',
    slug: 'green-tea-orthodox',
    category: 'tea',
    subcategory: 'Green Tea',
    description: 'High-quality orthodox green tea with delicate flavor. Light, refreshing with grassy notes and slight vegetal sweetness. Rich in antioxidants. Ideal for health-conscious consumers.',
    supplierName: 'Rwenzori Tea Estates',
    images: [
      { url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800', alt: 'Green Tea' }
    ],
    price: 12000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 400,
    minOrderQuantity: 10,
    isOrganic: true,
    isCertified: true,
    certifications: [{ name: 'Organic' }],
    specifications: new Map([
      ['Type', 'Orthodox Green'],
      ['Processing', 'Steamed'],
      ['Oxidation', 'Minimal'],
      ['Antioxidants', 'High EGCG']
    ]),
    ratings: { average: 4.7, count: 34 },
    totalSales: 280,
    isFeatured: false,
    supplierVerified: true,
  },

  // ===== BANANAS (MATOOKE) =====
  {
    name: 'Matooke (Green Cooking Bananas) - Fresh',
    slug: 'matooke-green-bananas',
    category: 'bananas',
    subcategory: 'Matooke',
    description: 'Fresh green cooking bananas (Matooke) harvested from organic farms in Mbarara. Staple food crop. Excellent for steaming, making traditional dishes. High in carbohydrates, potassium, and fiber.',
    supplierName: 'Mbarara Fresh Produce',
    images: [
      { url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800', alt: 'Matooke Bananas' }
    ],
    price: 2500,
    currency: 'UGX',
    unit: 'bunch (8-12kg)',
    stockQuantity: 200,
    minOrderQuantity: 5,
    isOrganic: true,
    specifications: new Map([
      ['Variety', 'East African Highland Banana'],
      ['Harvest', 'Green (unripe)'],
      ['Shelf Life', '7-10 days'],
      ['Grade', 'Premium']
    ]),
    usageInstructions: 'Store in cool, dry place. Use within 7 days. Peel and steam for 45-60 minutes until soft.',
    ratings: { average: 4.5, count: 145 },
    totalSales: 1200,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Banana Fiber (Craft Material)',
    slug: 'banana-fiber-craft',
    category: 'bananas',
    subcategory: 'By-products',
    description: 'Dried banana stem fiber suitable for handicrafts, rope making, textile production, and paper manufacturing. Sustainable and eco-friendly material from banana plant waste.',
    supplierName: 'Eco-Crafts Uganda',
    images: [
      { url: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=800', alt: 'Banana Fiber' }
    ],
    price: 5000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 300,
    minOrderQuantity: 10,
    isOrganic: true,
    specifications: new Map([
      ['Material', 'Banana Stem Fiber'],
      ['Processing', 'Sun-dried'],
      ['Color', 'Natural Tan'],
      ['Use', 'Crafts, Textiles, Paper']
    ]),
    ratings: { average: 4.2, count: 28 },
    totalSales: 150,
    isFeatured: false,
    supplierVerified: true,
  },

  // ===== VANILLA =====
  {
    name: 'Vanilla Beans - Grade A (Gourmet)',
    slug: 'vanilla-beans-grade-a',
    category: 'vanilla',
    subcategory: 'Vanilla Beans',
    description: 'Premium Grade A vanilla beans from Kasese district. 16-18cm length, moisture content 30-35%. Rich, creamy aroma with strong vanilla flavor. Perfect for baking, ice cream, and gourmet cooking.',
    supplierName: 'Kasese Vanilla Growers',
    images: [
      { url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800', alt: 'Vanilla Beans' }
    ],
    price: 120000,
    currency: 'UGX',
    unit: 'kg',
    stockQuantity: 50,
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    isOrganic: true,
    isCertified: true,
    certifications: [{ name: 'Organic' }, { name: 'Fair Trade' }],
    specifications: new Map([
      ['Grade', 'A (Gourmet)'],
      ['Length', '16-18cm'],
      ['Moisture', '30-35%'],
      ['Vanillin Content', '2.0-2.5%'],
      ['Origin', 'Kasese, Uganda']
    ]),
    usageInstructions: 'Store in airtight container in cool, dark place. Split bean lengthwise and scrape seeds. Use both seeds and pod for maximum flavor.',
    ratings: { average: 4.9, count: 52 },
    totalSales: 85,
    isFeatured: true,
    bulkDiscounts: [
      { minQuantity: 5, discountPercentage: 5 },
      { minQuantity: 10, discountPercentage: 10 }
    ],
    supplierVerified: true,
  },
  {
    name: 'Vanilla Extract - Pure',
    slug: 'vanilla-extract-pure',
    category: 'vanilla',
    subcategory: 'Vanilla Extract',
    description: 'Pure vanilla extract made from Grade A Uganda vanilla beans. Double-fold strength. No artificial flavors or sweeteners. Perfect for baking and cooking. 100ml and 250ml bottles available.',
    supplierName: 'Uganda Vanilla Company',
    images: [
      { url: 'https://images.unsplash.com/photo-1624273360661-9e9b2fd7711e?w=800', alt: 'Vanilla Extract' }
    ],
    price: 25000,
    currency: 'UGX',
    unit: '100ml bottle',
    stockQuantity: 200,
    minOrderQuantity: 6,
    isOrganic: true,
    specifications: new Map([
      ['Strength', 'Double-fold (2X)'],
      ['Ingredients', 'Vanilla beans, alcohol'],
      ['Alcohol Content', '35%'],
      ['Shelf Life', '5 years']
    ]),
    ratings: { average: 4.8, count: 78 },
    totalSales: 340,
    isFeatured: true,
    supplierVerified: true,
  },

  // ===== LIVESTOCK =====
  {
    name: 'Improved Dairy Cattle - Friesian Cross',
    slug: 'dairy-cattle-friesian-cross',
    category: 'livestock',
    subcategory: 'Cattle',
    description: 'Improved Friesian crossbreed dairy cattle. Age: 18-24 months. Ready for first service. Average milk production: 15-20 liters per day. Vaccinated and dewormed. Health certificate provided.',
    supplierName: 'Mbarara Livestock Farm',
    images: [
      { url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800', alt: 'Dairy Cattle' }
    ],
    price: 3500000,
    currency: 'UGX',
    unit: 'head',
    stockQuantity: 15,
    minOrderQuantity: 1,
    maxOrderQuantity: 5,
    isCertified: true,
    certifications: [{ name: 'Veterinary Health Certificate' }],
    specifications: new Map([
      ['Breed', 'Friesian Cross'],
      ['Age', '18-24 months'],
      ['Expected Milk', '15-20L/day'],
      ['Health Status', 'Vaccinated & Dewormed'],
      ['Documentation', 'Health Certificate Included']
    ]),
    usageInstructions: 'Provide adequate shelter, clean water, and balanced feed. Regular veterinary checkups recommended. First service at 24 months.',
    ratings: { average: 4.7, count: 23 },
    totalSales: 12,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Local Goats - Mubende Breed',
    slug: 'goats-mubende-breed',
    category: 'livestock',
    subcategory: 'Goats',
    description: 'Mubende breed goats, excellent for meat and milk production. Hardy and disease-resistant. Age: 6-12 months. Suitable for small-scale and commercial farming. Vaccinated.',
    supplierName: 'Central Region Livestock',
    images: [
      { url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde0?w=800', alt: 'Goats' }
    ],
    price: 180000,
    currency: 'UGX',
    unit: 'head',
    stockQuantity: 40,
    minOrderQuantity: 2,
    isCertified: true,
    certifications: [{ name: 'Veterinary Health Certificate' }],
    specifications: new Map([
      ['Breed', 'Mubende'],
      ['Age', '6-12 months'],
      ['Weight', '25-35kg'],
      ['Purpose', 'Meat & Milk'],
      ['Health', 'Vaccinated']
    ]),
    ratings: { average: 4.6, count: 34 },
    totalSales: 68,
    isFeatured: false,
    supplierVerified: true,
  },
  {
    name: 'Improved Chicken - Kuroiler Breed',
    slug: 'chicken-kuroiler',
    category: 'livestock',
    subcategory: 'Poultry',
    description: 'Kuroiler improved chicken breed. Dual-purpose (meat and eggs). 6-8 weeks old chicks. Fast growth, disease-resistant. Mature weight: 3-4kg. Egg production: 150-200 eggs/year. Vaccinated.',
    supplierName: 'Kampala Poultry Farm',
    images: [
      { url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800', alt: 'Chickens' }
    ],
    price: 8000,
    currency: 'UGX',
    unit: 'chick',
    stockQuantity: 500,
    minOrderQuantity: 20,
    isCertified: true,
    certifications: [{ name: 'Veterinary Certified' }],
    specifications: new Map([
      ['Breed', 'Kuroiler'],
      ['Age', '6-8 weeks'],
      ['Purpose', 'Dual (Meat & Eggs)'],
      ['Mature Weight', '3-4kg'],
      ['Egg Production', '150-200/year']
    ]),
    usageInstructions: 'Provide starter feed for first 8 weeks, then grower feed. Vaccinate against Newcastle disease. Provide clean water and shelter.',
    ratings: { average: 4.8, count: 156 },
    totalSales: 1200,
    isFeatured: true,
    supplierVerified: true,
  },

  // ===== AGRO INPUTS =====
  {
    name: 'Organic Fertilizer - Compost',
    slug: 'organic-fertilizer-compost',
    category: 'fertilizers',
    subcategory: 'Organic',
    description: 'Well-decomposed organic compost made from coffee pulp, banana peels, and animal manure. Rich in NPK and micronutrients. Improves soil structure and water retention. Suitable for all crops.',
    supplierName: 'Green Valley Organics',
    images: [
      { url: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b80a1b?w=800', alt: 'Organic Compost' }
    ],
    price: 25000,
    currency: 'UGX',
    unit: 'bag (50kg)',
    stockQuantity: 1000,
    minOrderQuantity: 10,
    isOrganic: true,
    isCertified: true,
    certifications: [{ name: 'Organic Certified' }],
    specifications: new Map([
      ['NPK Ratio', '2-1-1'],
      ['Moisture', '<35%'],
      ['pH', '6.5-7.5'],
      ['Maturity', 'Fully Decomposed']
    ]),
    usageInstructions: 'Apply 2-4 bags per acre. Mix into topsoil before planting or use as top dressing. Water after application.',
    ratings: { average: 4.6, count: 234 },
    totalSales: 2400,
    isFeatured: true,
    bulkDiscounts: [
      { minQuantity: 50, discountPercentage: 10 },
      { minQuantity: 100, discountPercentage: 15 }
    ],
    supplierVerified: true,
  },
  {
    name: 'NPK Fertilizer 17-17-17',
    slug: 'npk-fertilizer-17-17-17',
    category: 'fertilizers',
    subcategory: 'Chemical',
    description: 'Balanced NPK compound fertilizer suitable for all crops. Contains equal parts nitrogen, phosphorus, and potassium. Promotes healthy growth, flowering, and fruiting. Water-soluble granules.',
    supplierName: 'AgroSupply Uganda',
    images: [
      { url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800', alt: 'NPK Fertilizer' }
    ],
    price: 120000,
    currency: 'UGX',
    unit: 'bag (50kg)',
    stockQuantity: 500,
    minOrderQuantity: 5,
    isCertified: true,
    specifications: new Map([
      ['NPK Ratio', '17-17-17'],
      ['Form', 'Granular'],
      ['Solubility', 'Water Soluble'],
      ['Application', 'Broadcasting or Banding']
    ]),
    usageInstructions: 'Apply 2-3 bags per acre depending on crop. Split application recommended. Apply during planting and top-dress at vegetative stage.',
    ratings: { average: 4.5, count: 189 },
    totalSales: 1850,
    isFeatured: true,
    bulkDiscounts: [
      { minQuantity: 20, discountPercentage: 8 },
      { minQuantity: 50, discountPercentage: 12 }
    ],
    supplierVerified: true,
  },
  {
    name: 'Coffee Seedlings - Arabica SL28',
    slug: 'coffee-seedlings-arabica-sl28',
    category: 'seedlings',
    subcategory: 'Coffee',
    description: 'Certified Arabica SL28 coffee seedlings. Age: 6-8 months, ready for transplanting. Disease-resistant, high-yielding variety. Suitable for altitudes 1,400m and above. Healthy root system.',
    supplierName: 'Coffee Trap Nursery',
    images: [
      { url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800', alt: 'Coffee Seedlings' }
    ],
    price: 1500,
    currency: 'UGX',
    unit: 'seedling',
    stockQuantity: 5000,
    minOrderQuantity: 100,
    isCertified: true,
    certifications: [{ name: 'Certified Seedlings' }, { name: 'UCDA Approved' }],
    specifications: new Map([
      ['Variety', 'SL28'],
      ['Age', '6-8 months'],
      ['Height', '30-40cm'],
      ['Root System', 'Well-developed'],
      ['Certification', 'UCDA Certified']
    ]),
    usageInstructions: 'Transplant during rainy season. Dig holes 60x60cm, add manure. Space 2.5m x 2.5m. Mulch and water regularly for first 3 months.',
    ratings: { average: 4.8, count: 167 },
    totalSales: 12000,
    isFeatured: true,
    bulkDiscounts: [
      { minQuantity: 500, discountPercentage: 5 },
      { minQuantity: 1000, discountPercentage: 10 },
      { minQuantity: 5000, discountPercentage: 15 }
    ],
    supplierVerified: true,
  },
  {
    name: 'Organic Pesticide - Neem Oil',
    slug: 'organic-pesticide-neem-oil',
    category: 'pesticides',
    subcategory: 'Organic',
    description: 'Pure neem oil extract for organic pest control. Effective against aphids, mites, whiteflies, and fungal diseases. Safe for beneficial insects. Can be used up to harvest day.',
    supplierName: 'BioProtect Uganda',
    images: [
      { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', alt: 'Neem Oil' }
    ],
    price: 35000,
    currency: 'UGX',
    unit: 'liter',
    stockQuantity: 300,
    minOrderQuantity: 2,
    isOrganic: true,
    isCertified: true,
    certifications: [{ name: 'Organic Certified' }],
    specifications: new Map([
      ['Active Ingredient', 'Azadirachtin'],
      ['Concentration', '3000 ppm'],
      ['Target Pests', 'Aphids, Mites, Whiteflies'],
      ['PHI', '0 days (safe to harvest)']
    ]),
    usageInstructions: 'Mix 30-50ml per liter of water. Spray early morning or evening. Repeat every 7-10 days. Add sticker for better adherence.',
    ratings: { average: 4.7, count: 98 },
    totalSales: 450,
    isFeatured: true,
    supplierVerified: true,
  },
  {
    name: 'Pruning Shears - Heavy Duty',
    slug: 'pruning-shears-heavy-duty',
    category: 'tools',
    subcategory: 'Hand Tools',
    description: 'Professional-grade pruning shears with carbon steel blades. Ergonomic rubber grip handles. Suitable for coffee pruning, tree trimming, and general farm use. Cuts branches up to 2cm diameter.',
    supplierName: 'Farm Tools Uganda',
    images: [
      { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', alt: 'Pruning Shears' }
    ],
    price: 25000,
    currency: 'UGX',
    unit: 'piece',
    stockQuantity: 200,
    minOrderQuantity: 1,
    specifications: new Map([
      ['Blade Material', 'Carbon Steel'],
      ['Handle', 'Ergonomic Rubber Grip'],
      ['Cutting Capacity', 'Up to 2cm'],
      ['Length', '20cm']
    ]),
    ratings: { average: 4.6, count: 145 },
    totalSales: 680,
    isFeatured: false,
    supplierVerified: true,
  },
  {
    name: 'Drip Irrigation Kit - 1 Acre',
    slug: 'drip-irrigation-kit-1acre',
    category: 'irrigation',
    subcategory: 'Drip Systems',
    description: 'Complete drip irrigation system for 1 acre. Includes main line, drip lines, emitters, filters, and connectors. Water-saving technology. Suitable for coffee, vegetables, and row crops.',
    supplierName: 'IrriTech Uganda',
    images: [
      { url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800', alt: 'Drip Irrigation' }
    ],
    price: 1800000,
    currency: 'UGX',
    unit: 'kit',
    stockQuantity: 30,
    minOrderQuantity: 1,
    specifications: new Map([
      ['Coverage', '1 Acre'],
      ['Components', 'Main line, drip lines, emitters, filter'],
      ['Water Savings', 'Up to 60%'],
      ['Emitter Spacing', '30cm']
    ]),
    usageInstructions: 'Install main line from water source. Connect drip lines at plant rows. Install filter at source. Flush system weekly.',
    ratings: { average: 4.8, count: 56 },
    totalSales: 85,
    isFeatured: true,
    bulkDiscounts: [
      { minQuantity: 5, discountPercentage: 10 }
    ],
    supplierVerified: true,
  },
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Clear existing products (optional - comment out if you want to keep existing)
    console.log('\nClearing existing products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing products`);

    // Insert new products
    console.log('\nInserting new products...');
    const result = await Product.insertMany(products);
    console.log(`Successfully inserted ${result.length} products`);

    // Print summary by category
    console.log('\n=== PRODUCTS SUMMARY ===');
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    categories.forEach(cat => {
      console.log(`${cat._id}: ${cat.count} products`);
    });

    console.log('\n=== Featured Products ===');
    const featured = await Product.find({ isFeatured: true }).select('name category price');
    featured.forEach(p => {
      console.log(`- ${p.name} (${p.category}) - ${p.price} ${p.currency || 'UGX'}`);
    });

    console.log('\n✅ Product seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seeder
seedProducts();
