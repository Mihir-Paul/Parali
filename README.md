# Parali — Agricultural Crop Residue Valorization & Stubble Burn Prevention Platform

Parali is an AI-powered agricultural logistics and marketplace platform built for the Smart India Hackathon. It connects farmers who have post-harvest crop residue with bio-energy and industrial buyers who require agricultural biomass, preventing open-field stubble burning through market access, satellite monitoring, and route optimization.

---

## Key Features

### 1. Farmer Portal
- **Biomass Listing**: List crop residue by crop type (Wheat, Rice/Paddy, Maize, Sugarcane, Cotton), quantity in tonnes, price per tonne, quality grade, moisture percentage, and pickup availability date.
- **Farmgate AI Valuation**: Calculates estimated market valuation and collection feasibility based on location and crop type.
- **Hidden Cost Calculator**: Agronomic N-P-K nutrient loss calculator comparing field burning (soil degradation cost) versus selling residue.
- **Order Tracking**: Five-step progress tracker monitoring pickup requests from confirmation to payment remittance.

### 2. Biomass Buyer Marketplace
- **Marketplace Discovery**: Filter available residue by state, district, quality grade (Grade A, B, C), moisture content, and price.
- **Demand Posting**: Post industrial biomass sourcing requirements specifying required tonnage, target price, preferred location, and procurement radius.
- **AI Match Engine**: Compatibility scoring system evaluating crop type, location distance, price, and quality requirements.
- **Purchase Request Workflow**: Send, negotiate, and track bulk biomass purchase requests.

### 3. Burn Intelligence Center
- **Satellite Detection**: Map-first interface integrating NASA FIRMS thermal anomaly satellite telemetry for real-time fire detection.
- **Regional Monitoring**: Spatial mapping of high-risk thermal clusters across agricultural districts in Punjab and Haryana.
- **Burn Risk Index**: District-level risk scoring to prioritize collection logistics before seasonal burning windows.

### 4. Logistics & Route Optimizer
- **Capacitated Vehicle Routing**: Map-first fleet dispatching engine implementing Google OR-Tools CVRP multi-depot vehicle routing algorithms.
- **Route Reduction**: Generates optimized pickup sequences for balers, tractors, and trucks to minimize transport distance, fuel consumption, and transit time.

### 5. Impact & MRV Carbon Dashboard
- **Platform Analytics**: Quantifies total biomass diverted (tonnes), direct farmer income generated (INR), unique holdings benefited, and logistics distance saved (km).
- **Emissions Avoidance**: IPCC/PAU emission factor calculation estimating tCO2e emissions avoided by preventing open stubble burning.
- **Monthly Trajectory**: Historical timeline charts tracking monthly biomass collection and emissions offset trajectory.

---

## Technical Architecture

### Frontend Stack
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS custom tokens
- **Typography**: Fraunces (Display/Headings), Inter (Body), IBM Plex Mono (Data/Metrics)
- **State Management**: Zustand (`useAppStore`)
- **Mapping & Geospatial**: MapLibre GL, OpenStreetMap raster tiles
- **Data Visualization**: Recharts
- **Icons**: Lucide React

### Backend & Database Services
- **Database & Authentication**: Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **API Services**:
  - `firmsService`: NASA FIRMS thermal satellite data ingestion
  - `routeService`: Vehicle routing optimization engine
  - `marketplaceService`: Listing, demand, and transaction management
  - `impactService`: Environmental impact calculations and reporting
  - `profileService`: Farmer and buyer profile onboarding and management

---

## Project Structure

```text
Parali/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── MapViewer.tsx
│   │   ├── UserAvatar.tsx
│   │   └── FarmerHiddenCostCalculator.tsx
│   ├── context/             # React context (AuthContext)
│   ├── lib/                 # Service clients (Supabase client)
│   ├── pages/               # Application views
│   │   ├── LandingPage.tsx
│   │   ├── AuthLogin.tsx
│   │   ├── RoleSelect.tsx
│   │   ├── Onboarding.tsx
│   │   ├── FarmerDashboard.tsx
│   │   ├── FarmerSell.tsx
│   │   ├── BuyerDashboard.tsx
│   │   ├── BuyerMarketplace.tsx
│   │   ├── BuyerDemand.tsx
│   │   ├── BuyerMatches.tsx
│   │   ├── BuyerRequests.tsx
│   │   ├── BurnIntelligence.tsx
│   │   ├── RouteOptimizer.tsx
│   │   ├── ImpactDashboard.tsx
│   │   └── ProfilePage.tsx
│   ├── services/            # API integration modules
│   ├── store/               # Zustand application store
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx              # Root application router and shell
│   ├── index.css            # Global CSS variables and utility classes
│   └── main.tsx             # Application entrypoint
├── .env                     # Environment variables configuration
├── index.html               # HTML template with Google Fonts CDN
├── package.json             # Dependencies and build scripts
├── tailwind.config.js       # Design token color scale & font configurations
└── vite.config.ts           # Vite build configuration
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_BACKEND_URL=http://localhost:8000
```

---

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation & Execution

1. Clone the repository:
   ```bash
   git clone https://github.com/Mihir-Paul/Parali.git
   cd Parali
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

---

## License

This project is developed for the Smart India Hackathon. All rights reserved.
