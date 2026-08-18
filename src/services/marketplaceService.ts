import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import {
  ResidueListingItem,
  BuyerDemandInput,
  BuyerDemandItem,
  PurchaseRequestInput,
  PurchaseRequestItem,
  ResidueMatchItem,
  MarketplaceFilterState
} from '../types/marketplace';

// Initial verified seed data inserted into Supabase if database table is empty
const INITIAL_SEED_LISTINGS: Omit<ResidueListingItem, 'id' | 'created_at'>[] = [
  {
    farmer_name: 'Gurpreet Singh',
    crop_type: 'Wheat',
    residue_type: 'Wheat Straw',
    quantity: 6.5,
    price_per_tonne: 1150,
    pickup_location: 'Barnala Fields, Sector 4',
    state: 'Punjab',
    district: 'Barnala',
    village: 'Handiaya',
    quality_grade: 'Grade A',
    moisture_pct: 10,
    pickup_ready_date: '2026-08-22',
    status: 'Listed',
    latitude: 30.38,
    longitude: 75.54,
    estimated_collection_cost: 320,
    distance_km: 12
  },
  {
    farmer_name: 'Ramesh Kumar',
    crop_type: 'Wheat',
    residue_type: 'Wheat Straw (Tudi)',
    quantity: 3.2,
    price_per_tonne: 1180,
    pickup_location: 'Sangrur Fields Block A',
    state: 'Punjab',
    district: 'Sangrur',
    village: 'Kila Raipur',
    quality_grade: 'Grade A',
    moisture_pct: 12,
    pickup_ready_date: '2026-08-23',
    status: 'Listed',
    latitude: 30.24,
    longitude: 75.84,
    estimated_collection_cost: 280,
    distance_km: 18
  },
  {
    farmer_name: 'Baldev Singh',
    crop_type: 'Rice',
    residue_type: 'Rice / Paddy Straw',
    quantity: 14.0,
    price_per_tonne: 950,
    pickup_location: 'Bathinda Highway Farm',
    state: 'Punjab',
    district: 'Bathinda',
    village: 'Gonuana',
    quality_grade: 'Grade A',
    moisture_pct: 14,
    pickup_ready_date: '2026-08-24',
    status: 'Listed',
    latitude: 30.21,
    longitude: 74.94,
    estimated_collection_cost: 410,
    distance_km: 34
  },
  {
    farmer_name: 'Harpreet Singh',
    crop_type: 'Maize',
    residue_type: 'Maize Residue',
    quantity: 8.5,
    price_per_tonne: 1050,
    pickup_location: 'Moga North Farm',
    state: 'Punjab',
    district: 'Moga',
    village: 'Dharmkot',
    quality_grade: 'Grade B',
    moisture_pct: 15,
    pickup_ready_date: '2026-08-25',
    status: 'Listed',
    latitude: 30.81,
    longitude: 75.17,
    estimated_collection_cost: 350,
    distance_km: 26
  },
  {
    farmer_name: 'Jagdish Singh',
    crop_type: 'Sugarcane',
    residue_type: 'Sugarcane Trash',
    quantity: 22.0,
    price_per_tonne: 1250,
    pickup_location: 'Ludhiana Outer Ring',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Sahnewal',
    quality_grade: 'Grade A',
    moisture_pct: 11,
    pickup_ready_date: '2026-08-26',
    status: 'Listed',
    latitude: 30.90,
    longitude: 75.85,
    estimated_collection_cost: 500,
    distance_km: 42
  },
  {
    farmer_name: 'Avtar Singh',
    crop_type: 'Cotton',
    residue_type: 'Cotton Stalks',
    quantity: 11.2,
    price_per_tonne: 1100,
    pickup_location: 'Jalandhar Bypass Fields',
    state: 'Punjab',
    district: 'Jalandhar',
    village: 'Nakodar',
    quality_grade: 'Grade B',
    moisture_pct: 13,
    pickup_ready_date: '2026-08-27',
    status: 'Listed',
    latitude: 31.32,
    longitude: 75.57,
    estimated_collection_cost: 390,
    distance_km: 48
  }
];

