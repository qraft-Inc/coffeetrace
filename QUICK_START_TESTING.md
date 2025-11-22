# Quick Start Testing Guide

## 🚀 Start Testing in 5 Minutes

### Prerequisites
✅ MongoDB Atlas running  
✅ All environment variables set in `.env.local`  
✅ Dependencies installed (`npm install`)  

---

## Step 1: Start Development Server

```bash
npm run dev
```

Server should start at: `http://localhost:3001`

---

## Step 2: Test Payment Flow

### A. Visit Farmer Tip Page
```
http://localhost:3001/tip/{farmerId}
```

**Get a valid farmerId:**
```bash
# In MongoDB Compass or Atlas
db.farmers.findOne({}, {_id: 1, name: 1})
```

### B. Fill Tip Form
- Amount: `10000` (10,000 UGX)
- Name: `Test Buyer`
- Email: `buyer@test.com`
- Phone: `+256700000000` (optional)
- Message: `Great coffee!`

### C. Submit & Check Logs
- Watch terminal for checkout creation
- Note the `checkout_url` in response
- Tip should be created with status `pending`

### D. Simulate Webhook (Since Onafriq is test mode)

**Create test webhook request:**
```bash
# Windows PowerShell
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$payload = @{
  event = "payment.success"
  reference = "PSP-XXX"  # Replace with actual psp_reference from tip
  amount = 1000000  # 10000 * 100 (cents)
  currency = "UGX"
  status = "completed"
  payment_method = "mobile_money"
} | ConvertTo-Json

# Generate HMAC signature (need secret key)
$secret = $env:ONAFRIQ_WEBHOOK_SECRET
$message = "$timestamp.$payload"
$hmac = [System.Security.Cryptography.HMACSHA256]::new([Text.Encoding]::UTF8.GetBytes($secret))
$signature = [Convert]::ToHexString($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($message))).ToLower()

# Send webhook
Invoke-WebRequest -Uri "http://localhost:3001/api/payments/webhook" `
  -Method POST `
  -Headers @{
    "x-onafriq-signature" = $signature
    "x-onafriq-timestamp" = $timestamp
    "Content-Type" = "application/json"
  } `
  -Body $payload
```

### E. Verify Wallet Updated
```javascript
// In MongoDB
db.wallets.findOne({ farmerId: ObjectId("farmer_id_here") })
// Should show balance increased by 9700 (97% of 10000)

db.wallettransactions.find({ 
  userId: ObjectId("user_id_here") 
}).sort({ createdAt: -1 }).limit(1)
// Should show deposit transaction
```

---

## Step 3: Test Farmer Dashboard

### A. Login as Farmer
```
http://localhost:3001/login
Email: farmer@coffeetrace-demo.com
Password: Demo123!
```

### B. View Wallet
```
http://localhost:3001/dashboard/wallet
```

**Should display:**
- Current balance (9,700 UGX from tip above)
- Total earned
- Transaction history with the tip

### C. View Payouts
```
http://localhost:3001/dashboard/payouts
```

**Should show:**
- Empty (no payouts yet - balance below 50K threshold)
- Status counters (all zeros)

---

## Step 4: Test Lot Traceability

### A. Visit Lot Page
```
http://localhost:3001/lot/{lotId}
```

**Get a valid lotId:**
```bash
# In MongoDB
db.lots.findOne({}, {_id: 1, traceId: 1, variety: 1})
```

### B. Verify Page Shows:
- Lot details (variety, quantity, harvest date)
- Processing timeline with visual steps
- Event history
- Farmer profile card
- "Tip This Farmer" button

### C. Click Tip Button
- Should redirect to `/tip/{farmerId}?lot={lotId}`
- Lot ID should be passed in URL

---

## Step 5: Test Scheduled Payout (Manual)

### A. Set High Balance
```javascript
// In MongoDB - manually set balance above threshold
db.wallets.updateOne(
  { farmerId: ObjectId("farmer_id_here") },
  { $set: { balance: 55000 } }  // Above 50K threshold
)
```

### B. Run Payout Function Locally
```bash
# Create a test script: test-payout.js
const handler = require('./netlify/functions/payouts').handler;

handler({}, {}).then(result => {
  console.log('Result:', result);
});

# Run it
node test-payout.js
```

### C. Verify Results
```javascript
// Check payout created
db.payouts.find({}).sort({ createdAt: -1 }).limit(1)
// Should show status: 'processing' or 'pending'

// Check wallet deducted
db.wallets.findOne({ farmerId: ObjectId("farmer_id_here") })
// Balance should be 0 if payout succeeded

// Check transaction logged
db.wallettransactions.find({
  type: 'withdrawal'
}).sort({ createdAt: -1 }).limit(1)
```

---

## Step 6: Test QR Code Generation

### A. Generate Farmer QR
```javascript
// Create script: generate-qr.js
const { generateFarmerQRCode } = require('./lib/qrcode/generator');
const dbConnect = require('./lib/dbConnect');
const Farmer = require('./models/Farmer');

