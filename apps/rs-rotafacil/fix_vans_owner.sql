
-- Transfer vans from old user to 'rsprolipsi' (Rota Fácil Oficial)
UPDATE public.vans 
SET user_id = '02862f11-1ac8-4008-9188-37541fbdef02' 
WHERE user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
