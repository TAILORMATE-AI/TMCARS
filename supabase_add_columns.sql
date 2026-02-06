-- ==========================================================
-- TMCARS: Add all vehicle specification columns to Supabase
-- Run this SQL in Supabase SQL Editor (supabase.com -> SQL)
-- ==========================================================

-- Extended Vehicle Info
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS variant TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model_year INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS first_registration TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS construction_date TEXT;

-- Vehicle Type & Body
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS body_type TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS doors INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seats INTEGER;

-- Exterior
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color_code TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS paint_type TEXT;

-- Interior
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_color TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS upholstery TEXT;

-- Engine & Performance
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS gears INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_cc INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cylinders INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS horsepower INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS kw_power INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS torque INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS top_speed INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS acceleration NUMERIC;

-- Fuel Consumption
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_city NUMERIC;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_highway NUMERIC;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_combined NUMERIC;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_range INTEGER;

-- Emissions & Environment
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS co2_emission INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS energy_label TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS emission_class TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS particulate_filter BOOLEAN;

-- Weight & Dimensions
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS weight INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS max_weight INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS payload INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tow_weight_braked INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tow_weight_unbraked INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS wheelbase INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS length INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS height INTEGER;

-- Registration & Legal
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS license_plate TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vin TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS btw_marge TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;

-- APK & Warranty
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS apk_until TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS warranty_months INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS warranty_km INTEGER;

-- History
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS previous_owners INTEGER;

-- Rich Data (JSONB for arrays)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::JSONB;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::JSONB;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description TEXT;

-- Sold Vehicles Tracking
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

-- Done! Verify with:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vehicles' ORDER BY ordinal_position;
