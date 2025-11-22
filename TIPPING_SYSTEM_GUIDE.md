# Coffee Trace - Tipping & Wallet System Implementation Guide

## ✅ COMPLETED COMPONENTS

### 1. Database Models (3 files)
- ✅ `models/Tip.js` - Tip records with platform fees
- ✅ `models/Payout.js` - Payout tracking with retry logic
- ✅ `models/WalletTransaction.js` - Already exists, enhanced for tips

### 2. Onafriq API Wrappers (2 files)
- ✅ `lib/onafriq/payments.ts` - Checkout, webhook verification
- ✅ `lib/onafriq/payouts.ts` - Mobile money disbursements

### 3. Payment APIs (2 files)
- ✅ `app/api/payments/checkout/route.ts` - Create payment sessions
- ✅ `app/api/payments/webhook/route.ts` - Process webhooks

### 4. QR Code System (1 file)
- ✅ `lib/qrcode/generator.ts` - Generate & upload QR codes

### 5. Buyer Pages (1 file)
- ✅ `app/tip/[farmerId]/page.tsx` - Farmer tipping page

---

## 📋 REMAINING FILES TO CREATE

### Critical Files (Must Create):

#### 1. Lot/Product Tip Page
**File**: `app/lot/[lotId]/page.tsx`
- Display lot traceability
- Show farmer info
- "Tip This Farmer" button
- Full journey visualization

#### 2. Scheduled Payout Function
**File**: `netlify/functions/payouts.ts`
- Cron: Daily at 20:00 EAT
- Process wallets >= MIN_THRESHOLD
- Call Onafriq payout API
- Handle retries

#### 3. Wallet Management APIs
**Files**:
- `app/api/wallet/route.ts` - Get wallet balance
- `app/api/wallet/transactions/route.ts` - Transaction history
- `app/api/payouts/route.ts` - Payout requests

#### 4. Farmer Dashboard Pages
**Files**:
- `app/dashboard/wallet/page.tsx` - Balance & transactions
- `app/dashboard/payouts/page.tsx` - Payout history
- `app/dashboard/qrcodes/page.tsx` - Display QR codes

#### 5. Update Existing Models
**Files** to modify:
- `models/Farmer.js` - Add `qrCodeUrl`, `walletId`
- `models/Lot.js` - Add `qrCodeUrl`
- `models/Wallet.js` - Add tip-related fields

---

## 🔧 ENVIRONMENT VARIABLES REQUIRED

Add to `.env.local`:

```env
# Onafriq API Configuration
ONAFRIQ_API_KEY=your_api_key_here
ONAFRIQ_CLIENT_ID=your_client_id
ONAFRIQ_CLIENT_SECRET=your_client_secret
ONAFRIQ_BASE_URL=https://api.onafriq.com
ONAFRIQ_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Cloudinary (already configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payout Configuration
MIN_PAYOUT_THRESHOLD=50000
PAYOUT_SCHEDULE_HOUR=20
```

---

## 📦 NPM PACKAGES TO INSTALL

```bash
npm install qrcode
npm install cloudinary
npm install @types/qrcode --save-dev
```

---

## 🔄 PAYMENT FLOW

### Checkout Flow:
1. **Buyer** visits `/tip/{farmerId}` or `/lot/{lotId}`
2. Enters tip amount + details
3. **POST** `/api/payments/checkout`
   - Creates pending `Tip` record
   - Calls `Onafriq.createCheckout()`
   - Returns checkout URL
4. **Redirect** to Onafriq payment page
5. Buyer completes payment

### Webhook Flow:
1. **Onafriq** sends webhook to `/api/payments/webhook`
2. Verify signature
3. Find `Tip` by `psp_reference`
4. Update tip `status = 'confirmed'`
5. Calculate `net_amount` (gross - 3% fee)
6. Add to `Wallet.balance`
7. Create `WalletTransaction` record

### Payout Flow:
1. **Cron** runs daily at 20:00 EAT
2. Find wallets where `balance >= MIN_THRESHOLD`
3. For each wallet:
   - Create `Payout` record
   - Call `Onafriq.sendMobileMoneyPayout()`
   - Set `wallet.balance = 0`
   - Log result
4. If failed → schedule retry with exponential backoff

---

## 🎯 QR CODE IMPLEMENTATION

