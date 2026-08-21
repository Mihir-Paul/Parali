export type UserRole = 'farmer' | 'buyer' | 'admin' | 'none';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: 'farmer' | 'buyer';
  phone?: string;
  state?: string;
  district?: string;
  village?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  language?: string;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export type FarmType = 'smallholder' | 'medium' | 'large' | 'cooperative';

export interface FarmerProfile {
  id: string;
  primary_crop?: string;
  land_area_acres?: number;
  farm_type?: FarmType;
  residue_types?: string[];
  estimated_residue_tonnes?: number;
  created_at?: string;
  updated_at?: string;
}

export type BuyerType =
  | 'mushroom_farm'
  | 'paper_mill'
  | 'biomass_plant'
  | 'biofuel'
  | 'cattle_feed'
  | 'compost'
  | 'other';

export interface BuyerProfile {
  id: string;
  business_name: string;
  buyer_type?: BuyerType;
  required_residue_types?: string[];
  required_quantity_tonnes?: number;
  procurement_radius_km?: number;
  business_description?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FullUserProfile {
  profile: UserProfile;
  farmerProfile?: FarmerProfile | null;
  buyerProfile?: BuyerProfile | null;
}

export interface FarmerOnboardingInput {
  full_name: string;
  phone: string;
  state: string;
  district: string;
  village: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  primary_crop: string;
  land_area_acres: number;
  farm_type: FarmType;
  residue_types: string[];
  estimated_residue_tonnes: number;
}

export interface BuyerOnboardingInput {
  full_name: string;
  phone: string;
  state: string;
  district: string;
  village?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  business_name: string;
  buyer_type: BuyerType;
  business_description?: string;
  required_residue_types: string[];
  required_quantity_tonnes: number;
  procurement_radius_km: number;
}
