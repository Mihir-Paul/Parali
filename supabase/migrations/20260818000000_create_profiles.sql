-- Supabase Migration: Production-Grade Profiles & Role-Based Schema with RLS
-- Migration file: supabase/migrations/20260818000000_create_profiles.sql

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer')),
    phone TEXT,
    state TEXT,
    district TEXT,
    village TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    language TEXT DEFAULT 'en',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create FARMER_PROFILES Table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_crop TEXT,
    land_area_acres NUMERIC,
    farm_type TEXT CHECK (farm_type IS NULL OR farm_type IN ('smallholder', 'medium', 'large', 'cooperative')),
    residue_types TEXT[],
    estimated_residue_tonnes NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create BUYER_PROFILES Table
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    buyer_type TEXT CHECK (buyer_type IS NULL OR buyer_type IN ('mushroom_farm', 'paper_mill', 'biomass_plant', 'biofuel', 'cattle_feed', 'compost', 'other')),
    required_residue_types TEXT[],
    required_quantity_tonnes NUMERIC,
    procurement_radius_km NUMERIC,
    business_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_farmer_profiles_updated_at ON public.farmer_profiles;
CREATE TRIGGER set_farmer_profiles_updated_at
    BEFORE UPDATE ON public.farmer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_buyer_profiles_updated_at ON public.buyer_profiles;
CREATE TRIGGER set_buyer_profiles_updated_at
    BEFORE UPDATE ON public.buyer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 7. RLS Policies for FARMER_PROFILES
DROP POLICY IF EXISTS "Farmers can view own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Farmers can view own farmer profile"
    ON public.farmer_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Farmers can insert own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Farmers can insert own farmer profile"
    ON public.farmer_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Farmers can update own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Farmers can update own farmer profile"
    ON public.farmer_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 8. RLS Policies for BUYER_PROFILES
DROP POLICY IF EXISTS "Buyers can view own buyer profile" ON public.buyer_profiles;
CREATE POLICY "Buyers can view own buyer profile"
    ON public.buyer_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Buyers can insert own buyer profile" ON public.buyer_profiles;
CREATE POLICY "Buyers can insert own buyer profile"
    ON public.buyer_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Buyers can update own buyer profile" ON public.buyer_profiles;
CREATE POLICY "Buyers can update own buyer profile"
    ON public.buyer_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_state_district ON public.profiles(state, district);
