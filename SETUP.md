# ☕ Coffee Trace - Setup Guide

Complete guide to get Coffee Trace running locally and deploy to Netlify.

---

## 📋 Prerequisites

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas/register))
- **Netlify** account ([Sign up](https://app.netlify.com/signup))
- **Mapbox** account for maps ([Get free token](https://account.mapbox.com/))
- **Git** installed

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies

```powershell
# Clone the repository
git clone https://github.com/yourusername/coffeetrace.git
cd coffeetrace

# Install dependencies
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier is fine)
3. Click **Connect** → **Connect your application**
4. Copy the connection string

### 3. Configure Environment Variables

Create `.env.local` in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coffeetrace?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-32-character-secret-here

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token_here

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Generate NEXTAUTH_SECRET:**
```powershell
# Run this in PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 4. Start Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Application

### Create Test Users

1. Go to `/auth/signup`
2. Create a **farmer** account
3. Create a **buyer** account

### Test Farmer Workflow

1. Sign in as farmer
2. Go to `/dashboard/farmer`
3. Create a new lot (you'll need to build the form first)
4. View the lot's trace page via QR code

### Test Buyer Workflow

1. Sign in as buyer
2. Go to `/marketplace`
3. Browse available listings
4. Make an offer on a listing

---

## 🌐 Deployment to Netlify

### 1. Push to GitHub

```powershell
git init
git add .
git commit -m "Initial commit - Coffee Trace platform"
git branch -M main
git remote add origin https://github.com/yourusername/coffeetrace.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and select your repository
4. Build settings are auto-detected from `netlify.toml`

### 3. Configure Environment Variables

In Netlify dashboard → **Site settings** → **Environment variables**, add:

```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-site.netlify.app
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token
```

### 4. Deploy

Click **Deploy site**. Netlify will build and deploy automatically.

Your site will be live at: `https://your-site-name.netlify.app`

---

## 🔌 API Endpoints Reference

### Authentication
```
POST   /api/auth/signup          # Register new user
POST   /api/auth/signin          # Sign in (via NextAuth)
GET    /api/auth/session         # Get current session
```

### Farmers
```
GET    /api/farmers              # List farmers
POST   /api/farmers              # Create farmer
GET    /api/farmers/[id]         # Get farmer details
PUT    /api/farmers/[id]         # Update farmer
DELETE /api/farmers/[id]         # Deactivate farmer
```

### Lots & Traceability
```
GET    /api/lots                 # List lots
POST   /api/lots                 # Create lot
GET    /api/lots/[traceId]       # Get lot by trace ID (public)
POST   /api/lots/[traceId]/events # Add trace event
GET    /api/lots/[traceId]/events # Get trace events
```

### Marketplace
```
GET    /api/marketplace          # Browse listings (public)
GET    /api/listings             # Get user's listings
POST   /api/listings             # Create listing
GET    /api/listings/[id]        # Get listing details
PUT    /api/listings/[id]        # Update listing
DELETE /api/listings/[id]        # Cancel listing
POST   /api/listings/[id]/offers # Create offer
GET    /api/listings/[id]/offers # Get offers (seller only)
```

### Offers
```
GET    /api/offers/[id]          # Get offer details
PUT    /api/offers/[id]          # Accept/reject/counter offer
```

---

## 📱 Frontend Routes

### Public Routes
```
/                                 # Landing page
/marketplace                      # Browse coffee listings
/lot/[traceId]                   # Public trace page (QR destination)
/auth/signin                     # Sign in page
/auth/signup                     # Sign up page
```

### Protected Routes (require authentication)
```
/dashboard                        # Main dashboard (redirects by role)
/dashboard/farmer                 # Farmer dashboard
/dashboard/buyer                  # Buyer dashboard
/dashboard/coop                   # Cooperative admin dashboard
/dashboard/admin                  # System admin dashboard
```

---

## 🧩 Next Steps to Build

### Essential Features

1. **Lot Creation Form** (`/dashboard/farmer/lots/new`)
   - Harvest date picker
   - Variety selector
   - Quantity input
   - GPS location picker (using map)

2. **Listing Creation** (`/dashboard/farmer/listings/new`)
   - Select lot to list
   - Set price
   - Set min/max quantities

3. **Offer Management**
   - Accept/reject offers
   - Counter-offer UI
   - Notification system

4. **Payment Integration**
   - Flutterwave SDK
   - MTN MoMo integration
   - Transaction tracking

5. **File Upload**
   - Cloudinary integration
   - Photo upload for trace events
   - Certificate uploads

### Nice-to-Have Features

- Email notifications (SendGrid, Resend)
- SMS notifications (Twilio, Africa's Talking)
- Export to PDF (trace reports)
- Analytics dashboard
- Multi-language support
- Mobile PWA optimization

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
- Verify `MONGODB_URI` in `.env.local`
- Check IP whitelist in MongoDB Atlas (allow `0.0.0.0/0` for development)
- Ensure network access is enabled

### "Map not loading"
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Check browser console for errors
- Ensure token is valid on Mapbox dashboard

### "Session undefined in API route"
- Make sure `NEXTAUTH_SECRET` is set
- Restart dev server after changing env variables
- Clear browser cookies and re-login

### Build errors on Netlify
- Check build logs in Netlify dashboard
- Verify all environment variables are set
- Ensure Node version matches (18+)

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [MongoDB Mongoose](https://mongoosejs.com/docs/guide.html)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/yourusername/coffeetrace/issues)
- Email: support@coffeetrace.app
- Visit: [Coffee Trap Agencies Ltd](http://coffeetrapagencies.com)

---

**Happy Coding! ☕🌱**