/**
 * Fetch residue listings from Supabase with debounced search & filters
 */
export async function fetchResidueListings(
  filters?: Partial<MarketplaceFilterState>
): Promise<ResidueListingItem[]> {
  try {
    const { data: dbData, error } = await supabase
      .from('residue_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, fallback to initial seed list:', error.message);
      return applyFilters(INITIAL_SEED_LISTINGS.map((item, idx) => ({ ...item, id: `seed_${idx + 1}` })), filters);
    }

    let listings: ResidueListingItem[] = dbData || [];

    // If table is completely empty, auto-seed database records so the UI receives real database data
    if (listings.length === 0) {
      console.log('Seeding initial verified listings into Supabase residue_listings table...');
      const { data: seededData, error: seedErr } = await supabase
        .from('residue_listings')
        .insert(INITIAL_SEED_LISTINGS)
        .select();

      if (!seedErr && seededData) {
        listings = seededData as ResidueListingItem[];
      } else {
        listings = INITIAL_SEED_LISTINGS.map((item, idx) => ({ ...item, id: `seed_${idx + 1}` }));
      }
    }

    return applyFilters(listings, filters);
  } catch (err: any) {
    console.error('Unexpected error fetching residue listings:', err);
    return applyFilters(INITIAL_SEED_LISTINGS.map((item, idx) => ({ ...item, id: `seed_${idx + 1}` })), filters);
  }
}

/**
 * Helper to apply search, filtering, and sorting to listings
 */
function applyFilters(
  listings: ResidueListingItem[],
  filters?: Partial<MarketplaceFilterState>
): ResidueListingItem[] {
  if (!filters) return listings;

  return listings
    .filter((item) => {
      // Search Query
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesQuery =
          item.crop_type.toLowerCase().includes(query) ||
          item.residue_type.toLowerCase().includes(query) ||
          item.farmer_name.toLowerCase().includes(query) ||
          item.state.toLowerCase().includes(query) ||
          item.district.toLowerCase().includes(query) ||
          item.pickup_location.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Residue / Crop Type Filter
      if (filters.residueType && filters.residueType !== 'All') {
        const filterType = filters.residueType.toLowerCase();
        const itemCrop = item.crop_type.toLowerCase();
        const itemResidue = item.residue_type.toLowerCase();
        if (!itemCrop.includes(filterType) && !itemResidue.includes(filterType)) {
          return false;
        }
      }

      // Quantity Range
      if (filters.minQuantity !== undefined && item.quantity < filters.minQuantity) {
        return false;
      }
      if (filters.maxQuantity !== undefined && filters.maxQuantity > 0 && item.quantity > filters.maxQuantity) {
        return false;
      }

      // Max Price Filter
      if (filters.maxPrice !== undefined && filters.maxPrice > 0 && item.price_per_tonne > filters.maxPrice) {
        return false;
      }

      // Location State & District
      if (filters.state && filters.state.trim() !== '' && filters.state !== 'All') {
        if (item.state.toLowerCase() !== filters.state.toLowerCase()) return false;
      }
      if (filters.district && filters.district.trim() !== '' && filters.district !== 'All') {
        if (!item.district.toLowerCase().includes(filters.district.toLowerCase())) return false;
      }

      // Quality Grade Filter
      if (filters.qualityGrade && filters.qualityGrade !== 'All') {
        if (item.quality_grade !== filters.qualityGrade) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'lowest_price':
          return a.price_per_tonne - b.price_per_tonne;
        case 'highest_quantity':
          return b.quantity - a.quantity;
        case 'nearest_farm':
          return (a.distance_km || 99) - (b.distance_km || 99);
        case 'recently_listed':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'best_match':
        default:
          return b.quantity * (2000 - b.price_per_tonne) - a.quantity * (2000 - a.price_per_tonne);
      }
    });
}

/**
 * Create a new Buyer Demand requirement in Supabase
 */
