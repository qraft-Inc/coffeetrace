# ☕ Coffee Trace

> **Climate-smart, data-driven coffee value chain platform**  
> Enabling full traceability from farm to cup

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7)](https://www.netlify.com/)

---

## 🌍 Overview

Coffee Trace is a comprehensive platform that digitizes the coffee value chain, providing:

- **🔍 Full Traceability**: QR codes and GPS-tagged events for every coffee lot
- **📊 Data Insights**: Real-time yield tracking, quality scoring, and price analytics
- **🌱 Carbon Tracking**: Measure and reduce environmental impact
- **🛒 Marketplace**: Direct connection between farmers and verified buyers
- **💰 Fair Pricing**: Transparent transactions with escrow support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router, RSC) |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Authentication** | NextAuth.js (JWT + credentials) |
| **Styling** | TailwindCSS |
| **Deployment** | Netlify with serverless functions |
| **Maps** | Mapbox GL JS / React Leaflet |
| **QR Codes** | qrcode library |

### Future Integrations
- **Payments**: Flutterwave, MTN MoMo
- **Carbon API**: Climatiq, CoolFarm
- **Storage**: Cloudinary or AWS S3

---

## 📁 Project Structure

```
coffeetrace/
├── app/
│   ├── api/                    # API routes (Netlify Functions)
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── [...nextauth]/route.js  # NextAuth handler
│   │   │   └── signup/route.js         # User registration
│   │   ├── farmers/           # Farmer CRUD
│   │   │   ├── route.js              # GET, POST /api/farmers
│   │   │   └── [id]/route.js         # GET, PUT, DELETE /api/farmers/[id]
│   │   ├── lots/              # Lot & trace management
│   │   │   ├── route.js              # GET, POST /api/lots
│   │   │   └── [traceId]/
│   │   │       ├── route.js          # GET /api/lots/[traceId]
│   │   │       └── events/route.js   # Trace events
│   │   ├── marketplace/       # Public marketplace
│   │   │   └── route.js              # GET /api/marketplace
│   │   ├── listings/          # Listing management
│   │   │   ├── route.js              # GET, POST /api/listings
│   │   │   └── [id]/
│   │   │       ├── route.js          # GET, PUT, DELETE
│   │   │       └── offers/route.js   # Offer management
│   │   └── offers/            # Offer responses
│   │       └── [id]/route.js         # Accept/reject offers
│   ├── auth/                   # Auth pages (signin, signup)
│   │   ├── signin/page.js
│   │   └── signup/page.js
│   ├── dashboard/              # Role-based dashboards
│   │   ├── page.js                   # Dashboard router
│   │   ├── farmer/page.js            # Farmer dashboard
│   │   └── buyer/page.js             # Buyer dashboard
│   ├── marketplace/            # Marketplace UI
│   │   └── page.js                   # Browse listings
│   ├── lot/[traceId]/         # Public trace pages (QR destination)
│   │   └── page.js
│   ├── layout.js              # Root layout with SessionProvider
│   ├── page.js                # Landing page
│   └── globals.css            # Global styles
├── models/                     # Mongoose schemas
│   ├── User.js                # User accounts
│   ├── Farmer.js              # Farmer profiles
│   ├── Cooperative.js         # Cooperatives
│   ├── Buyer.js               # Buyer profiles
│   ├── Lot.js                 # Coffee lots with traceability
│   ├── Listing.js             # Marketplace listings
│   ├── Offer.js               # Purchase offers
│   ├── Transaction.js         # Payment transactions
│   └── AuditTrail.js          # System audit log
├── lib/                        # Utilities
│   ├── dbConnect.js           # MongoDB connection cache
│   ├── authOptions.js         # NextAuth config
│   ├── generateQRCode.js      # QR code generation
│   └── formatters.js          # Currency & date utilities
├── components/                 # React components
│   ├── Providers.js           # SessionProvider wrapper
│   └── FarmMap.js             # Mapbox map component
├── public/                     # Static assets
├── middleware.js              # Route protection & RBAC
├── netlify.toml               # Netlify config
├── tailwind.config.js         # Tailwind config
├── package.json
├── README.md                  # This file
├── SETUP.md                   # Setup guide
├── DEPLOYMENT.md              # Deployment checklist
└── API.md                     # API documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Netlify account (for deployment)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/coffeetrace.git
cd coffeetrace
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coffeetrace

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Mapbox (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Database Models

### Core Entities

1. **User** - All platform users (farmers, buyers, admins)
2. **Farmer** - Extended farmer profile with farm data
3. **Cooperative** - Farmer cooperatives/organizations
4. **Buyer** - Roasters, exporters, traders
5. **Lot** - Coffee batches with full trace events
6. **Listing** - Marketplace listings
7. **Offer** - Buyer offers on listings
8. **Transaction** - Completed purchases
9. **AuditTrail** - System-wide audit log

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` ✅ - Register new user
- `POST /api/auth/signin` - Sign in (via NextAuth)
- `GET /api/auth/session` - Get current session