async function test() {
  await dbConnect();
  const farmer = await Farmer.findOne({});
  
  const result = await generateFarmerQRCode(
    farmer._id.toString(),
    farmer.name,
    true  // Upload to Cloudinary
  );
  
  console.log('QR Generated:', result);
  
  if (result.success) {
    farmer.qrCodeUrl = result.qr_code_url;
    await farmer.save();
    console.log('Farmer updated with QR URL');
  }
}

test();
```

```bash
node generate-qr.js
```

### B. Verify QR Code
- Check Cloudinary dashboard for uploaded image
- Copy QR URL and open in browser
- Scan QR with phone camera
- Should redirect to tip page

---

## Step 7: Test API Endpoints Directly

### A. Get Wallet Balance
```bash
curl http://localhost:3001/api/wallet \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### B. Get Transactions
```bash
curl "http://localhost:3001/api/wallet/transactions?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### C. Get Payouts
```bash
curl "http://localhost:3001/api/payouts?page=1" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### D. Get Farmer Details
```bash
curl http://localhost:3001/api/farmers/{farmerId}
```

### E. Get Lot Details
```bash
curl http://localhost:3001/api/lots/{lotId}
```

---

## Common Issues & Solutions

### 1. "Farmer profile not found"
**Solution**: Make sure logged-in user has a farmer record
```javascript
db.farmers.findOne({ userId: ObjectId("user_id_from_session") })
```

### 2. Webhook signature verification fails
**Solution**: Check `ONAFRIQ_WEBHOOK_SECRET` matches in both places
```bash
echo $env:ONAFRIQ_WEBHOOK_SECRET
```

### 3. QR code upload fails
**Solution**: Verify Cloudinary credentials
```bash
echo $env:CLOUDINARY_CLOUD_NAME
echo $env:CLOUDINARY_API_KEY
```

### 4. Payout phone number invalid
**Solution**: Make sure farmer has phoneNumber field
```javascript
db.farmers.updateOne(
  { _id: ObjectId("farmer_id") },
  { $set: { phoneNumber: "+256700123456" } }
)
```

### 5. Balance not updating after tip
**Solution**: Check webhook was received and processed
- Look for wallet update logs in terminal
- Verify tip status = 'confirmed'
- Check WalletTransaction created

---

## Quick Database Queries

### View All Tips
```javascript
db.tips.find({}).sort({ createdAt: -1 }).pretty()
```

### View All Payouts
```javascript
db.payouts.find({}).sort({ createdAt: -1 }).pretty()
```

### View Wallet Transactions
```javascript
db.wallettransactions.find({}).sort({ createdAt: -1 }).pretty()
```

### Check Wallet Balance
```javascript
db.wallets.find({}, { farmerId: 1, balance: 1, currency: 1 })
```

### Find Tips by Farmer
```javascript
db.tips.find({ 
  farmerId: ObjectId("farmer_id_here"),
  status: "confirmed"
}).count()
```

---

## Test Data Setup Script

**Create `scripts/setupTestData.js`:**
```javascript
const dbConnect = require('../lib/dbConnect');
const Farmer = require('../models/Farmer');
const Wallet = require('../models/Wallet');

async function setup() {
  await dbConnect();
  
  // Find farmer
  const farmer = await Farmer.findOne({ 
    email: 'farmer@coffeetrace-demo.com' 
  });
  
  if (!farmer) {
    console.error('Demo farmer not found');
    return;
  }
  
  // Create/update wallet
  let wallet = await Wallet.findOne({ farmerId: farmer._id });
  if (!wallet) {
    wallet = await Wallet.create({
      farmerId: farmer._id,
      balance: 0,
      currency: 'UGX',
    });
    console.log('Created wallet:', wallet._id);
  }
  
  // Update farmer with wallet and phone
  farmer.walletId = wallet._id;
  farmer.phoneNumber = '+256700123456';
  await farmer.save();
  
  console.log('Setup complete!');
  console.log('Farmer ID:', farmer._id);
  console.log('Wallet ID:', wallet._id);
  console.log('Phone:', farmer.phoneNumber);
  
  process.exit(0);
}

setup();
```

**Run it:**
```bash
node scripts/setupTestData.js
```

---

## Success Indicators

✅ Tip page loads with farmer details  
✅ Checkout creates tip in database  
✅ Webhook updates wallet balance  
✅ Transaction appears in history  
✅ Wallet dashboard shows correct balance  
✅ Payout processes when balance >= 50K  
✅ QR codes generate and upload  
✅ Lot traceability displays timeline  
✅ Tip button redirects correctly  

---

## Next: Production Testing

Once local testing passes:

1. Deploy to Netlify staging
2. Configure Onafriq webhook URL
3. Test with real Onafriq sandbox
4. Verify Netlify function runs on schedule
5. Monitor logs for errors
6. Test on mobile devices
7. Verify QR codes work end-to-end

---

**Happy Testing! 🎉**

If you encounter issues, check:
- Terminal logs for errors
- MongoDB for data state
- Browser console for frontend errors
- Network tab for API responses