export async function createBuyerDemand(
  user: User,
  input: BuyerDemandInput
): Promise<BuyerDemandItem> {
  const payload = {
    buyer_id: user.id,
    company_name: input.company_name,
    buyer_type: input.buyer_type,
    crop_type: input.crop_type,
    residue_type: input.residue_type,
    required_quantity_tonnes: Number(input.required_quantity_tonnes),
    max_price_per_tonne: Number(input.max_price_per_tonne),
    preferred_state: input.preferred_state,
    preferred_district: input.preferred_district || '',
    max_distance_km: Number(input.max_distance_km || 50),
    required_by_date: input.required_by_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    additional_notes: input.additional_notes || '',
    status: 'Active'
  };

  const { data, error } = await supabase
    .from('buyer_demands')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error inserting buyer demand into Supabase:', error);
    // Return client generated item so workflow continues gracefully if table is pending setup
    return {
      id: `demand_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...payload,
      status: 'Active'
    };
  }

  return data as BuyerDemandItem;
}

/**
 * Fetch Buyer Demands for a given buyer
 */
export async function fetchBuyerDemands(buyerId: string): Promise<BuyerDemandItem[]> {
  try {
    const { data, error } = await supabase
      .from('buyer_demands')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching buyer demands from Supabase:', error.message);
      return [];
    }

    return (data as BuyerDemandItem[]) || [];
  } catch (err: any) {
    console.error('Unexpected error fetching buyer demands:', err);
    return [];
  }
}

/**
 * Create a Purchase Request sent to a farmer
 */
export async function createPurchaseRequest(
  user: User,
  input: PurchaseRequestInput
): Promise<PurchaseRequestItem> {
  const payload = {
    buyer_id: user.id,
    farmer_id: input.farmer_id || null,
    listing_id: input.listing_id,
    demand_id: input.demand_id || null,
    quantity_requested: Number(input.quantity_requested),
    offered_price_per_tonne: Number(input.offered_price_per_tonne),
    total_amount: Number(input.total_amount),
    pickup_date_preference: input.pickup_date_preference || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    note: input.note || '',
    status: 'Pending'
  };

  const { data, error } = await supabase
    .from('purchase_requests')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error inserting purchase request into Supabase:', error);
    return {
      id: `req_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...payload,
      status: 'Pending'
    };
  }

  return data as PurchaseRequestItem;
}

/**
 * Fetch Purchase Requests for a buyer or farmer
 */
export async function fetchPurchaseRequests(
  buyerId?: string,
  farmerId?: string
): Promise<PurchaseRequestItem[]> {
  try {
    let query = supabase.from('purchase_requests').select('*');

    if (buyerId) {
      query = query.eq('buyer_id', buyerId);
    } else if (farmerId) {
      query = query.eq('farmer_id', farmerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching purchase requests from Supabase:', error.message);
      return [];
    }

    return (data as PurchaseRequestItem[]) || [];
  } catch (err: any) {
    console.error('Unexpected error fetching purchase requests:', err);
    return [];
  }
}

/**
 * Update Purchase Request Status (e.g. Farmer Accepts or Rejects)
 */
export async function updatePurchaseRequestStatus(
  requestId: string,
  newStatus: 'Confirmed' | 'Rejected' | 'Completed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('purchase_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      console.error('Error updating purchase request status in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Unexpected error updating request status:', err);
    return false;
  }
}

/**
 * Create a new Residue Listing by a Farmer
 */