### Farmer QR Code:
- Generated when farmer profile is created/updated
- Points to: `https://yourdomain.com/tip/{farmerId}`
- Uploaded to Cloudinary: `/coffeetrace/qrcodes/farmers/`
- Stored in `Farmer.qrCodeUrl`

### Lot QR Code:
- Generated when lot is created
- Points to: `https://yourdomain.com/lot/{lotId}`
- Uploaded to Cloudinary: `/coffeetrace/qrcodes/lots/`
- Stored in `Lot.qrCodeUrl`

### Usage:
```typescript
import { generateFarmerQRCode } from '@/lib/qrcode/generator';

const result = await generateFarmerQRCode(farmerId, farmerName);
if (result.success) {
  farmer.qrCodeUrl = result.qr_code_url;
  await farmer.save();
}
```

---

## 🔐 SECURITY CHECKLIST

- ✅ Webhook signature verification
- ✅ Farmer/Lot validation before payment
- ✅ Platform fee calculation server-side
- ✅ No direct wallet manipulation from frontend
- ⚠️ Add rate limiting to payment endpoints
- ⚠️ Add CSRF protection
- ⚠️ Add request logging for PSP calls

---

## 🧪 TESTING GUIDE

### Test Payment:
```bash
curl -X POST http://localhost:3001/api/payments/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "farmerId": "FARMER_ID_HERE",
    "amount": 10000,
    "currency": "UGX",
    "buyer_metadata": {
      "name": "Test Buyer",
      "email": "test@example.com"
    }
  }'
```

### Test Webhook (Local):
```bash
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-onafriq-signature: test_signature" \
  -H "x-onafriq-timestamp: 1234567890" \
  -d '{
    "event": "payment.success",
    "reference": "PSP_REF_123",
    "amount": 1000000,
    "currency": "UGX",
    "status": "completed"
  }'
```

### Test Payout:
```typescript
import { sendMobileMoneyPayout } from '@/lib/onafriq/payouts';

const result = await sendMobileMoneyPayout({
  farmerId: 'FARMER_ID',
  amount: 50000,
  currency: 'UGX',
  msisdn: '+256700123456',
});
```

---

## 📊 DATABASE INDEXES

Ensure these indexes exist:

```javascript
// Tips
Tip.index({ farmerId: 1, createdAt: -1 });
Tip.index({ status: 1 });
Tip.index({ psp_reference: 1 });

// Payouts
Payout.index({ farmerId: 1, createdAt: -1 });
Payout.index({ status: 1, next_retry_at: 1 });

// Wallet Transactions
WalletTransaction.index({ walletId: 1, createdAt: -1 });
WalletTransaction.index({ farmerId: 1, createdAt: -1 });
```

---

## 🚀 DEPLOYMENT STEPS

1. **Set environment variables** in Netlify
2. **Install packages**: `npm install`
3. **Build project**: `npm run build`
4. **Deploy to Netlify**
5. **Configure Onafriq webhook URL** in dashboard
6. **Configure Netlify scheduled function** for payouts
7. **Test payment flow** end-to-end
8. **Monitor webhook logs**

---

## 📈 MONITORING & LOGGING

### Log Collection Points:
- Payment checkout creation
- Webhook processing
- Wallet balance updates
- Payout execution
- Payout failures/retries

### Recommended Tools:
- Sentry for error tracking
- LogRocket for session replay
- Custom Onafriq logs table in MongoDB

---

## 🔍 TROUBLESHOOTING

### Payment not confirming:
1. Check webhook is receiving POST requests
2. Verify signature validation passes
3. Check tip exists with correct `psp_reference`
4. Ensure wallet exists for farmer

### Payout failing:
1. Validate phone number format
2. Check minimum threshold met
3. Verify Onafriq API credentials
4. Check PSP balance sufficient
5. Review retry count and next_retry_at

### QR codes not generating:
1. Verify Cloudinary credentials
2. Check farmer/lot exists
3. Test local QR generation first
4. Verify network connectivity

---

## 📞 SUPPORT CONTACTS

- **Onafriq Support**: support@onafriq.com
- **Cloudinary Support**: support@cloudinary.com
- **Platform Issues**: Log in GitHub Issues

---

**Status**: Core implementation complete ✅
**Next Steps**: Create remaining dashboard pages & scheduled function
**Estimated Time**: 2-3 hours for remaining files
