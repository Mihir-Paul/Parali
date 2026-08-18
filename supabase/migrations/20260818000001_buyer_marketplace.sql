-- Supabase Migration: Buyer Marketplace, Buyer Demands, Purchase Requests & Matches Schema
-- Migration file: supabase/migrations/20260818000001_buyer_marketplace.sql

-- 1. Create RESIDUE_LISTINGS Table (if not exists)
CREATE TABLE IF NOT EXISTS public.residue_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_name TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    residue_type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    price_per_tonne NUMERIC NOT NULL,
    pickup_location TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    village TEXT,
    quality_grade TEXT DEFAULT 'Grade A',
    moisture_pct NUMERIC DEFAULT 12,
    pickup_ready_date DATE NOT NULL,
    status TEXT CHECK (status IN ('Listed', 'Matched', 'Confirmed', 'Pickup', 'Paid')) DEFAULT 'Listed',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create BUYER_DEMANDS Table
CREATE TABLE IF NOT EXISTS public.buyer_demands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    buyer_type TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    residue_type TEXT NOT NULL,
    required_quantity_tonnes NUMERIC NOT NULL,
    max_price_per_tonne NUMERIC NOT NULL,
    preferred_state TEXT,
    preferred_district TEXT,
    max_distance_km NUMERIC DEFAULT 50,
    required_by_date DATE,
    additional_notes TEXT,
    status TEXT CHECK (status IN ('Active', 'Fulfilled', 'Closed')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create PURCHASE_REQUESTS Table
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.residue_listings(id) ON DELETE CASCADE,
    demand_id UUID REFERENCES public.buyer_demands(id) ON DELETE SET NULL,
    quantity_requested NUMERIC NOT NULL,
    offered_price_per_tonne NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    pickup_date_preference DATE,
    note TEXT,
    status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Rejected', 'Completed')) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create MATCHES Table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID REFERENCES public.buyer_demands(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.residue_listings(id) ON DELETE CASCADE,
    compatibility_score NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('Suggested', 'Contacted', 'Contracted', 'Dismissed')) DEFAULT 'Suggested',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS set_residue_listings_updated_at ON public.residue_listings;
CREATE TRIGGER set_residue_listings_updated_at
    BEFORE UPDATE ON public.residue_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_buyer_demands_updated_at ON public.buyer_demands;
CREATE TRIGGER set_buyer_demands_updated_at
    BEFORE UPDATE ON public.buyer_demands
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_purchase_requests_updated_at ON public.purchase_requests;
CREATE TRIGGER set_purchase_requests_updated_at
    BEFORE UPDATE ON public.purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable ROW LEVEL SECURITY (RLS)
ALTER TABLE public.residue_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for RESIDUE_LISTINGS
DROP POLICY IF EXISTS "Anyone authenticated can view residue listings" ON public.residue_listings;
CREATE POLICY "Anyone authenticated can view residue listings"
    ON public.residue_listings FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Farmers can insert own residue listings" ON public.residue_listings;
CREATE POLICY "Farmers can insert own residue listings"
    ON public.residue_listings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can update own residue listings" ON public.residue_listings;
CREATE POLICY "Farmers can update own residue listings"
    ON public.residue_listings FOR UPDATE
    TO authenticated
    USING (auth.uid() = farmer_id);

-- 7. RLS Policies for BUYER_DEMANDS
DROP POLICY IF EXISTS "Anyone authenticated can view buyer demands" ON public.buyer_demands;
CREATE POLICY "Anyone authenticated can view buyer demands"
    ON public.buyer_demands FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Buyers can insert own demands" ON public.buyer_demands;
CREATE POLICY "Buyers can insert own demands"
    ON public.buyer_demands FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers can update own demands" ON public.buyer_demands;
CREATE POLICY "Buyers can update own demands"
    ON public.buyer_demands FOR UPDATE
    TO authenticated
    USING (auth.uid() = buyer_id);

-- 8. RLS Policies for PURCHASE_REQUESTS
DROP POLICY IF EXISTS "Buyers and farmers can view relevant purchase requests" ON public.purchase_requests;
CREATE POLICY "Buyers and farmers can view relevant purchase requests"
    ON public.purchase_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Buyers can insert purchase requests" ON public.purchase_requests;
CREATE POLICY "Buyers can insert purchase requests"
    ON public.purchase_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers and farmers can update purchase requests" ON public.purchase_requests;
CREATE POLICY "Buyers and farmers can update purchase requests"
    ON public.purchase_requests FOR UPDATE
    TO authenticated
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

-- 9. RLS Policies for MATCHES
DROP POLICY IF EXISTS "Anyone authenticated can view matches" ON public.matches;
CREATE POLICY "Anyone authenticated can view matches"
    ON public.matches FOR SELECT
    TO authenticated
    USING (true);

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_residue_crop_status ON public.residue_listings(crop_type, status);
CREATE INDEX IF NOT EXISTS idx_residue_state_district ON public.residue_listings(state, district);
CREATE INDEX IF NOT EXISTS idx_demands_buyer_status ON public.buyer_demands(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_buyer_farmer ON public.purchase_requests(buyer_id, farmer_id);