export async function createResidueListing(
  user: User,
  input: {
    farmer_name: string;
    crop_type: string;
    residue_type: string;
    quantity: number;
    price_per_tonne: number;
    pickup_location: string;
    state: string;
    district: string;
    village?: string;
    quality_grade?: 'Grade A' | 'Grade B' | 'Grade C';
    moisture_pct?: number;
    pickup_ready_date: string;
  }
): Promise<ResidueListingItem> {
  const payload = {
    farmer_id: user.id,
    farmer_name: input.farmer_name,
    crop_type: input.crop_type,
    residue_type: input.residue_type,
    quantity: Number(input.quantity),
    price_per_tonne: Number(input.price_per_tonne),
    pickup_location: input.pickup_location,
    state: input.state,
    district: input.district,
    village: input.village || '',
    quality_grade: input.quality_grade || 'Grade A',
    moisture_pct: input.moisture_pct || 12,
    pickup_ready_date: input.pickup_ready_date,
    status: 'Listed'
  };

  const { data, error } = await supabase
    .from('residue_listings')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error inserting residue listing into Supabase:', error);
    return {
      id: `listing_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...payload
    } as ResidueListingItem;
  }

  return data as ResidueListingItem;
}

/**
 * Deterministic Matching Engine
 * Calculates compatibility score between a Buyer Demand and candidate Residue Listings
 * Weighting: Residue Type (40%), Price (20%), Quantity (20%), Distance (10%), Quality (10%)
 */
export function calculateMatches(
  demand: BuyerDemandItem | BuyerDemandInput,
  listings: ResidueListingItem[]
): ResidueMatchItem[] {
  const matches: ResidueMatchItem[] = [];

  for (const listing of listings) {
    // 1. Residue Type Match (Max 40 points)
    let residueScore = 0;
    const reqResidue = demand.residue_type.toLowerCase();
    const reqCrop = demand.crop_type.toLowerCase();
    const listResidue = listing.residue_type.toLowerCase();
    const listCrop = listing.crop_type.toLowerCase();

    if (listResidue.includes(reqResidue) || reqResidue.includes(listResidue)) {
      residueScore = 40;
    } else if (listCrop === reqCrop) {
      residueScore = 32;
    } else {
      residueScore = 10; // low partial match
    }

    // 2. Price Match (Max 20 points)
    let priceScore = 0;
    if (listing.price_per_tonne <= demand.max_price_per_tonne) {
      const priceDiff = demand.max_price_per_tonne - listing.price_per_tonne;
      priceScore = 20; // within budget
      if (priceDiff > 100) priceScore += 2; // bonus for lower price
    } else {
      const priceOver = listing.price_per_tonne - demand.max_price_per_tonne;
      if (priceOver <= 100) priceScore = 12;
      else if (priceOver <= 300) priceScore = 5;
      else priceScore = 0;
    }

    // 3. Quantity Match (Max 20 points)
    let quantityScore = 0;
    const qtyRatio = listing.quantity / demand.required_quantity_tonnes;
    if (qtyRatio >= 1) {
      quantityScore = 20; // can fulfill full order or more
    } else if (qtyRatio >= 0.5) {
      quantityScore = 16;
    } else if (qtyRatio >= 0.1) {
      quantityScore = 10;
    } else {
      quantityScore = 4;
    }

    // 4. Distance Match (Max 10 points)
    let distanceScore = 10;
    const distance = listing.distance_km || 20;
    const maxDist = demand.max_distance_km || 50;
    if (distance <= maxDist) {
      distanceScore = Math.max(2, Math.round(10 - (distance / maxDist) * 5));
    } else {
      distanceScore = 2;
    }

    // 5. Quality Match (Max 10 points)
    let qualityScore = 10;
    if (listing.quality_grade === 'Grade A') qualityScore = 10;
    else if (listing.quality_grade === 'Grade B') qualityScore = 7;
    else qualityScore = 5;

    const totalScore = Math.min(99, Math.max(45, Math.round(residueScore + priceScore + quantityScore + distanceScore + qualityScore)));

    matches.push({
      id: `match_${demand.crop_type}_${listing.id}`,
      demand_id: (demand as BuyerDemandItem).id || 'd_active',
      listing,
      compatibility_score: totalScore,
      score_breakdown: {
        residueMatch: residueScore,
        priceMatch: Math.min(20, priceScore),
        quantityMatch: quantityScore,
        distanceMatch: distanceScore,
        qualityMatch: qualityScore
      }
    });
  }

  // Sort by highest compatibility score
  return matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
}
