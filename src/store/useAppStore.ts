import { create } from 'zustand';
import {
  Farmer,
  Buyer,
  ResidueListing,
  BuyerRequirement,
  BurnHotspot,
  initialFarmers,
  initialBuyers,
  initialListings,
  initialRequirements,
  initialHotspots
} from '../services/mockData';

type Role = 'Farmer' | 'Buyer' | 'Admin' | 'none';

interface AppState {
  // Authentication & Roles
  currentRole: Role;
  loggedInFarmer: Farmer | null;
  loggedInBuyer: Buyer | null;
  
  // Data lists
  farmers: Farmer[];
  buyers: Buyer[];
  listings: ResidueListing[];
  requirements: BuyerRequirement[];
  hotspots: BurnHotspot[];
  
  // Route optimization state
  isOptimizing: boolean;
  optimizationProgress: number; // 0 to 100
  optimizationLogs: string[];
  routeOptimized: boolean;

  // Actions
  setRole: (role: Role) => void;
  loginAsFarmer: (phone: string) => boolean;
  loginAsBuyer: (email: string) => boolean;
  addListing: (listing: Omit<ResidueListing, 'id' | 'farmerId' | 'farmerName' | 'status'>) => void;
  acceptMatch: (listingId: string) => void;
  confirmBuyerRequirement: (requirementId: string) => void;
  runRouteOptimizer: () => void;
  resetRouteOptimizer: () => void;
  completePickup: (listingId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'none',
  loggedInFarmer: null,
  loggedInBuyer: null,
  farmers: initialFarmers,
  buyers: initialBuyers,
  listings: initialListings,
  requirements: initialRequirements,
  hotspots: initialHotspots,

  isOptimizing: false,
  optimizationProgress: 0,
  optimizationLogs: [],
  routeOptimized: false,

  setRole: (role) => set({ currentRole: role }),

  loginAsFarmer: (phone) => {
    const farmer = get().farmers.find(f => f.phone === phone);
    if (farmer) {
      set({ loggedInFarmer: farmer, currentRole: 'Farmer' });
      return true;
    }
    // Create new farmer if not exists for convenience
    const newFarmer: Farmer = {
      id: 'f_new',
      name: 'Ramesh Kumar',
      phone,
      location: 'Sangrur, Punjab',
      coordinates: [30, 45],
      earnings: 0,
      burnsPrevented: 0,
      divertedTonnes: 0
    };
    set(state => ({
      farmers: [...state.farmers, newFarmer],
      loggedInFarmer: newFarmer,
      currentRole: 'Farmer'
    }));
    return true;
  },

  loginAsBuyer: (email) => {
    const buyer = get().buyers.find(b => b.email === email);
    if (buyer) {
      set({ loggedInBuyer: buyer, currentRole: 'Buyer' });
      return true;
    }
    return false;
  },

  addListing: (newListing) => {
    const farmer = get().loggedInFarmer || get().farmers[0];
    const listingId = `l_new_${Date.now()}`;
    const listing: ResidueListing = {
      ...newListing,
      id: listingId,
      farmerId: farmer.id,
      farmerName: farmer.name,
      status: 'Listed',
      matchScore: 94,
      matchedBuyerId: 'b1',
      matchedBuyerName: 'GreenGrow Bio-Energy Plant'
    };

    set((state) => ({
      listings: [listing, ...state.listings]
    }));
  },

  acceptMatch: (listingId) => {
    set((state) => ({
      listings: state.listings.map((l) =>
        l.id === listingId ? { ...l, status: 'Matched' } : l
      )
    }));
  },

  confirmBuyerRequirement: (requirementId) => {
    set((state) => ({
      requirements: state.requirements.map((r) =>
        r.id === requirementId ? { ...r, status: 'Fulfilled' } : r
      )
    }));
  },

  runRouteOptimizer: () => {
    set({ isOptimizing: true, optimizationProgress: 10, optimizationLogs: ['Initializing ORS Road Distance Matrix...'] });

    setTimeout(() => {
      set({ optimizationProgress: 40, optimizationLogs: ['Initializing OR-Tools CVRP Constraint Solver...'] });
    }, 400);

    setTimeout(() => {
      set({ optimizationProgress: 75, optimizationLogs: ['Balancing Truck Axle Load & Vehicle Capacity Limits...'] });
    }, 800);

    setTimeout(() => {
      set({
        isOptimizing: false,
        optimizationProgress: 100,
        routeOptimized: true,
        optimizationLogs: ['Optimization Completed. 34.5% Fuel & Emission Reduction Achieved.']
      });
    }, 1200);
  },

  resetRouteOptimizer: () => {
    set({
      routeOptimized: false,
      isOptimizing: false,
      optimizationProgress: 0,
      optimizationLogs: []
    });
  },

  completePickup: (listingId) => {
    const listing = get().listings.find(l => l.id === listingId);
    if (!listing) return;

    const payoutAmount = Math.round((listing.estimatedPriceMin + listing.estimatedPriceMax) / 2);

    set((state) => ({
      listings: state.listings.map((l) =>
        l.id === listingId ? { ...l, status: 'Collected' } : l
      ),
      farmers: state.farmers.map((f) =>
        f.id === listing.farmerId
          ? {
              ...f,
              earnings: f.earnings + payoutAmount,
              divertedTonnes: f.divertedTonnes + listing.quantity,
              burnsPrevented: f.burnsPrevented + 1,
              activeResidue: undefined,
              residueWeight: undefined
            } 
          : f
      )
    }));
  }
}));
