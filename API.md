# 📚 Coffee Trace API Documentation

Complete API reference for Coffee Trace platform.

**Base URL:** `https://your-site.netlify.app/api`  
**Authentication:** JWT via NextAuth.js

---

## 🔐 Authentication

### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "farmer", // or "buyer", "coopAdmin", "investor", "admin"
  "phone": "+256700000000",
  
  // Optional for buyers
  "companyName": "Acme Roasters",
  "businessType": "roaster"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "farmer",
    "createdAt": "2025-11-13T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `409` - Email already exists

---

## 👨‍🌾 Farmers

### GET `/api/farmers`
List all farmers with pagination.

**Query Parameters:**
- `cooperativeId` (optional) - Filter by cooperative
- `page` (default: 1)
- `limit` (default: 20)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "farmers": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Smith",
      "location": {
        "type": "Point",
        "coordinates": [32.5825, 0.3476]
      },
      "farmSize": 2.5,
      "altitude": 1500,
      "certifications": [
        {
          "name": "Organic",
          "issuedDate": "2024-01-15T00:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### POST `/api/farmers`
Create a new farmer profile.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "Jane Smith",
  "cooperativeId": "507f1f77bcf86cd799439012",
  "gender": "female",
  "phone": "+256700000000",
  "location": {
    "coordinates": [32.5825, 0.3476]
  },
  "farmSize": 2.5,
  "altitude": 1500
}
```

**Response (201):**
```json
{
  "message": "Farmer created successfully",
  "farmer": { /* farmer object */ }
}
```

### GET `/api/farmers/[id]`
Get specific farmer details with statistics.

**Response (200):**
```json
{
  "farmer": { /* farmer object */ },
  "lots": [ /* recent lots */ ],
  "stats": {
    "totalYield": 1500,
    "avgYield": 500,
    "totalLots": 12
  }
}
```

### PUT `/api/farmers/[id]`
Update farmer profile.

**Authorization:** Owner, Coop Admin, or System Admin

**Request Body:** (partial updates allowed)
```json
{
  "farmSize": 3.0,
  "altitude": 1600,
  "certifications": [...]
}
```

---

## 📦 Lots & Traceability

### GET `/api/lots`
List coffee lots with filtering.

**Query Parameters:**
- `farmerId` (optional)
- `cooperativeId` (optional)
- `status` (optional) - harvested, processed, stored, listed, sold
- `page`, `limit`

**Response (200):**
```json
{
  "lots": [
    {
      "_id": "507f...",
      "traceId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "variety": "Arabica",
      "quantityKg": 500,
      "harvestDate": "2025-11-01T00:00:00.000Z",
      "status": "harvested",
      "qualityScore": 85,
      "events": [ /* trace events */ ]
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### POST `/api/lots`
Create a new coffee lot.

**Request Body:**
```json
{
  "farmerId": "507f...",
  "harvestDate": "2025-11-01",
  "variety": "Arabica",
  "quantityKg": 500,
  "moisture": 12.5,
  "qualityScore": 85,
  "processingMethod": "washed"
}
```

**Response (201):**
```json
{
  "message": "Lot created successfully",
  "lot": {
    "_id": "507f...",
    "traceId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "qrCodeUrl": "data:image/png;base64,...",
    /* ... other fields ... */
  }
}
```

### GET `/api/lots/[traceId]`
Get lot details by trace ID (public endpoint).

**No authentication required**

**Response (200):**
```json
{
  "lot": {
    "traceId": "a1b2c3d4-...",
    "variety": "Arabica",
    "farmerId": {
      "name": "Jane Smith",
      "location": { /* coordinates */ },
      "certifications": [...]
    },
    "events": [
      {
        "step": "harvested",
        "timestamp": "2025-11-01T08:00:00.000Z",
        "actor": {
          "name": "Jane Smith",
          "role": "farmer"
        },
        "note": "Fresh harvest from hillside plot"
      }
    ]
  }
}
```

### POST `/api/lots/[traceId]/events`
Add a trace event to lot's journey.

**Request Body:**
```json
{
  "step": "processed", // harvested, weighed, processed, dried, etc.
  "gps": {
    "coordinates": [32.5825, 0.3476]
  },
  "photoUrl": "https://...",
  "note": "Wet processing completed",
  "metadata": {
    "processingMethod": "washed",
    "duration": "24 hours"
  }
}
```

**Response (200):**
```json
{
  "message": "Event added successfully",
  "lot": { /* updated lot */ },
  "event": { /* new event */ }
}
```

---

## 🛒 Marketplace

### GET `/api/marketplace`
Browse all available coffee listings (public).

**Query Parameters:**
- `variety` - Coffee variety filter
- `minQuality` - Minimum quality score (0-100)
- `maxPrice` - Maximum price per kg
- `certification` - Filter by certification
- `sortBy` (default: postedAt) - Sort field
- `sortOrder` (default: desc) - asc or desc
- `page`, `limit`

**Response (200):**
```json
{
  "listings": [
    {
      "_id": "507f...",
      "pricePerKg": 8.50,
      "currency": "USD",
      "availableQuantityKg": 450,
      "lotId": {
        "variety": "Arabica",
        "qualityScore": 85,
        "farmerId": {
          "name": "Jane Smith",
          "certifications": [...]
        }
      },
      "status": "open"
    }
  ],
  "pagination": { /* pagination */ }
}
```

### POST `/api/listings`
Create a marketplace listing.

**Request Body:**
```json
{
  "lotId": "507f...",
  "pricePerKg": 8.50,
  "currency": "USD",
  "availableQuantityKg": 450,
  "minQuantityKg": 50,
  "description": "Premium washed Arabica from high-altitude farm",
  "tags": ["organic", "fair-trade"]
}
```

**Response (201):**
```json
{
  "message": "Listing created successfully",
  "listing": { /* listing object */ }
}
```

### GET `/api/listings/[id]`
Get listing details.

**Response (200):**
```json
{
  "listing": {
    "_id": "507f...",
    "lotId": { /* populated lot */ },
    "sellerId": { /* populated seller */ },
    "offers": [ /* populated offers */ ],
    "viewCount": 45,
    /* ... other fields ... */
  }
}
```

---

## 💰 Offers

### POST `/api/listings/[id]/offers`
Make an offer on a listing.

**Authorization:** Buyer role required

**Request Body:**
```json
{
  "amountKg": 100,
  "pricePerKg": 8.00,
  "message": "Interested in long-term partnership"
}
```

**Response (201):**
```json
{
  "message": "Offer created successfully",
  "offer": {
    "_id": "507f...",
    "listingId": "507f...",
    "buyerId": "507f...",
    "amountKg": 100,
    "pricePerKg": 8.00,
    "totalAmount": 800,
    "status": "pending",
    "expiresAt": "2025-11-20T00:00:00.000Z"
  }
}
```

### PUT `/api/offers/[id]`
Accept, reject, or counter an offer.

**Authorization:** Listing owner only

**Request Body (Accept):**
```json
{
  "action": "accept",
  "sellerResponse": "Great! Let's proceed with this order."
}
```

**Request Body (Reject):**
```json
{
  "action": "reject",
  "sellerResponse": "Sorry, already sold."
}
```

**Request Body (Counter):**
```json
{
  "action": "counter",
  "sellerResponse": "Can you meet me halfway?",
  "counterOffer": {
    "pricePerKg": 8.25,
    "amountKg": 100,
    "message": "This is my best price"
  }
}
```

**Response (200):**
```json
{
  "message": "Offer accepted successfully",
  "offer": { /* updated offer */ },
  "transaction": { /* transaction record if accepted */ }
}
```

---

## 📊 Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": "Additional context (development only)"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 🔒 Authorization Rules

### Farmers
- Can create/update own lots
- Can create listings for own lots
- Can view own dashboard data

### Buyers
- Can browse marketplace (public)
- Can make offers on listings
- Can view own offers and purchases

### Coop Admins
- Can view/manage farmers in their cooperative
- Can view aggregated statistics
- Can create lots on behalf of farmers

### Admins
- Full access to all endpoints
- Can deactivate users
- Can view audit trails

---

## 🌐 Rate Limiting

*To be implemented:*
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## 📝 Webhooks (Future)

Planned webhook events:
- `offer.created`
- `offer.accepted`
- `payment.completed`
- `lot.created`

---

**API Version:** 1.0  
**Last Updated:** November 13, 2025  
**Maintained by:** Coffee Trap Agencies Ltd