### Farmers
- `GET /api/farmers` ✅ - List all farmers (paginated)
- `POST /api/farmers` ✅ - Create farmer profile
- `GET /api/farmers/[id]` ✅ - Get farmer details
- `PUT /api/farmers/[id]` ✅ - Update farmer
- `DELETE /api/farmers/[id]` ✅ - Deactivate farmer

### Lots & Traceability
- `GET /api/lots` ✅ - List lots (filtered by farmer)
- `POST /api/lots` ✅ - Create new lot with QR code
- `GET /api/lots/[traceId]` ✅ - Get lot by trace ID (public)
- `POST /api/lots/[traceId]/events` ✅ - Add trace event
- `GET /api/lots/[traceId]/events` ✅ - Get trace timeline

### Marketplace
- `GET /api/marketplace` ✅ - Browse all listings (public, filtered)
- `GET /api/listings` ✅ - Get user's listings
- `POST /api/listings` ✅ - Create listing
- `GET /api/listings/[id]` ✅ - Get listing details
- `PUT /api/listings/[id]` ✅ - Update listing
- `DELETE /api/listings/[id]` ✅ - Cancel listing
- `POST /api/listings/[id]/offers` ✅ - Create offer
- `GET /api/listings/[id]/offers` ✅ - Get offers (seller only)

### Offers
- `GET /api/offers/[id]` ✅ - Get offer details
- `PUT /api/offers/[id]` ✅ - Accept/reject/counter offer

**✅ = Fully Implemented**

📚 See [API.md](./API.md) for complete documentation with request/response examples.

---

## 🎨 User Roles & Dashboards

| Role | Access |
|------|--------|
| **Farmer** | Manage lots, view yields, create listings |
| **Coop Admin** | Manage cooperative farmers, aggregate stats |
| **Buyer** | Browse marketplace, make offers, track purchases |
| **Investor** | View impact portfolio, financed lots |
| **Admin** | System management, user verification |

---

## 🌐 Deployment to Netlify

### 1. Connect Repository

1. Push code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Select your repository

### 2. Configure Build

Netlify automatically detects Next.js. Verify settings:

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

### 3. Set Environment Variables

In Netlify dashboard → Site settings → Environment variables:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your netlify domain)

### 4. Deploy

```bash
git push origin main
```

Netlify will auto-deploy on every push to `main`.

---

## 🗺️ Roadmap

### ✅ Phase 1 (Completed)
- [x] Project scaffolding & configuration
- [x] Database models (9 schemas)
- [x] Authentication (NextAuth with JWT)
- [x] Farmer CRUD API
- [x] Lot management with trace events
- [x] QR code generation
- [x] Marketplace API (listings & offers)
- [x] Landing page
- [x] Auth pages (signin/signup)
- [x] Public trace page (QR destination)
- [x] Marketplace browsing page
- [x] Role-based dashboards (Farmer & Buyer)
- [x] Route protection middleware
- [x] Mapbox integration component

### 🚧 Phase 2 (In Progress)
- [ ] Lot creation form with map picker
- [ ] Listing creation UI
- [ ] Offer management UI
- [ ] Farm profile management
- [ ] Image upload (Cloudinary)
- [ ] Email notifications
- [ ] Search & filters enhancement

### 📅 Phase 3 (Planned)
- [ ] Payment integration (Flutterwave)
- [ ] Mobile money support (MTN MoMo)
- [ ] Carbon footprint API integration
- [ ] Advanced analytics dashboards
- [ ] Coop admin dashboard
- [ ] System admin panel
- [ ] Export reports (PDF)

### 🔮 Phase 4 (Future)
- [ ] Investor portal
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Mobile PWA optimization
- [ ] Offline mode
- [ ] Blockchain integration
- [ ] AI-powered quality prediction

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- **Email**: support@coffeetrace.app
- **Docs**: [docs.coffeetrace.app](https://docs.coffeetrace.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/coffeetrace/issues)

---

**Built with ❤️ for sustainable coffee farming**
#   c o f f e e t r a c e  
 