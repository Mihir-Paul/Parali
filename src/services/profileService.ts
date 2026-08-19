import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import {
  UserProfile,
  FarmerProfile,
  BuyerProfile,
  FullUserProfile,
  FarmerOnboardingInput,
  BuyerOnboardingInput
} from '../types/profile';

/**
 * Fetch full profile including role-specific sub-table data from Supabase
 */
export async function fetchFullUserProfile(userId: string): Promise<FullUserProfile | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching master profile from Supabase:', profileError.message);
      return null;
    }

    if (!profile) {
      return null;
    }

    let farmerProfile: FarmerProfile | null = null;
    let buyerProfile: BuyerProfile | null = null;

    if (profile.role === 'farmer') {
      const { data: fData, error: fError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fError) {
        console.warn('Error fetching farmer profile:', fError.message);
      } else {
        farmerProfile = fData;
      }
    } else if (profile.role === 'buyer') {
      const { data: bData, error: bError } = await supabase
        .from('buyer_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (bError) {
        console.warn('Error fetching buyer profile:', bError.message);
      } else {
        buyerProfile = bData;
      }
    }

    return {
      profile: profile as UserProfile,
      farmerProfile,
      buyerProfile
    };
  } catch (err: any) {
    console.error('Unexpected error in fetchFullUserProfile:', err.message || err);
    return null;
  }
}

/**
 * Save complete Farmer profile during onboarding
 */
export async function saveFarmerProfile(
  user: User,
  input: FarmerOnboardingInput
): Promise<FullUserProfile> {
  const profilePayload: Partial<UserProfile> = {
    id: user.id,
    full_name: input.full_name,
    email: user.email || '',
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    role: 'farmer',
    phone: input.phone,
    state: input.state,
    district: input.district,
    village: input.village,
    address: input.address || '',
    latitude: input.latitude || undefined,
    longitude: input.longitude || undefined,
    onboarding_completed: true,
    updated_at: new Date().toISOString()
  };

  const { data: savedProfile, error: profileErr } = await supabase
    .from('profiles')
    .upsert(profilePayload)
    .select()
    .single();

  if (profileErr) {
    console.error('Supabase profiles upsert error:', profileErr);
    throw new Error(formatSupabaseError(profileErr));
  }

  const farmerPayload: Partial<FarmerProfile> = {
    id: user.id,
    primary_crop: input.primary_crop,
    land_area_acres: input.land_area_acres,
    farm_type: input.farm_type,
    residue_types: input.residue_types,
    estimated_residue_tonnes: input.estimated_residue_tonnes,
    updated_at: new Date().toISOString()
  };

  const { data: savedFarmer, error: farmerErr } = await supabase
    .from('farmer_profiles')
    .upsert(farmerPayload)
    .select()
    .single();

  if (farmerErr) {
    console.error('Supabase farmer_profiles upsert error:', farmerErr);
    throw new Error(formatSupabaseError(farmerErr));
  }

  return {
    profile: savedProfile as UserProfile,
    farmerProfile: savedFarmer as FarmerProfile,
    buyerProfile: null
  };
}

/**
 * Save complete Buyer profile during onboarding
 */
export async function saveBuyerProfile(
  user: User,
  input: BuyerOnboardingInput
): Promise<FullUserProfile> {
  const profilePayload: Partial<UserProfile> = {
    id: user.id,
    full_name: input.full_name,
    email: user.email || '',
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    role: 'buyer',
    phone: input.phone,
    state: input.state,
    district: input.district,
    village: input.village || '',
    address: input.address || '',
    latitude: input.latitude || undefined,
    longitude: input.longitude || undefined,
    onboarding_completed: true,
    updated_at: new Date().toISOString()
  };

  const { data: savedProfile, error: profileErr } = await supabase
    .from('profiles')
    .upsert(profilePayload)
    .select()
    .single();

  if (profileErr) {
    console.error('Supabase profiles upsert error:', profileErr);
    throw new Error(formatSupabaseError(profileErr));
  }

  const buyerPayload: Partial<BuyerProfile> = {
    id: user.id,
    business_name: input.business_name,
    buyer_type: input.buyer_type,
    required_residue_types: input.required_residue_types,
    required_quantity_tonnes: input.required_quantity_tonnes,
    procurement_radius_km: input.procurement_radius_km,
    business_description: input.business_description || '',
    updated_at: new Date().toISOString()
  };

  const { data: savedBuyer, error: buyerErr } = await supabase
    .from('buyer_profiles')
    .upsert(buyerPayload)
    .select()
    .single();

  if (buyerErr) {
    console.error('Supabase buyer_profiles upsert error:', buyerErr);
    throw new Error(formatSupabaseError(buyerErr));
  }

  return {
    profile: savedProfile as UserProfile,
    farmerProfile: null,
    buyerProfile: savedBuyer as BuyerProfile
  };
}

/**
 * Update existing profile information
 */
export async function updateFullUserProfile(
  userId: string,
  profileUpdates: Partial<UserProfile>,
  roleUpdates?: Partial<FarmerProfile> | Partial<BuyerProfile>
): Promise<FullUserProfile | null> {
  const { data: updatedMaster, error: masterErr } = await supabase
    .from('profiles')
    .update({ ...profileUpdates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (masterErr) {
    console.error('Update master profile error:', masterErr);
    throw new Error(formatSupabaseError(masterErr));
  }

  let farmerData: FarmerProfile | null = null;
  let buyerData: BuyerProfile | null = null;

  if (updatedMaster.role === 'farmer' && roleUpdates) {
    const { data: fData, error: fErr } = await supabase
      .from('farmer_profiles')
      .update({ ...roleUpdates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (fErr) {
      console.error('Update farmer profile error:', fErr);
    } else {
      farmerData = fData;
    }
  } else if (updatedMaster.role === 'buyer' && roleUpdates) {
    const { data: bData, error: bErr } = await supabase
      .from('buyer_profiles')
      .update({ ...roleUpdates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (bErr) {
      console.error('Update buyer profile error:', bErr);
    } else {
      buyerData = bData;
    }
  }

  return {
    profile: updatedMaster as UserProfile,
    farmerProfile: farmerData,
    buyerProfile: buyerData
  };
}

/**
 * User-friendly error message formatter
 */
function formatSupabaseError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  if (error.code === '23505') {
    return 'A profile with these details already exists. Please refresh the page.';
  }
  if (error.code === '42501' || error.message?.includes('RLS')) {
    return 'Permission denied by security policy. Please make sure you are signed in.';
  }
  return error.message || 'Failed to save profile data to Supabase.';
}
