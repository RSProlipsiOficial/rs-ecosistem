
INSERT INTO public.user_profiles (id, mmn_id, nome_completo, created_at, updated_at)
VALUES (
  'd107da4e-e266-41b0-947a-0c66b2f2b9ef', 
  'rsprolipsi', 
  'Rota Fácil Oficial', 
  NOW(), 
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET mmn_id = 'rsprolipsi';
