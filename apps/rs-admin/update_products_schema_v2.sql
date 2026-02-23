-- Add product classification columns
ALTER TABLE product_catalog 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'physical', -- 'physical', 'digital'
ADD COLUMN IF NOT EXISTS affiliate_model VARCHAR(50) DEFAULT 'none', -- 'none', 'essential', 'professional', 'premium' (only for digital affiliate)
ADD COLUMN IF NOT EXISTS commission_origin VARCHAR(50) DEFAULT 'rs_physical'; -- 'rs_physical', 'rs_digital', 'affiliate_physical', 'affiliate_digital'

-- Add check constraint for valid types if desired, but keeping it flexible for now is often better for migrations.
-- Update existing products to default (assuming most are RS Physical for now, or null)
UPDATE product_catalog SET product_type = 'physical', commission_origin = 'rs_physical' WHERE product_type IS NULL;
