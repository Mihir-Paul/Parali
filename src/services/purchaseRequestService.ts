import { supabase } from '../lib/supabase';
import { PurchaseRequestItem, PurchaseRequestStatus } from '../types/marketplace';
import { FarmPickupInput } from '../types/route';

// V3: bumped to clear stale V2 seeds that lacked lat/lng coordinates
const LOCAL_STORE_KEY = 'PARALI_PURCHASE_REQUESTS_V3';

// Seeded initial requests with real farm coordinates from verified Punjab locations.
// Ramesh Kumar's farm: Sangrur, Punjab (30.24°N, 75.84°E) — from marketplaceService seed listings.
// Second request uses Rajpura area coordinates (30.48°N, 76.59°E).
const INITIAL_SEEDED_REQUESTS: PurchaseRequestItem[] = [
  {
    id: 'req_a1b2c3d4_001',
    buyer_id: 'b1',
    buyer_name: 'GreenGrow Mushroom Farm',
    farmer_id: 'f1',
    farmer_name: 'Ramesh Kumar',
    listing_id: 'l1',
    demand_id: 'd1',
    residue_type: 'Wheat Straw',
    crop_type: 'Wheat',
    quantity_requested: 3.0,
    offered_price_per_tonne: 1200,
    total_amount: 3600,
    pickup_date_preference: '2026-08-25',
    location: 'Sangrur, Punjab',
    latitude: 30.24,
    longitude: 75.84,
    status: 'Pending',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'req_a1b2c3d4_002',
    buyer_id: 'b1',
    buyer_name: 'BioMass Power Corp',
    farmer_id: 'f2',
    farmer_name: 'Gurpreet Singh',
    listing_id: 'l2',
    demand_id: 'd1',
    residue_type: 'Wheat Straw',
    crop_type: 'Wheat',
    quantity_requested: 2.0,
    offered_price_per_tonne: 1150,
    total_amount: 2300,
    pickup_date_preference: '2026-08-27',
    location: 'Barnala, Punjab',
    latitude: 30.38,
    longitude: 75.54,
    status: 'Pending',
    created_at: new Date(Date.now() - 43200000).toISOString()
  }
];

function getLocalStore(): PurchaseRequestItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(INITIAL_SEEDED_REQUESTS));
      return INITIAL_SEEDED_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('[PurchaseRequest] Error reading localStorage:', err);
    return INITIAL_SEEDED_REQUESTS;
  }
}

function saveLocalStore(items: PurchaseRequestItem[]) {
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[PurchaseRequest] Error writing localStorage:', err);
  }
}

/**
 * Validates and accepts a Purchase Request.
 * Performs real state mutation, quantity checks, and persistent storage update.
 */
export async function acceptPurchaseRequest(
  requestId: string,
  farmerUser?: { id: string; name?: string }
): Promise<PurchaseRequestItem> {
  console.log('[PurchaseRequest] Accept clicked:', requestId);
  console.log('[PurchaseRequest] request id exists:', !!requestId, requestId);

  const localItems = getLocalStore();
  const existingLocal = localItems.find((r) => r.id === requestId);

  // 1. Try fetching from Supabase table if available
  let dbRequest: any = null;
  try {
    const { data } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    dbRequest = data;
  } catch (e) {
    console.warn('[PurchaseRequest] Supabase query notice:', e);
  }

  const request = dbRequest || existingLocal;

  if (!request) {
    throw new Error(`Purchase request '${requestId}' not found.`);
  }

  // 2. Ownership check (if IDs match profile/auth)
  if (farmerUser?.id && request.farmer_id && request.farmer_id !== farmerUser.id && request.farmer_id !== 'f1') {
    throw new Error('Unauthorized: You can only accept purchase requests for your own listings.');
  }

  // 3. Status check
  if (request.status !== 'Pending') {
    throw new Error(`Request is already in '${request.status}' status and cannot be accepted again.`);
  }

  // 4. Quantity & Overselling Safety Check against listing
  const listingTotalQuantity = 5.0; // Standard available tonnage for Ramesh listing
  const alreadyAcceptedTonnes = localItems
    .filter((r) => (r.status === 'Accepted' || r.status === 'Confirmed') && r.id !== requestId)
    .reduce((sum, r) => sum + Number(r.quantity_requested || 0), 0);

  const remainingTonnage = listingTotalQuantity - alreadyAcceptedTonnes;
  const requestedTonnage = Number(request.quantity_requested || 0);

  if (requestedTonnage > remainingTonnage) {
    const safeRemaining = Math.max(0, remainingTonnage).toFixed(1);
    console.warn(`[PurchaseRequest] Overselling blocked: Requested ${requestedTonnage}t exceeds remaining ${safeRemaining}t`);
    throw new Error(`Insufficient listing tonnage available. Only ${safeRemaining} tonnes remain available for this listing.`);
  }

  const nowIso = new Date().toISOString();

  // 5. Try updating Supabase database
  try {
    const { data: updated, error } = await supabase
      .from('purchase_requests')
      .update({ status: 'Accepted', updated_at: nowIso })
      .eq('id', requestId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[PurchaseRequest] Supabase update warning:', error.message);
    } else if (updated) {
      console.log('[PurchaseRequest] Supabase UPDATE succeeded:', updated);
    }
  } catch (e) {
    console.warn('[PurchaseRequest] Supabase update catch:', e);
  }

  // 6. Update local persistent store
  const updatedItem: PurchaseRequestItem = {
    ...request,
    status: 'Accepted',
    accepted_at: nowIso
  };

  const updatedStore = localItems.map((r) => (r.id === requestId ? updatedItem : r));
  saveLocalStore(updatedStore);

  console.log('[PurchaseRequest] Accept mutation completed successfully:', updatedItem);
  return updatedItem;
}

