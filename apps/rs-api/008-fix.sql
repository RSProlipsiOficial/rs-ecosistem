
-- Adicionar colunas faltantes tenant_id
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE public.agenda_items ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE public.download_materials ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0; -- Also fix potential missing col
ALTER TABLE public.download_materials ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Adicionar índices para performance se não existirem
CREATE INDEX IF NOT EXISTS idx_announcements_tenant ON public.announcements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agenda_items_tenant ON public.agenda_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trainings_tenant ON public.trainings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_catalogs_tenant ON public.catalogs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materials_tenant ON public.download_materials(tenant_id);
