
-- RESTORE ORIGINAL USER SLUG
-- 1. Ensure no conflict (if d107da4e somehow got it, remove it)
UPDATE public.user_profiles
SET mmn_id = 'temp_cleanup_slug'
WHERE mmn_id = 'rsprolipsi' AND id != '02862f11-1ac8-4008-9188-37541fbdef02';

-- 2. Restore the original user (Rota Fácil Oficial) back to 'rsprolipsi'
UPDATE public.user_profiles
SET mmn_id = 'rsprolipsi'
WHERE id = '02862f11-1ac8-4008-9188-37541fbdef02';