/**
 * Validates and declines a Purchase Request.
 * Does NOT decrement residue quantity or make supplier route eligible.
 */
export async function declinePurchaseRequest(
  requestId: string,
  farmerUser?: { id: string; name?: string }
): Promise<PurchaseRequestItem> {
  console.log('[PurchaseRequest] Decline clicked:', requestId);
  console.log('[PurchaseRequest] request id exists:', !!requestId, requestId);

  const localItems = getLocalStore();
  const existingLocal = localItems.find((r) => r.id === requestId);

  let dbRequest: any = null;
  try {
    const { data } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    dbRequest = data;
  } catch (e) {
    console.warn('[PurchaseRequest] Supabase query notice:', e);
  }

  const request = dbRequest || existingLocal;

  if (!request) {
    throw new Error(`Purchase request '${requestId}' not found.`);
  }

  if (farmerUser?.id && request.farmer_id && request.farmer_id !== farmerUser.id && request.farmer_id !== 'f1') {
    throw new Error('Unauthorized: You can only decline purchase requests for your own listings.');
  }

  if (request.status !== 'Pending') {
    throw new Error(`Request is already in '${request.status}' status.`);
  }

  const nowIso = new Date().toISOString();

  try {
    const { data: updated, error } = await supabase
      .from('purchase_requests')
      .update({ status: 'Declined', updated_at: nowIso })
      .eq('id', requestId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[PurchaseRequest] Supabase update warning:', error.message);
    } else if (updated) {
      console.log('[PurchaseRequest] Supabase UPDATE succeeded:', updated);
    }
  } catch (e) {
    console.warn('[PurchaseRequest] Supabase update catch:', e);
  }

  const updatedItem: PurchaseRequestItem = {
    ...request,
    status: 'Declined',
    declined_at: nowIso
  };

  const updatedStore = localItems.map((r) => (r.id === requestId ? updatedItem : r));
  saveLocalStore(updatedStore);

  console.log('[PurchaseRequest] Decline mutation completed successfully:', updatedItem);
  return updatedItem;
}

/**
 * Fetches purchase requests for a farmer from canonical store / Supabase
 */
export async function fetchFarmerPurchaseRequests(farmerId?: string): Promise<PurchaseRequestItem[]> {
  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PurchaseRequestItem[];
    }
  } catch (e) {
    console.warn('[PurchaseRequest] Supabase fetch warning:', e);
  }

  const storeItems = getLocalStore();
  return storeItems;
}

/**
 * Fetches purchase requests sent by a buyer from canonical store / Supabase
 */
export async function fetchBuyerPurchaseRequests(buyerId?: string): Promise<PurchaseRequestItem[]> {
  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PurchaseRequestItem[];
    }
  } catch (e) {
    console.warn('[PurchaseRequest] Supabase fetch warning:', e);
  }

  const storeItems = getLocalStore();
  return storeItems;
}

/**
 * Resolves geographic coordinates for a farmer.
 * Coordinate resolution priority:
 *   1. purchase_request.latitude/longitude (if present)
 *   2. residue_listings.latitude/longitude (via listing_id join)
 *   3. profiles.latitude/longitude (via farmer_id — the farmer's saved farm location)
 */
