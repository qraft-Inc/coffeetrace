# CoffeeTrace Marketplace Rebuild Blueprint

**Status:** Planning Phase  
**Goal:** Convert marketplace from dual-click chooser pattern to single-page Airbnb-style experience  
**Timeline:** Sequential implementation with testing after each phase

---

## 1. PROBLEM → SOLUTION MAPPING

| Problem | Why It Matters | Solution |
|---------|----------------|----------|
| **Two-click to listings** | Users bounce before seeing products | Remove chooser, default to coffee grid with tabs |
| **Missing filters** | Specialty buyers can't find by region/processing | Add Region, Processing method, Lot size, Harvest year filters |
| **Grade buried in details** | AA vs B is first decision, should be visible | Grade badge + Quality score visible on card surface |
| **GPS not highlighted** | Major competitive advantage ignored | "GPS Verified" badge on cards, Add map view toggle |
| **Generic marketplace** | Looks like eBay, not specialty coffee platform | Specialty-first design: Region → Processing → Grade visibility |

---

## 2. INFORMATION ARCHITECTURE

### Current Routes
```
/marketplace → Chooser page (remove this)
  /marketplace/coffee → Coffee listings
  /marketplace/agro-inputs → Agro inputs
  /marketplace/products → Products
/marketplace/coffee/[id] → MISSING (add detail page)
```

### New Routes
```
/marketplace → Coffee listings (default view)
  Tabs: Coffee | Agro-Inputs | Products
  View toggles: Grid | List | Map
  
/marketplace/coffee/[id] → Coffee lot detail (NEW)
  Full specs, traceability chain, purchase options
  
/marketplace/agro → Agro-inputs (same structure as coffee)
/marketplace/products → Products (same structure)
```

### URL Structure with Persistent Filters
```
/marketplace?variety=Arabica&region=Rwenzori&processing=Washed&minQuality=80&maxPrice=5&sort=score

Allows shareable filter URLs → Specialty buyers can send "I want Rwenzori washed AA" links
```

---

## 3. VISUAL LAYOUT BLUEPRINT

