Got you — here is the **pure markdown**, clean and ready to paste directly into `README.md` with **no explanations**.

---

# **CoffeeTrace – Climate-Smart Coffee Value Chain Platform**

*A data-driven, transparent, and climate-smart digital ecosystem for the coffee sector.*

---

## 🚀 Overview

**CoffeeTrace** is a full-stack digital platform built with **Next.js**, **MongoDB Atlas**, and **Netlify** to bring transparency, traceability, and climate-smart insights to the coffee value chain.
It provides digital tools for farmers, cooperatives, exporters, buyers, and roasters — enabling real-time data from **farm to cup**.

---

## 🧩 Platform Modules

CoffeeTrace contains **five role-based applications** inside one unified Next.js monorepo:

### **1. Farmer App**

* Farmer registry & profiles
* GPS farm mapping
* Yield analytics
* Climate-smart advisory

### **2. Cooperative / Processing App**

* Batch intake & digital processing logs
* Drying, fermentation, roasting records
* Quality control scores (moisture, defects, cupping)

### **3. Exporter & Marketplace App**

* Lot creation & traceability
* Certifications & COA uploads
* Marketplace listings
* Pricing intelligence dashboard

### **4. Buyer / Roaster Portal**

* Lot discovery & ordering
* Traceability viewer (QR-enabled)
* Sustainability data & carbon footprint

### **5. Admin / Impact Dashboard**

* System-wide monitoring
* ESG & climate indicators
* User & permissions management

---

## 🛠️ Tech Stack

### **Frontend**

* Next.js 14 (App Router)
* React Server Components
* TailwindCSS
* ShadCN UI

### **Backend**

* Netlify serverless functions
* MongoDB Atlas (Node.js native driver)
* JWT authentication (optional NextAuth)
* Cloudinary (media storage)

### **Dev Tools**

* TypeScript
* ESLint / Prettier
* GitHub Actions (optional CI/CD)

---

## 📁 Project Structure

```
/app
  /auth
  /farmer
  /coop
  /exporter
  /buyer
  /admin

/app/api
  /auth
  /farmer
  /trace
  /marketplace
  /uploads
```

---

## 🔐 Environment Variables

Create a file named `.env.local`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/coffeetrace
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

For Netlify, add these under:

**Site Settings → Build & Deploy → Environment Variables**

---

## ⚡ Netlify Deployment Notes

### Prevent DB Access During Prerender

Pages requiring DB must include:

```js
export const dynamic = "force-dynamic";
```

### Environment Variable Guard

```js
if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI missing — skipping DB call during build");
  return null;
}
```

### useSearchParams Fix

Client-only pages should begin with:

```js
"use client";
```

Especially in authentication pages.

---

## 🧪 Running Locally

```bash
npm install
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 📌 Key Features

### 🌱 Farmer Data & Mapping

* GPS mapping
* Farm registry
* Yield estimates
* Agronomy insights

### 🔗 Traceability Engine

* Lot creation
* QR-based tracking
* Chain-of-custody events
* Digital COI/COA

### 🔍 Quality & Processing Tools

* Moisture readings
* Roast profiling
* Cupping forms
* Defect scoring

### 🛒 Marketplace

* Lot listings
* Offers & negotiations
* Buyer messaging
* Export documentation

### 📊 Impact & ESG Dashboard

* Climate indicators
* Carbon footprint
* Farmer income visibility

---

## 🤝 Contributing

```bash
git checkout -b feature/my-feature
git commit -m "Add new feature"
git push origin feature/my-feature
```

PRs welcome.

---

## 📄 License

MIT License.

---

## 🌍 Vision

To build a transparent, climate-smart, and inclusive digital coffee value chain that elevates smallholder farmers and connects them directly to global markets.