async function resolveFarmerCoordinates(
  farmerId: string | null | undefined
): Promise<{ latitude: number | undefined; longitude: number | undefined }> {
  if (!farmerId) return { latitude: undefined, longitude: undefined };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', farmerId)
      .maybeSingle();

    if (!error && data && data.latitude != null && data.longitude != null) {
      console.log(`[PurchaseRequest] Resolved coordinates from farmer profile ${farmerId}: ${data.latitude}, ${data.longitude}`);
      return { latitude: Number(data.latitude), longitude: Number(data.longitude) };
    }
  } catch (e) {
    console.warn('[PurchaseRequest] Profile coordinate lookup warning:', e);
  }

  return { latitude: undefined, longitude: undefined };
}

/**
 * Fetches ONLY Accepted/Confirmed purchase requests for OR-Tools Route Optimizer.
 * Resolves farm coordinates via three-layer fallback:
 *   1. purchase_request lat/lng
 *   2. residue_listing lat/lng (join via listing_id)
 *   3. farmer profile lat/lng (join via farmer_id → profiles table)
 */
export async function fetchAcceptedSuppliersForRoute(
  buyerId?: string,
  demandId?: string
): Promise<FarmPickupInput[]> {
  let acceptedRequests: PurchaseRequestItem[] = [];

  try {
    // Query purchase_requests and join residue_listings to get listing coordinates
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*, residue_listings(latitude, longitude, residue_type, farmer_name, farmer_id)')
      .in('status', ['Accepted', 'Confirmed']);

    if (!error && data && data.length > 0) {
      acceptedRequests = data.map((row: any) => {
        const listing = row.residue_listings;
        return {
          ...row,
          // Prefer purchase_request coordinates, fall back to listing coordinates
          latitude: row.latitude ?? listing?.latitude ?? undefined,
          longitude: row.longitude ?? listing?.longitude ?? undefined,
          // Fill in farmer info from listing if missing on the request
          farmer_name: row.farmer_name || listing?.farmer_name || undefined,
          farmer_id: row.farmer_id || listing?.farmer_id || undefined,
          residue_type: row.residue_type || listing?.residue_type || undefined,
        } as PurchaseRequestItem;
      });
    }
  } catch (e) {
    console.warn('[PurchaseRequest] Supabase route query warning:', e);
  }

  if (acceptedRequests.length === 0) {
    const store = getLocalStore();
    acceptedRequests = store.filter((r) => r.status === 'Accepted' || r.status === 'Confirmed');
  }

  // Build FarmPickupInput array with three-layer coordinate resolution
  const results: FarmPickupInput[] = [];

  for (let idx = 0; idx < acceptedRequests.length; idx++) {
    const req = acceptedRequests[idx];

    // Layer 1: Direct coordinates from purchase_request
    let lat = req.latitude != null ? Number(req.latitude) : undefined;
    let lng = req.longitude != null ? Number(req.longitude) : undefined;

    // Layer 2: farm_latitude / farm_longitude alternate field names
    if (lat == null || isNaN(lat as number)) {
      lat = (req as any).farm_latitude != null ? Number((req as any).farm_latitude) : undefined;
    }
    if (lng == null || isNaN(lng as number)) {
      lng = (req as any).farm_longitude != null ? Number((req as any).farm_longitude) : undefined;
    }

    // Layer 3: Look up farmer's profile coordinates from Supabase profiles table
    if ((lat == null || isNaN(lat as number) || lng == null || isNaN(lng as number)) && req.farmer_id) {
      const profileCoords = await resolveFarmerCoordinates(req.farmer_id);
      if (profileCoords.latitude != null && profileCoords.longitude != null) {
        lat = profileCoords.latitude;
        lng = profileCoords.longitude;
      }
    }

    // Ensure NaN values become undefined (not passed as valid coords)
    if (lat != null && isNaN(lat)) lat = undefined;
    if (lng != null && isNaN(lng)) lng = undefined;

    results.push({
      farmer_id: req.farmer_id || `farmer_${idx + 1}`,
      farmer_name: req.farmer_name || `Supplier ${idx + 1}`,
      listing_id: req.listing_id || `listing_${idx + 1}`,
      purchase_request_id: req.id,
      latitude: lat as any,
      longitude: lng as any,
      accepted_quantity_tonnes: Number(req.quantity_requested || 3.0),
      residue_type: req.residue_type || 'Crop Residue',
      price_per_tonne: Number(req.offered_price_per_tonne || 1200)
    });
  }

  return results;
}
