-- Migration: Add latitude/longitude to buyer_profiles for depot location resolution.
-- These columns store the buyer's facility/depot GPS coordinates used as the
-- route optimization starting point (depot) in the OR-Tools CVRP solver.

ALTER TABLE public.buyer_profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add validation constraints for coordinate ranges
ALTER TABLE public.buyer_profiles
  ADD CONSTRAINT buyer_profiles_latitude_range
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  ADD CONSTRAINT buyer_profiles_longitude_range
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Also add validation constraints to profiles table if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_latitude_range'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_latitude_range
        CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_longitude_range'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_longitude_range
        CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$;
