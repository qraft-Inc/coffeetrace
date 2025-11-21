# 🌱 Product Seeding Instructions

## Overview
This guide will help you populate the marketplace with coffee products, agro inputs, and other agricultural products.

## Products Included

### Coffee Products (8 items)
- ☕ **Green Coffee**: Arabica AA, Robusta Grade A
- 🔥 **Roasted Coffee**: Medium Roast, Dark Roast Espresso
- ⭐ **Specialty Micro-lots**: SL28 Honey, Geisha Natural (limited quantities)
- 🍵 **Cascara**: Coffee Cherry Tea
- ♻️ **Coffee By-products**: Wood & Sawdust

### Tea (2 items)
- 🍵 **Black Tea**: CTC Grade
- 🌿 **Green Tea**: Orthodox

### Bananas - Matooke (2 items)
- 🍌 **Fresh Matooke**: Green Cooking Bananas
- 🧵 **Banana Fiber**: Craft Material

### Vanilla (2 items)
- 🌸 **Vanilla Beans**: Grade A Gourmet
- 🧴 **Vanilla Extract**: Pure

### Livestock (3 items)
- 🐄 **Dairy Cattle**: Friesian Cross
- 🐐 **Goats**: Mubende Breed
- 🐔 **Chickens**: Kuroiler (Improved)

### Agro Inputs (6 items)
- 🌱 **Fertilizers**: Organic Compost, NPK 17-17-17
- 🌿 **Seedlings**: Coffee Arabica SL28
- 🛡️ **Pesticides**: Neem Oil (Organic)
- ✂️ **Tools**: Pruning Shears
- 💧 **Irrigation**: Drip System Kit

**Total: 23 Products** across 9 categories

---

## How to Run the Seeder

### Option 1: Using Node (Recommended)

```powershell
# Run from project root
node scripts/seedProducts.js
```

### Option 2: Using npm script (if added to package.json)

```powershell
npm run seed:products
```

---

## What the Script Does

1. ✅ Connects to your MongoDB database
2. 🗑️ Clears existing products (optional - can be disabled)
3. 📦 Inserts 23 new products with:
   - Detailed descriptions
   - High-quality images (Unsplash)
   - Pricing in UGX
   - Stock quantities
   - Ratings and reviews
   - Certifications
   - Specifications
   - Bulk discounts (where applicable)
4. 📊 Displays a summary by category

---

## Expected Output

```
Connecting to MongoDB...
Connected to MongoDB successfully

Clearing existing products...
Deleted X existing products

Inserting new products...
Successfully inserted 23 products

=== PRODUCTS SUMMARY ===
coffee_green: 2 products
coffee_roasted: 2 products
coffee_specialty: 2 products
coffee_cascara: 1 products
coffee_other: 1 products
tea: 2 products
bananas: 2 products
vanilla: 2 products
livestock: 3 products
fertilizers: 2 products
seedlings: 1 products
pesticides: 1 products
tools: 1 products
irrigation: 1 products

=== Featured Products ===
- Arabica Green Coffee Beans - Premium Grade AA (coffee_green) - 12000 UGX
- Robusta Green Coffee Beans - Grade A (coffee_green) - 8500 UGX
- Roasted Coffee Beans - Medium Roast (coffee_roasted) - 18000 UGX
...

✅ Product seeding completed successfully!
```

---

## Viewing Products in the Marketplace

After seeding, visit:
- **Homepage**: http://localhost:3000/marketplace
- **API Endpoint**: http://localhost:3000/api/products

### Filter by Category

```
/api/products?category=coffee_green
/api/products?category=coffee_roasted
/api/products?category=tea
/api/products?category=vanilla
/api/products?category=livestock
/api/products?category=fertilizers
```

---

## Customization

### To Keep Existing Products
Edit `scripts/seedProducts.js` and comment out line:
```javascript
// const deleteResult = await Product.deleteMany({});
```

### To Add More Products
Add new product objects to the `products` array in `seedProducts.js`

### To Change Prices
Modify the `price` field in each product object

### To Update Stock
Modify the `stockQuantity` field

---

## Product Features

Each product includes:

✅ **Name & Slug** - SEO-friendly URLs  
✅ **Category & Subcategory** - Easy filtering  
✅ **Detailed Description** - Marketing copy  
✅ **Pricing** - In UGX with bulk discounts  
✅ **Stock Management** - Quantity tracking  
✅ **Images** - High-quality photos  
✅ **Certifications** - Organic, Fair Trade, etc.  
✅ **Specifications** - Technical details  
✅ **Ratings** - Pre-populated reviews  
✅ **Usage Instructions** - Customer guidance  
✅ **Featured Flag** - Homepage display  
✅ **Supplier Verification** - Trust indicators  

---

## Troubleshooting

### Error: "MONGODB_URI not found"
Solution: Make sure `.env.local` has `MONGODB_URI` set

### Error: "Duplicate key error"
Solution: Products with same slug already exist. Clear database or change slugs.

### Error: "Cannot connect to MongoDB"
Solution: Check if MongoDB Atlas connection string is correct and network is accessible

---

## Next Steps

After seeding products:

1. ✅ Visit `/marketplace` to see all products
2. ✅ Test search and filtering
3. ✅ Create orders as a farmer
4. ✅ Test payment integration
5. ✅ Add more product images if needed
6. ✅ Customize descriptions for your brand

---

## Support

For issues or questions:
- Check MongoDB connection in `.env.local`
- Verify all dependencies are installed: `npm install`
- Check console output for detailed error messages

---

**Happy Farming! 🌾**
