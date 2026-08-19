export interface Farmer {
  id: string;
  name: string;
  phone: string;
  location: string;
  coordinates: [number, number]; // [lat, lng] representation for SVG map grid (e.g. 0 to 100 coordinates)
  activeResidue?: string;
  residueWeight?: number; // in tonnes
  earnings: number;
  burnsPrevented: number;
  divertedTonnes: number;
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  location: string;
  coordinates: [number, number];
  type: string;
  sourcedVolume: number; // in tonnes
  activeRequirementsCount: number;
}

export interface ResidueListing {
  id: string;
  farmerId: string;
  farmerName: string;
  cropType: 'Wheat' | 'Rice' | 'Maize' | 'Sugarcane' | 'Other';
  residueType: string;
  quantity: number; // tonnes
  pickupLocation: string;
  coordinates: [number, number];
  pickupDate: string;
  images: string[];
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  status: 'Listed' | 'Matched' | 'Confirmed' | 'Pickup' | 'Paid' | 'Collected';
  matchScore?: number;
  matchedBuyerId?: string;
  matchedBuyerName?: string;
  offeredPricePerTonne?: number;
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  cropType: 'Wheat' | 'Rice' | 'Maize' | 'Sugarcane' | 'Other';
  residueType: string;
  quantityNeeded: number;
  maxPricePerTonne: number;
  deliveryDate: string;
  region: string;
}

export interface BurnHotspot {
  id: string;
  location: string;
  coordinates: [number, number];
  confidence: number;
  detectedAt: string;
  nearbyFarmsCount: number;
  potentialResidue: number;
}

export const initialFarmers: Farmer[] = [
  { id: 'f1', name: 'Ramesh Kumar', phone: '9999999999', location: 'Sangrur, Punjab', coordinates: [30, 45], earnings: 7450, burnsPrevented: 6, divertedTonnes: 6.3 },
  { id: 'f2', name: 'Gurpreet Singh', phone: '9876543210', location: 'Barnala, Punjab', coordinates: [25, 55], earnings: 12400, burnsPrevented: 10, divertedTonnes: 11.2 },
  { id: 'f3', name: 'Harpreet Singh', phone: '9888877777', location: 'Moga, Punjab', coordinates: [40, 35], earnings: 3200, burnsPrevented: 3, divertedTonnes: 2.8 },
  { id: 'f4', name: 'Baldev Singh', phone: '9777766666', location: 'Bathinda, Punjab', coordinates: [20, 65], earnings: 15800, burnsPrevented: 12, divertedTonnes: 14.5 },
  { id: 'f5', name: 'Sukhwinder Singh', phone: '9666655555', location: 'Patiala, Punjab', coordinates: [45, 60], earnings: 0, burnsPrevented: 0, divertedTonnes: 0 },
  { id: 'f6', name: 'Jagdish Singh', phone: '9555544444', location: 'Ludhiana, Punjab', coordinates: [50, 40], earnings: 9200, burnsPrevented: 8, divertedTonnes: 8.0 },
  { id: 'f7', name: 'Manpreet Dhillon', phone: '9444433333', location: 'Firozpur, Punjab', coordinates: [15, 30], earnings: 6100, burnsPrevented: 5, divertedTonnes: 5.5 },
  { id: 'f8', name: 'Avtar Singh', phone: '9333322222', location: 'Jalandhar, Punjab', coordinates: [60, 30], earnings: 18500, burnsPrevented: 15, divertedTonnes: 16.8 },
  { id: 'f9', name: 'Kuldeep Sandhu', phone: '9222211111', location: 'Amritsar, Punjab', coordinates: [70, 20], earnings: 21000, burnsPrevented: 18, divertedTonnes: 20.0 },
  { id: 'f10', name: 'Darshan Grewal', phone: '9111100000', location: 'Rupnagar, Punjab', coordinates: [55, 70], earnings: 4500, burnsPrevented: 4, divertedTonnes: 4.1 },
];

export const initialBuyers: Buyer[] = [
  { id: 'b1', name: 'GreenGrow Mushroom Farm', email: 'buyer@parali.demo', location: 'Rajpura, Punjab', coordinates: [52, 62], type: 'Mushroom Cultivation', sourcedVolume: 128, activeRequirementsCount: 2 },
  { id: 'b2', name: 'Punjab BioEnergy Plant', email: 'bioenergy@punjab.gov', location: 'Bathinda Industrial Zone', coordinates: [22, 63], type: 'Biomass Power', sourcedVolume: 840, activeRequirementsCount: 3 },
  { id: 'b3', name: 'EcoFiber Paper Mills', email: 'procurement@ecofiber.com', location: 'Ludhiana Outer', coordinates: [48, 43], type: 'Paper & Pulp', sourcedVolume: 310, activeRequirementsCount: 1 },
  { id: 'b4', name: 'AgriFuel Bio-CNG Solutions', email: 'contact@agrifuel.in', location: 'Sangrur Bypass', coordinates: [32, 47], type: 'Bio-CNG', sourcedVolume: 512, activeRequirementsCount: 4 },
  { id: 'b5', name: 'Rural Biomass Collective', email: 'collective@ruralbiomass.org', location: 'Karnal, Haryana', coordinates: [80, 85], type: 'Briquetting Plant', sourcedVolume: 195, activeRequirementsCount: 2 }
];