### Desktop (≥ 1024px)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                  │
│  └─ Logo │ Coffee [TAB] │ Agro-Inputs │ Products │   Grid List Map [ICONS] │
├───────────────────────────────────┬────────────────────────────────────┤
│ SIDEBAR (220px, sticky)           │ MAIN AREA (responsive grid)        │
│                                   │                                     │
│ FILTERS                           │ Sort: [Newest ▼]    Results: 47    │
│ ────────                          │                                     │
│ Variety □                         │ ┌──────┐ ┌──────┐ ┌──────┐       │
│ ├• Arabica                        │ │Lot 1 │ │Lot 2 │ │Lot 3 │       │
│ ├• Robusta                        │ │[AA]✓ │ │[A]   │ │[AA]  │       │
│ ├• SL28                           │ │      │ │      │ │      │       │
│ └• Geisha                         │ │500kg │ │400kg │ │750kg │       │
│                                   │ │$5.20 │ │$4.80 │ │$6.50 │       │
│ Region ☑                          │ │Score:│ │Score:│ │Score:│       │
│ ├• Fort Portal                    │ │ 89   │ │ 76   │ │ 92   │       │
│ ├• Mt. Elgon                      │ └──────┘ └──────┘ └──────┘       │
│ ├• Rwenzori                       │                                     │
│ ├• Kibale                         │ ┌──────┐ ┌──────┐ ┌──────┐       │
│ └• Other                          │ │Lot 4 │ │Lot 5 │ │Lot 6 │       │
│                                   │ │[B]   │ │[AA]  │ │[A]   │       │
│ Processing □                      │ │      │ │      │ │      │       │
│ ├• Washed                         │ └──────┘ └──────┘ └──────┘       │
│ ├• Natural                        │                                     │
│ ├• Honey                          │ [ Prev ] Page 1 of 4 [ Next ]     │
│ └• Wet-Hulled                     │                                     │
│                                   │                                     │
│ Quality Score                     │                                     │
│ [60●─────────100]                 │                                     │
│                                   │                                     │
│ Price per kg                      │                                     │
│ [$2●───────────$10]               │                                     │
│                                   │                                     │
│ Certification ☑                   │                                     │
│ ├• Organic                        │                                     │
│ ├• Fair Trade                     │                                     │
│ └• Rainforest Alliance            │                                     │
│                                   │                                     │
│ Lot Size ☑                        │                                     │
│ ├• 50kg                           │                                     │
│ ├• 200kg                          │                                     │
│ └• 500kg+                         │                                     │
│                                   │                                     │
│ [Clear All]  [Apply Filters]      │                                     │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────────────┐
│ [☰] Logo    [Grid List Map] │ ← Header
├────────────────────────────┤
│ [Filters ▼] Sort: [Newest ▼]│
├────────────────────────────┤
│ Coffee | Agro-Inputs       │
├────────────────────────────┤
│                            │
│ ┌──────────────────────┐   │
│ │ Lot 1              │   │
│ │ [AA] ✓ GPS         │   │
│ │                    │   │
│ │ Coffee Lot         │   │
│ │ Region             │   │
│ │ 500kg • $5.20/kg   │   │
│ │ Score: 89          │   │
│ │ Farmer Name        │   │
│ │ [View lot →]       │   │
│ └──────────────────────┘   │
│                            │
│ ┌──────────────────────┐   │
│ │ Lot 2              │   │
│ │ [A]                │   │
│ │ ...                │   │
│ └──────────────────────┘   │
│                            │
│ [ Prev ] Page 1 of 4 ...   │
│                            │
```

Sidebar appears as **drawer overlay** when filters button clicked:
```
┌──────────────────────────────┐
│ Filters              [✕]     │
├──────────────────────────────┤
│ Variety □                    │
│ ├• Arabica    ☑              │
│ ├• Robusta                   │
│ ├• SL28                      │
│ └• Geisha                    │
│                              │
│ Region ☑                     │
│ ├• Fort Portal   ☑           │
│ ├• Mt. Elgon                 │
│ ├• Rwenzori      ☑           │
│ └• Kibale                    │
│                              │
│ [Clear All] [Apply Filters]  │
└──────────────────────────────┘
```

---

## 4. LOT CARD SPECIFICATIONS

### Grid Card Design
```
┌─────────────────────────────────┐
│ ╔════════════════════════════╗  │
│ ║                            ║  │
│ ║     Farm Photo             ║  │ ← Image 300x200px
│ ║     OR Placeholder Gradient║  │
│ ║                            ║  │
│ ║  [AA]  top-left overlay    ║  │ ← Grade badge
│ ║         (coffee-900 bg,    ║  │
│ ║         white text, bold)  ║  │
│ ║                    ✓ GPS   ║  │ ← Verified badge (top-right)
│ ║                  (green)   ║  │
│ ╚════════════════════════════╝  │
│                                  │
│ Coffee Lot Name                  │ ← Bold, coffee-900
│ Rwenzori Region                  │ ← Secondary text
│ 500 kg available · $5.20/kg      │ ← Key specs, truncate
│                                  │
│ Quality Score: [89] (green pill) │ ← Prominent badge
│ Certifications: [Organic]        │ ← Max 2 shown
│                                  │
│ Farmer Co-op Name                │ ← Gray text
│ [View lot →]                     │ ← Link (primary color)
└─────────────────────────────────┘
```

### List View Item
```
┌─────┬──────────────────────────────────────────────────────────┐
│     │ Coffee Lot Name                                          │
│200px│ Rwenzori | Washed | 500kg | AA Grade | Score: 89       │
│ img │                                                          │
│     │ Farmer Co-op | $5.20/kg | [Organic] [Fair Trade]      │
│     │ [View lot →]                                            │
└─────┴──────────────────────────────────────────────────────────┘
```

### Lot Detail Page (`/marketplace/coffee/[id]`)
```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
│ [Back]  Coffee Lot Name    [Share] [Save]             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Image Gallery / Carousel]   [AA] Grade Badge         │
│ (250x250 main + thumbnails)  [✓ GPS Verified]        │
│                              [Quality: 89]            │
│                                                        │
├─────────────────────────────────────────────────────────┤
│ LOT SPECIFICATIONS                                     │
│                                                        │
│ Variety: Arabica          Quality Score: 89          │
│ Region: Rwenzori          Processing: Washed         │
│ Harvest: Main 2025        Lot Size: 500kg            │
│ Price: $5.20/kg           Available: 500kg           │
│ Moisture: 11.5%           Altitude: 1600-1800m       │
│                                                        │
├─────────────────────────────────────────────────────────┤
│ FARM INFORMATION                                       │
│                                                        │
│ Farmer: James Okello (Rwenzori Farmers Coop)         │
│ Region: Fort Portal District, Uganda                 │
│ Farm Size: 2.5 hectares                              │
│                                                        │
│ [GPS Map Widget - Leaflet]                           │
│ Shows farm location with marker + boundary (if available)│
│                                                        │
├─────────────────────────────────────────────────────────┤
│ TRACEABILITY CHAIN                                     │
│                                                        │
│ ✓ Harvested      Jan 12, 2025 - GPS: 0.35N, 32.10E  │
│   James Okello harvested 500kg of ripe cherries      │
│                                                        │
│ ✓ Processed      Jan 13, 2025 - GPS: 0.35N, 32.10E  │
│   Dried for 20 days using washed method              │
│                                                        │
│ ✓ Graded         Jan 28, 2025 - GPS: 0.35N, 32.10E  │
│   SCA cupping score: 89. Grade: AA                   │
│                                                        │
│ ✓ Listed         Feb 1, 2025                          │
│   Available for purchase on CoffeeTrace               │
│                                                        │
├─────────────────────────────────────────────────────────┤
│ CERTIFICATIONS                                         │
│                                                        │
│ [Organic] Issued by Uganda Organic Certifiers      │
│ [Fair Trade] Valid through Dec 2025                │
│ [EUDR Compliant] Deforestation Risk: Low            │
│                                                        │
├─────────────────────────────────────────────────────────┤
│                                                        │
│ [Add to Cart]  [Contact Farmer]  [Schedule Call]    │
│                                                        │
│ Similar Lots:                                         │
│ [Lot Card] [Lot Card] [Lot Card]                     │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 5. FILTER SPECIFICATIONS

