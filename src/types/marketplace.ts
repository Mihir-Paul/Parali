export type CropCategory = 'Wheat' | 'Rice' | 'Paddy' | 'Maize' | 'Sugarcane' | 'Cotton' | 'Other';

export interface ResidueListingItem {
  id: string;
  farmer_id?: string;
  farmer_name: string;
  crop_type: string;
  residue_type: string;
  quantity: number; // available tonnes
  price_per_tonne: number; // in ₹
  pickup_location: string;
  state: string;
  district: string;
  village?: string;
  quality_grade: 'Grade A' | 'Grade B' | 'Grade C';
  moisture_pct?: number;
  pickup_ready_date: string;
  status: 'Listed' | 'Matched' | 'Confirmed' | 'Pickup' | 'Paid';
  latitude?: number;
  longitude?: number;
  estimated_collection_cost?: number;
  distance_km?: number;
  created_at?: string;
}

export interface BuyerDemandInput {
  company_name: string;
  buyer_type: string;
  crop_type: string;
  residue_type: string;
  required_quantity_tonnes: number;
  max_price_per_tonne: number;
  preferred_state: string;
  preferred_district?: string;
  max_distance_km?: number;
  required_by_date?: string;
  additional_notes?: string;
}

export interface BuyerDemandItem extends BuyerDemandInput {
  id: string;
  buyer_id: string;
  status: 'Active' | 'Fulfilled' | 'Closed';
  created_at: string;
}

export interface PurchaseRequestInput {
  listing_id?: string;
  farmer_id?: string | null;
  demand_id?: string | null;
  quantity_requested: number;
  offered_price_per_tonne: number;
  total_amount: number;
  pickup_date_preference?: string;
  note?: string;
}

export type PurchaseRequestStatus =
  | 'Pending'
  | 'Accepted'
  | 'Confirmed'
  | 'Declined'
  | 'Rejected'
  | 'Pickup_Planned'
  | 'Completed';

export interface PurchaseRequestItem extends PurchaseRequestInput {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  farmer_id?: string | null;
  farmer_name?: string;
  listing_id?: string;
  demand_id?: string | null;
  residue_type?: string;
  crop_type?: string;
  location?: string;
  status: PurchaseRequestStatus;
  accepted_at?: string;
  declined_at?: string;
  created_at: string;
}

export interface ResidueMatchItem {
  id: string;
  demand_id: string;
  listing: ResidueListingItem;
  compatibility_score: number; // e.g. 92 (for 92% Match)
  score_breakdown: {
    residueMatch: number;
    priceMatch: number;
    quantityMatch: number;
    distanceMatch: number;
    qualityMatch: number;
  };
}

export interface MarketplaceFilterState {
  searchQuery: string;
  residueType: string; // 'All' or specific type
  minQuantity: number;
  maxQuantity: number;
  maxPrice: number;
  state: string;
  district: string;
  qualityGrade: string; // 'All', 'Grade A', 'Grade B'
  sortBy: 'best_match' | 'lowest_price' | 'highest_quantity' | 'nearest_farm' | 'recently_listed';
}
