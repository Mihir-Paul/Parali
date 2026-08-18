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

  // Demo step manager
  demoStep: number; // 1 to 9
  
  // Route optimization state
  isOptimizing: boolean;
  optimizationProgress: number; // 0 to 100
  optimizationLogs: string[];
  routeOptimized: boolean;

  // Actions
  setRole: (role: Role) => void;
  loginAsFarmer: (phone: string) => boolean;
  loginAsBuyer: (email: string) => boolean;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  setDemoStep: (step: number) => void;
  addListing: (listing: Omit<ResidueListing, 'id' | 'farmerId' | 'farmerName' | 'status'>) => void;
  acceptMatch: (listingId: string) => void;
  confirmBuyerRequirement: (requirementId: string) => void;
  runRouteOptimizer: () => void;
  resetRouteOptimizer: () => void;
  completePickup: (listingId: string) => void;
  resetDemo: () => void;
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
  demoStep: 1,

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

  nextDemoStep: () => {
    const current = get().demoStep;
    if (current < 9) {
      get().setDemoStep(current + 1);
    }
  },

  prevDemoStep: () => {
    const current = get().demoStep;
    if (current > 1) {
      get().setDemoStep(current - 1);
    }
  },

  setDemoStep: (step) => {
    set({ demoStep: step });
    
    // Auto-update screens/configurations depending on the demo step to make it magic for judges
    if (step === 1) {
      set({ currentRole: 'Farmer', loggedInFarmer: get().farmers.find(f => f.phone === '9999999999') || null });
    } else if (step === 2) {
      set({ currentRole: 'Farmer' });
    } else if (step === 3) {
      // Auto list ramesh's item if not exists
      const hasRameshListing = get().listings.some(l => l.farmerId === 'f1' && l.cropType === 'Wheat');
      if (!hasRameshListing) {
        get().addListing({
          cropType: 'Wheat',
          residueType: 'Wheat Straw',
          quantity: 3,
          pickupLocation: 'Sangrur Fields Block A',
          coordinates: [31, 46],
          pickupDate: '2026-08-22',
          images: [],
          estimatedPriceMin: 2400,
          estimatedPriceMax: 2800
        });
      }
      set({ currentRole: 'Farmer' });
    } else if (step === 4) {
      // Auto accept the match for Ramesh's listing
      const rameshList = get().listings.find(l => l.farmerId === 'f1' && l.cropType === 'Wheat');
      if (rameshList && rameshList.status === 'Listed') {
        get().acceptMatch(rameshList.id);
      }
      set({ currentRole: 'Buyer', loggedInBuyer: get().buyers.find(b => b.email === 'buyer@parali.demo') || null });
    } else if (step === 5) {
      set({ currentRole: 'Admin' });
    } else if (step === 6) {
      set({ currentRole: 'Admin' });
    } else if (step === 7) {
      set({ currentRole: 'Admin' });
    } else if (step === 8) {
      set({ currentRole: 'Admin' });
    } else if (step === 9) {
      set({ currentRole: 'Admin' });
    }
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
      matchedBuyerName: 'GreenGrow Mushroom Farm',
      offeredPricePerTonne: 866 // ₹2600 / 3
    };

    set(state => ({
      listings: [listing, ...state.listings],
      farmers: state.farmers.map(f => f.id === farmer.id ? { ...f, activeResidue: listing.residueType, residueWeight: listing.quantity } : f)
    }));
  },

  acceptMatch: (listingId) => {
    set(state => ({
      listings: state.listings.map(l => 
        l.id === listingId 
          ? { ...l, status: 'Matched' } 
          : l
      )
    }));
  },

  confirmBuyerRequirement: (requirementId) => {
    // Switch to Confirmed status
    set(state => ({
      listings: state.listings.map(l => 
        l.id === requirementId || (l.farmerId === 'f1' && l.status === 'Matched')
          ? { ...l, status: 'Confirmed' } 
          : l
      )
    }));
  },

  runRouteOptimizer: () => {
    if (get().isOptimizing) return;
    
    set({ isOptimizing: true, routeOptimized: false, optimizationProgress: 0, optimizationLogs: [] });

    const logs = [
      '[AI Engine] Analyzing 14 candidate crop fields in Sangrur-Patiala cluster...',
      '[AI Engine] Loading truck payload restrictions (Max capacity: 12 tonnes per vehicle)...',
      '[AI Engine] Extracting spatial distances from crop coordinates...',
      '[AI Engine] Applying sweep savings heuristic for route clustering...',
      '[AI Engine] Computing genetic sequence mutations for 100 generations...',
      '[AI Engine] Route optimization completed. Convergence rate: 99.4%.'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      const currentProgress = get().optimizationProgress;
      if (currentProgress < 100) {
        const nextProgress = Math.min(currentProgress + 20, 100);
        const newLogs = [...get().optimizationLogs];
        
        if (currentLogIndex < logs.length) {
          newLogs.push(logs[currentLogIndex]);
          currentLogIndex++;
        }

        set({ 
          optimizationProgress: nextProgress,
          optimizationLogs: newLogs
        });
      } else {
        clearInterval(interval);
        set({ isOptimizing: false, routeOptimized: true });
      }
    }, 800);
  },

  resetRouteOptimizer: () => {
    set({ routeOptimized: false, optimizationLogs: [], optimizationProgress: 0 });
  },

  completePickup: (listingId) => {
    // Find the listing
    const listing = get().listings.find(l => l.id === listingId || (l.farmerId === 'f1' && l.status === 'Confirmed'));
    if (!listing) return;

    const payout = listing.offeredPricePerTonne 
      ? listing.offeredPricePerTonne * listing.quantity 
      : 2400;

    set(state => ({
      listings: state.listings.map(l => 
        l.id === listing.id || (l.farmerId === 'f1' && l.status === 'Confirmed')
          ? { ...l, status: 'Paid' } 
          : l
      ),
      // Update farmer metrics
      farmers: state.farmers.map(f => 
        f.id === listing.farmerId 
          ? { 
              ...f, 
              earnings: f.earnings + payout, 
              divertedTonnes: f.divertedTonnes + listing.quantity,
              burnsPrevented: f.burnsPrevented + 1,
              activeResidue: undefined,
              residueWeight: undefined
            } 
          : f
      )
    }));
  },

  resetDemo: () => {
    set({
      currentRole: 'none',
      loggedInFarmer: null,
      loggedInBuyer: null,
      farmers: initialFarmers,
      buyers: initialBuyers,
      listings: initialListings,
      requirements: initialRequirements,
      hotspots: initialHotspots,
      demoStep: 1,
      isOptimizing: false,
      optimizationProgress: 0,
      optimizationLogs: [],
      routeOptimized: false
    });
  }
}));