### Variety Filter
```
Type: Dropdown with checkboxes
Options: Arabica, Robusta, SL28, Geisha, Other
Default: All selected
```

### Region Filter
```
Type: Multi-select checkboxes
Options:
  • Fort Portal (natural home of Ugandan arabica)
  • Mt. Elgon (high altitude, floral notes)
  • Rwenzori (most prestigious, 1600-2000m)
  • Kibale (lower altitude, bold body)
  • Other (outside Uganda/regional)
Default: All
Note: These are REAL coffee regions in Uganda with distinct cup profiles
```

### Processing Method
```
Type: Multi-select checkboxes
Options:
  • Washed (clean, bright acidity)
  • Natural (fruity, full body)
  • Honey (balanced, caramel notes)
  • Wet-Hulled (earthy, low acidity)
Default: All
Note: Processing method heavily influences cup profile - buyers filter hard on this
```

### Quality Score (Range Slider)
```
Type: Range slider
Range: 60 (lowest acceptable) to 100 (perfect cupping)
Default: 60-100
Units: SCA cupping score
Breaks:
  60-74: Grade B (commercial grade)
  75-86: Grade A (specialty)
  87+:   Grade AA (premium specialty)
```

### Price per kg (Range Slider)
```
Type: Range slider
Range: $1 to $15/kg
Default: $1-$15
Currency: USD (default, show conversion helper for UGX/KES/RWF)
Step: $0.50
```

### Certification
```
Type: Multi-select checkboxes
Options:
  • Organic (no synthetic inputs)
  • Fair Trade (farmer premium paid)
  • Rainforest Alliance (conservation)
  • EUDR Compliant (no deforestation risk)
Default: All
```

### Lot Size
```
Type: Multi-select checkboxes
Options:
  • 50kg (small roastery/cafe)
  • 200kg (medium roastery)
  • 500kg+ (exporter/large buyer)
Default: All
Logic: Each lot shows available quantity; filter matches minimum threshold
```

### Harvest Season
```
Type: Multi-select checkboxes
Options:
  • 2025 Main (Jan-Mar harvest)
  • 2025 Fly (Oct-Dec harvest)
  • 2024 Main (Jan-Mar harvest)
  • 2024 Fly (Oct-Dec harvest)
Default: All
Note: Season affects cup profile (main crop vs fly crop ripeness)
```

---