export const initialListings: ResidueListing[] = [
  {
    id: 'l1',
    farmerId: 'f2',
    farmerName: 'Gurpreet Singh',
    cropType: 'Rice',
    residueType: 'Rice Straw (Paddy)',
    quantity: 6.5,
    pickupLocation: 'Barnala Fields, Sector 4',
    coordinates: [26, 54],
    pickupDate: '2026-08-20',
    images: [],
    estimatedPriceMin: 5200,
    estimatedPriceMax: 6000,
    status: 'Confirmed',
    matchScore: 92,
    matchedBuyerId: 'b4',
    matchedBuyerName: 'AgriFuel Bio-CNG Solutions',
    offeredPricePerTonne: 900
  },
  {
    id: 'l2',
    farmerId: 'f3',
    farmerName: 'Harpreet Singh',
    cropType: 'Wheat',
    residueType: 'Wheat Straw (Tudi)',
    quantity: 2.8,
    pickupLocation: 'Moga North Farm',
    coordinates: [39, 36],
    pickupDate: '2026-08-21',
    images: [],
    estimatedPriceMin: 2200,
    estimatedPriceMax: 2600,
    status: 'Matched',
    matchScore: 89,
    matchedBuyerId: 'b1',
    matchedBuyerName: 'GreenGrow Mushroom Farm',
    offeredPricePerTonne: 850
  },
  {
    id: 'l3',
    farmerId: 'f4',
    farmerName: 'Baldev Singh',
    cropType: 'Maize',
    residueType: 'Maize Stalks',
    quantity: 8.0,
    pickupLocation: 'Bathinda Highway Farm',
    coordinates: [21, 64],
    pickupDate: '2026-08-25',
    images: [],
    estimatedPriceMin: 6400,
    estimatedPriceMax: 7200,
    status: 'Listed'
  }
];

export const initialRequirements: BuyerRequirement[] = [
  {
    id: 'req1',
    buyerId: 'b1',
    buyerName: 'GreenGrow Mushroom Farm',
    cropType: 'Wheat',
    residueType: 'Dry Wheat Straw',
    quantityNeeded: 50,
    maxPricePerTonne: 1200,
    deliveryDate: '2026-08-25',
    region: 'Punjab'
  },
  {
    id: 'req2',
    buyerId: 'b2',
    buyerName: 'Punjab BioEnergy Plant',
    cropType: 'Rice',
    residueType: 'Rice Straw bales',
    quantityNeeded: 250,
    maxPricePerTonne: 1100,
    deliveryDate: '2026-08-28',
    region: 'Punjab'
  },
  {
    id: 'req3',
    buyerId: 'b4',
    buyerName: 'AgriFuel Bio-CNG Solutions',
    cropType: 'Rice',
    residueType: 'Loose Paddy Residue',
    quantityNeeded: 150,
    maxPricePerTonne: 1050,
    deliveryDate: '2026-08-30',
    region: 'Punjab'
  }
];

export const initialHotspots: BurnHotspot[] = [
  { id: 'h1', location: 'Tarn Taran Region, Punjab', coordinates: [75, 15], confidence: 96, detectedAt: '2026-08-18 11:20 AM', nearbyFarmsCount: 9, potentialResidue: 28 },
  { id: 'h2', location: 'Firozpur Border Zone, Punjab', coordinates: [18, 22], confidence: 91, detectedAt: '2026-08-18 12:05 PM', nearbyFarmsCount: 5, potentialResidue: 14 },
  { id: 'h3', location: 'Patiala South Farms, Punjab', coordinates: [42, 68], confidence: 88, detectedAt: '2026-08-18 12:45 PM', nearbyFarmsCount: 7, potentialResidue: 21 },
  { id: 'h4', location: 'Kaithal District, Haryana border', coordinates: [85, 78], confidence: 94, detectedAt: '2026-08-18 01:10 PM', nearbyFarmsCount: 12, potentialResidue: 36 }
];

export interface OptimizationStep {
  name: string;
  status: 'pending' | 'active' | 'done';
}
