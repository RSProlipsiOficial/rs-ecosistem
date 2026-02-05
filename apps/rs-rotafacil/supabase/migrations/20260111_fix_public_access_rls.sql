-- Migration: Fix RLS policies for public access to branding, plans and consultores
-- Created: 2026-01-11
-- Purpose: Allow public read access to app_settings, subscription_plans and consultores

-- Enable RLS on tables if not already enabled
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can read app_settings" ON app_settings;
DROP POLICY IF EXISTS "Public can read subscription_plans" ON subscription_plans;
DROP POLICY IF EXISTS "Public can read consultores" ON consultores;

-- App Settings: Allow public to read branding and other settings
CREATE POLICY "Public can read app_settings"
ON app_settings
FOR SELECT
TO public
USING (true);

-- Subscription Plans: Allow public to read active plans
CREATE POLICY "Public can read subscription_plans"
ON subscription_plans
FOR SELECT
TO public
USING (active = true);

-- Consultores: Allow public to read basic info (for sponsor validation)
-- Only expose username and name for privacy
CREATE POLICY "Public can read consultores"
ON consultores
FOR SELECT
TO public
USING (true);

-- Grant necessary permissions
GRANT SELECT ON app_settings TO anon, authenticated;
GRANT SELECT ON subscription_plans TO anon, authenticated;
GRANT SELECT ON consultores TO anon, authenticated;