## 6. VIEW TOGGLE SPECIFICATIONS

### Icons Used (Lucide React)
```javascript
import { Grid3x3, List, MapPin } from 'lucide-react';

// Toggle buttons (top-right of main area)
<div className="flex gap-2">
  <button 
    onClick={() => setView('grid')}
    className={`p-2 rounded ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-coffee-900'}`}
  >
    <Grid3x3 className="h-5 w-5" />
  </button>
  <button 
    onClick={() => setView('list')}
    className={`p-2 rounded ${view === 'list' ? 'bg-primary-600 text-white' : 'text-coffee-900'}`}
  >
    <List className="h-5 w-5" />
  </button>
  <button 
    onClick={() => setView('map')}
    className={`p-2 rounded ${view === 'map' ? 'bg-primary-600 text-white' : 'text-coffee-900'}`}
  >
    <MapPin className="h-5 w-5" />
  </button>
</div>
```

### Grid View (Default)
```
- Responsive columns: md:grid-cols-2 lg:grid-cols-3
- Card size: max-width 300px
- Gap: sm:gap-4 lg:gap-6
- Scroll: Vertical infinite scroll OR pagination
```

### List View
```
- Single column
- Full width cards
- More details visible without expansion
- Compact format for power users
```

### Map View
```
- Full width Leaflet map component
- Height: 600px or full viewport below nav
- Features:
  - Lot pins colored by quality score (red < 75, orange 75-87, green >= 87)
  - Click pin → Popup with lot name + price + "View details" link
  - Zoom/pan controls enabled
  - Center on Uganda (coordinates: [-1.9403, 29.8739], zoom: 7)
- Fallback for lots without GPS: "GPS coordinates not yet logged"
- Side panel on desktop shows lot list (sync scrolling with map)
```

---

## 7. SORT OPTIONS

```
Dropdown: Current Sort ▼

Options:
  • Newest first (default) - Most recently posted
  • Highest quality score - 100 descending to 60
  • Price low to high - Ascending by price/kg
  • Price high to low - Descending by price/kg
  • Lot size large to small - Ascending available kg
```

---

## 8. COLOR PALETTE & TYPOGRAPHY

### Colors
```javascript
Primary Brown:    #5C3D1E (coffee-900)  // Main text
Accent Green:     #2D6A4F (primary-700) // Buttons, highlights
Light Green:      #EEF4E8 (primary-50)  // Tag backgrounds
Coffee Light:     #f9f5f0 (coffee-50)   // Backgrounds
Coffee Dark:      #38261a (coffee-900)  // Deep text

Badges:
- Grade (AA/A/B/C):    coffee-900 bg, white text
- Quality Score:        primary-600 bg, white text, pill-shaped
- GPS Verified:         primary-600 text, white checkmark icon
- Certification:        primary-50 bg, primary-700 text
- Views:               primary-600 border on active toggle
```

### Typography
```
Hero/Titles:  Headings h2 (text-4xl font-bold text-coffee-900)
Subheads:     text-lg font-semibold text-coffee-700
Card Title:   text-base font-bold text-coffee-900
Labels:       text-sm font-medium text-coffee-600
Metadata:     text-xs text-coffee-500 (muted)
```

---

## 9. RESPONSIVE BREAKPOINTS

| Breakpoint | Device | Sidebar | Grid | Other |
|-----------|--------|---------|------|-------|
| < 640px | Mobile | Drawer (full overlay) | 1 col | No map initially |
| 640-767px | Small tablet | Drawer | 1 col | Map underneath |
| 768-1023px | Tablet | Side-by-side, 180px | 2 cols | Full width map |
| 1024px+ | Desktop | Sticky, 220px | 3 cols | Side panel map |

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Structural Changes (Day 1)
- [ ] Remove `/marketplace` chooser page (redirect to `/marketplace/coffee`)
- [ ] Create `/app/marketplace/coffee/page.js` as default coffee view
- [ ] Add Coffee/Agro-Inputs tabs to navigation
- [ ] Implement sidebar + grid layout (basic grid without filters)

### Phase 2: Filters (Day 2)
- [ ] Implement all 8 filter controls in sidebar
- [ ] Add filter state management (useState + useEffect)
- [ ] Connect filters to API query params
- [ ] Add "Clear All" + "Apply Filters" buttons
- [ ] Add filter persistence in URL

### Phase 3: Card & View Upgrades (Day 2-3)
- [ ] Upgrade LotCard with Grade badge + GPS badge + Quality score pill
- [ ] Implement Grid view (responsive columns)
- [ ] Implement List view (single column + more details)
- [ ] Implement Map view (Leaflet pins colored by quality score)
- [ ] Add view toggle buttons

### Phase 4: Sorting & UX (Day 3)
- [ ] Add sort dropdown
- [ ] Implement sort logic in API call
- [ ] Add results counter
- [ ] Test pagination with new filters
- [ ] Mobile drawer for filters

### Phase 5: Detail Page (Day 4)
- [ ] Create `/marketplace/coffee/[id]/page.js` detail page
- [ ] Add image gallery + badges
- [ ] Add lot specifications section
- [ ] Add farm info + map widget
- [ ] Add traceability chain with events
- [ ] Add similar lots carousel

### Phase 6: Polish & Testing (Day 5)
- [ ] Mobile responsiveness full QA
- [ ] URL sharing (filter persistence)
- [ ] Performance optimization (image lazy-loading, map lazy-load)
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Cross-browser testing

---

## 11. DATABASE/API UPDATES REQUIRED

### New fields needed in Lot model:
```javascript
// If not present, add:
region: {
  type: String,
  enum: ['Fort Portal', 'Mt. Elgon', 'Rwenzori', 'Kibale', 'Other']
}

