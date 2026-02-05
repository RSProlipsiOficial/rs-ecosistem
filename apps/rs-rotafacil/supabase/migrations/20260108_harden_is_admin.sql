-- Hardening is_admin() function
-- Date: 2026-01-08
-- Description: Changes is_admin() from checking JWT metadata (insecure) to checking admin_emails table (secure source of truth).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Prevent search_path hijacking
AS $$
BEGIN
  -- Check if the user's email exists in the admin_emails table
  -- We use auth.jwt() ->> 'email' which is reliable from the auth provider
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$;
