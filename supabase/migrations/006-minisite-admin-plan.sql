-- Add 'plan' column to minisite_profiles if it doesn't exist
ALTER TABLE public.minisite_profiles 
ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';

-- Update the specific user to admin_master
-- We use a DO block to find the user ID by email to avoid hardcoding UUIDs if possible, 
-- though updating by email directly in auth.users is not standard for app logic, here we update our profile table.
-- BUT, we also need to sync this 'plan' to the App logic which might be reading from metadata or this table.
-- The App.tsx currently uses metadata OR defaults to 'free'. We are changing it to read from here.

DO $$
BEGIN
    UPDATE public.minisite_profiles
    SET plan = 'admin_master'
    FROM auth.users
    WHERE public.minisite_profiles.id = auth.users.id
    AND auth.users.email = 'rsprolipsioficial@gmail.com';
END
$$;