harvestYear: {
  type: Number,
  default: new Date().getFullYear()
}

harvestSeason: {
  type: String,
  enum: ['Main', 'Fly'],
  default: 'Main'
}

// Enhance existing:
qualityScore: Number  // Already exists, compute grade from this
gradeScore: {         // Computed, not stored: 87+ = AA, 75-86 = A, 60-74 = B, <60 = C
  type: String,
  get() {
    if (this.qualityScore >= 87) return 'AA';
    if (this.qualityScore >= 75) return 'A';
    if (this.qualityScore >= 60) return 'B';
    return 'C';
  }
}
```

### API Route Updates:
```
GET /api/marketplace?
  variety=Arabica
  &region=Rwenzori
  &processingMethod=Washed
  &minQuality=80
  &maxPrice=6
  &certification=organic
  &minLotSize=50
  &harvestYear=2025
  &harvestSeason=Main
  &sortBy=qualityScore
  &sortOrder=desc
  &page=1
  &limit=12
```

---

## 12. SUCCESS METRICS

After rebuild:
- ✅ Users reach coffee listings in **1 click** (not 2)
- ✅ **Specialty buyers** can filter by Region + Processing + Grade
- ✅ **Grade (AA/A/B/C) visible on card** without clicking
- ✅ **GPS verified badge** highlights sourcing transparency
- ✅ **Map view** attracts users wanting to see farm locations
- ✅ **Mobile responsive** with filter drawer on touch devices
- ✅ **Shareable URLs** with filter presets
- ✅ **Detail page** provides full traceability story
- ✅ Similar to Airbnb/Faire.com in UX — specialized marketplace, not generic listing board

---

## 13. TECHNICAL DEBT / NICE-TO-HAVES (Post-MVP)

- [ ] **Advanced search:** "Find me Rwenzori with floral notes" (AI matching)
- [ ] **Saved searches:** Come back to "My Rwenzori filters"
- [ ] **Lot alerts:** "Notify me when AA lots > 1 tonne available at $<5"
- [ ] **Cupping notes preview:** Show customer review/tasting notes
- [ ] **Bulk order discounts:** "Order 2+ tonnes, get 5% off"
- [ ] **Instant checkout:** "Buy now" vs current "View lot" workflow
- [ ] **Farmer ratings:** Buyer reviews of farmer quality/timeliness
- [ ] **Harvest calendar:** "When is Main season picking for Rwenzori?"

---

## READY FOR IMPLEMENTATION ✓

This blueprint provides:
✓ Visual mockups for all views
✓ Component architecture  
✓ Filter specifications
✓ API changes needed
✓ Responsive design specs
✓ Color/typography system
✓ Implementation phases
✓ Success metrics

**Next step:** Execute Phase 1 (Structural Changes) using the implementation prompt provided.

