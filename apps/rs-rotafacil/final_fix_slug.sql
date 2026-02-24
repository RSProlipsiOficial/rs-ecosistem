
-- 1. Move the system user out of the way
UPDATE public.user_profiles
SET mmn_id = 'rota_facil_oficial_sys'
WHERE id = '02862f11-1ac8-4008-9188-37541fbdef02';

-- 2. Create/Update profile for the Van Owner (d107da4e...) and give them the 'rsprolipsi' slug
INSERT INTO public.user_profiles (id, mmn_id, nome_completo, created_at, updated_at)
VALUES (
  'd107da4e-e266-41b0-947a-0c66b2f2b9ef', 
  'rsprolipsi', 
  'Transporte Escolar Oficial', 
  NOW(), 
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET mmn_id = 'rsprolipsi',
    updated_at = NOW();
