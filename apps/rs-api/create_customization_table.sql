-- Create Store Customizations table for Marketplace Storefront
CREATE TABLE IF NOT EXISTS public.store_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    hero JSONB,
    carousel_banners JSONB,
    mid_page_banner JSONB,
    footer JSONB,
    custom_css TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_tenant UNIQUE (tenant_id)
);

-- Enable RLS
ALTER TABLE public.store_customizations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for storefront)
CREATE POLICY "Public Read" ON public.store_customizations 
    FOR SELECT 
    USING (true);

-- Allow service role full access (for backend API)
CREATE POLICY "Service Role Full Access" ON public.store_customizations 
    USING (true) 
    WITH CHECK (true);

-- Create Storage Bucket for Marketplace Assets if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketplace-assets', 'marketplace-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace-assets');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace-assets');
