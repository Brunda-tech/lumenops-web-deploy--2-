# LumenOps — BESCOM Outage Clustering, Crew Dispatch & Citizen Portal

**LumenOps** is a full-stack power distribution operations platform built for **BESCOM** (Bangalore Electricity Supply Company) across Bengaluru and its Regional Circles. It merges duplicate citizen outage reports using spatial **DBSCAN clustering**, ranks fault incidents by real-time priority scoring, visualizes the grid in both an interactive **3D WebGL Digital Twin** and a **2D OpenStreetMap GIS view**, and includes an integrated **Citizen Self-Service Portal** (outage tracking, RR-number bill payment, and new connection applications).

---

## Key Features

### 1. Operations Command & Spatial Deduplication
- **DBSCAN Spatial Clustering**: Automatically merges multi-channel outage reports (Helpline 1912, Mobile App, Web Portal, Social Media, and CSV batch imports) within configurable Haversine distance (`eps`) and density (`minPts`) thresholds into unified fault incidents—preventing duplicate ticket clutter.
- **Duplicate Merge Audit & Simulator**: Inspect linked citizen RR numbers and intake channels per cluster, and test deduplication live with **Simulate +5 Duplicates** or **Monsoon Surge (+18)** controls.
- **Explainable Priority Scoring**: Ranks every cluster in real time using:
  `Priority = w1 × Consumers + w2 × Duration(m) + w3 × CriticalLoad`
  with interactive weight tuning in the **Analytics** workspace.
- **SLA Breach Tracking & Escalation**: Tracks per-priority SLA windows (`HIGH`: 90 min, `MEDIUM`: 120 min, `LOW`: 180 min), flags overdue outages as `SLA Breached`, and supports **Executive Engineer escalation**.
- **Field Root Cause Diagnosis & Dispatch Audit Log**: Tag root causes (`DTR Fuse Blown`, `11kV Cable Fault`, `Tree Branch on Line`, `RMU Breaker Trip`, `Substation Overload`) and review a chronological control room event stream.

### 2. Interactive 3D Grid Digital Twin & 2D GIS Map
- **3D BESCOM Grid Twin (`Three.js` / WebGL)**:
  - Procedural multi-part 66/11kV substation hubs, ceramic HV bushings, busbar gantries, and status beacons across **24 BESCOM feeders** in 5 circles (`Bengaluru East`, `Bengaluru South`, `Bengaluru North`, `Bengaluru West & Central`, and `Regional Circles`).
  - 3D landmarks for **8 critical facilities** (Hospitals, BWSSB Water Pumping Stations, and Metro Transit hubs).
  - Animated `11kV` energy flow packets along curved transmission corridors, priority-scaled outage spires, orbiting duplicate complaint nodes, and dispatched crew utility trucks.
  - Interactive raycasting (click/hover nodes in 3D) plus a collapsible bottom control dock (`Overview`, `Focus Selected`, `Top-Down`, `Auto-Orbit`, `Energy Flow`, and `Explode` layer slider; press `H` to toggle controls).
- **2D GIS Map (`Leaflet` + OpenStreetMap)**: Toggle seamlessly to inspect feeder radii, raw individual complaints, and critical facility pins on real street geography.

### 3. Role-Gated BESCOM Admin System
- Crew dispatch, reassignment, supply restoration confirmation, SLA escalation, root cause updates, new-connection status progression, and planned maintenance scheduling require **BESCOM Admin authentication**.
- **Demo Admin Credentials**:
  - **Email**: `admin@bescom.gov.in` | **Password**: `BESCOM@2026`
  - **Email**: `dispatcher@bescom.gov.in` | **Password**: `LUMEN@2026`

### 4. Citizen Self-Service Portal
- **Report & Track Outage**: Circle- and feeder-aware complaint submission with live duplicate-cluster warning if neighbors have already reported an active fault on that feeder, plus planned maintenance alerts and a 4-step live restoration tracker.
- **Pay Electricity Bill (RR Number)**: Look up consumer RR numbers (e.g., `BLR-E4-71904`, `BLR-S2-38410`, `BLR-E9-90214`, `BLR-N1-55128`), pay via UPI / NetBanking / Card, and download a formatted payment receipt.
- **Apply for New Connection**: Submit domestic, commercial, industrial, or EV charging load requests with automatic fee estimation and application status tracking.

### 5. Bilingual Support (English & Kannada / ಕನ್ನಡ) & One-Click ZIP Export
- Instant **English / ಕನ್ನಡ** language switcher across navigation, feeder names, control panels, and citizen portals.
- Built-in **Download ZIP** (`/api/download-zip`) packages compiled static `dist/` output, source files, Nginx/Apache/Docker configurations, and `DEPLOYMENT.md`.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons
- **3D & Mapping**: Three.js (WebGL PBR + OrbitControls + InstancedMesh + Raycaster), Leaflet + OpenStreetMap
- **Backend**: Node.js, Express 4, JSZip, `tsx`

---

## Project Structure

```text
├── deploy/
│   ├── .htaccess          # Apache SPA rewrite rules
│   ├── Dockerfile         # Multi-stage Node + Nginx production image
│   └── nginx.conf         # Nginx static hosting configuration
├── src/
│   ├── components/
│   │   ├── AdminLoginModal.tsx
│   │   ├── AnalyticsView.tsx
│   │   ├── AnimatedNumber.tsx
│   │   ├── CitizenBillingTab.tsx
│   │   ├── CitizenNewConnectionTab.tsx
│   │   ├── CitizenPortalView.tsx
│   │   ├── ControlStrip.tsx
│   │   ├── CrewsFeedersView.tsx
│   │   ├── DeploymentSection.tsx
│   │   ├── Footer.tsx
│   │   ├── GridTwin3D.tsx
│   │   ├── Header.tsx
│   │   ├── OperationsView.tsx
│   │   └── OutageMap.tsx
│   ├── engine/
│   │   ├── billing.ts     # RR bill lookup, fee estimation & connection tracking
│   │   └── dbscan.ts      # Spatial DBSCAN clustering, scoring & 24 BESCOM feeders
│   ├── i18n/
│   │   └── translations.ts # English & Kannada dictionaries
│   ├── types/
│   │   └── lumenops.ts
│   ├── utils/
│   │   ├── auth.ts
│   │   └── zipDownload.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server.ts              # Express API + Vite dev middleware + ZIP bundler
├── DEPLOYMENT.md          # Server deployment instructions
├── package.json
└── vite.config.ts
