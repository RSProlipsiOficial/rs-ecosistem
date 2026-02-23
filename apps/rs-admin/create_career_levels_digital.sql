-- Tabela para Níveis de Carreira Digital (Drop/Afiliado)
CREATE TABLE IF NOT EXISTS public.career_levels_digital (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  required_volume numeric DEFAULT 0,
  commission_percentage numeric DEFAULT 0,
  award text,
  pin_image text,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT career_levels_digital_pkey PRIMARY KEY (id)
);

-- Políticas de Segurança (Row Level Security)
ALTER TABLE public.career_levels_digital ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (todos podem ver os níveis)
CREATE POLICY "Enable read access for all users" ON public.career_levels_digital FOR SELECT USING (true);

-- Permitir escrita apenas para admins (service_role ou role específica)
-- Ajuste conforme sua estrutura de roles. Aqui permitimos service_role e autenticados de admin.
-- Assume auth.role() check or custom claims
CREATE POLICY "Enable all for admins and service_role" ON public.career_levels_digital FOR ALL USING (
  auth.role() = 'service_role' OR 
  (auth.jwt() ->> 'role' = 'admin') OR 
  (auth.jwt() ->> 'role' = 'super_admin')
);

-- Habilitar Realtime
alter publication supabase_realtime add table public.career_levels_digital;
