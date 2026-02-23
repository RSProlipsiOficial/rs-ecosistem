-- Rename existing columns for clarity
ALTER TABLE career_levels_digital 
RENAME COLUMN commission_physical TO commission_physical_rs;

ALTER TABLE career_levels_digital 
RENAME COLUMN commission_digital TO commission_rs_digital;

ALTER TABLE career_levels_digital 
RENAME COLUMN commission_affiliate TO commission_physical_affiliate;

-- Add new columns for Digital Affiliate Models
ALTER TABLE career_levels_digital 
ADD COLUMN IF NOT EXISTS commission_affiliate_digital_essential NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_affiliate_digital_professional NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_affiliate_digital_premium NUMERIC DEFAULT 0;

-- Update Data for One Star
UPDATE career_levels_digital SET
    commission_physical_rs = 27,
    commission_rs_digital = 30,
    commission_physical_affiliate = 8,
    commission_affiliate_digital_essential = 35,
    commission_affiliate_digital_professional = 35,
    commission_affiliate_digital_premium = 35
WHERE name = 'RS One Star';

-- Update Data for Two Star
UPDATE career_levels_digital SET
    commission_physical_rs = 30,
    commission_rs_digital = 35,
    commission_physical_affiliate = 9,
    commission_affiliate_digital_essential = 36,
    commission_affiliate_digital_professional = 36,
    commission_affiliate_digital_premium = 36
WHERE name = 'RS Two Star';

-- Update Data for Three Star
UPDATE career_levels_digital SET
    commission_physical_rs = 33,
    commission_rs_digital = 40,
    commission_physical_affiliate = 10,
    commission_affiliate_digital_essential = 37,
    commission_affiliate_digital_professional = 37,
    commission_affiliate_digital_premium = 37
WHERE name = 'RS Three Star';

-- Update Data for Pro Star
UPDATE career_levels_digital SET
    commission_physical_rs = 35,
    commission_rs_digital = 45,
    commission_physical_affiliate = 11,
    commission_affiliate_digital_essential = 38,
    commission_affiliate_digital_professional = 38,
    commission_affiliate_digital_premium = 38
WHERE name = 'RS Pro Star';

-- Update Data for Prime Star
UPDATE career_levels_digital SET
    commission_physical_rs = 36,
    commission_rs_digital = 50,
    commission_physical_affiliate = 12,
    commission_affiliate_digital_essential = 39,
    commission_affiliate_digital_professional = 40,
    commission_affiliate_digital_premium = 40
WHERE name = 'RS Prime Star';

-- Update Data for Elite Star
UPDATE career_levels_digital SET
    commission_physical_rs = 37,
    commission_rs_digital = 55,
    commission_physical_affiliate = 13,
    commission_affiliate_digital_essential = 40,
    commission_affiliate_digital_professional = 43,
    commission_affiliate_digital_premium = 45
WHERE name = 'RS Elite Star';

-- Update Data for Legend Star
UPDATE career_levels_digital SET
    commission_physical_rs = 38,
    commission_rs_digital = 60,
    commission_physical_affiliate = 15,
    commission_affiliate_digital_essential = 40,
    commission_affiliate_digital_professional = 45,
    commission_affiliate_digital_premium = 50
WHERE name = 'RS Legend Star';
