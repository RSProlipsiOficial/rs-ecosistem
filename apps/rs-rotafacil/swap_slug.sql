
-- 1. Rename the current holder of 'rsprolipsi' to free the slug
UPDATE public.user_profiles
SET mmn_id = 'rsprolipsi_old'
WHERE id = '02862f11-1ac8-4008-9188-37541fbdef02';

-- 2. Assign 'rsprolipsi' to the user who owns the vans (d107da4e...)
UPDATE public.user_profiles
SET mmn_id = 'rsprolipsi'
WHERE id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
