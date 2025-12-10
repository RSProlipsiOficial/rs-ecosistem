-- Enable RLS and allow authenticated users to read their own admin email row
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Drop policy if it already exists (safe guard)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_emails' AND policyname = 'Users can view own admin email'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view own admin email" ON public.admin_emails';
  END IF;
END $$;

-- Create select policy that exposes only the row matching the JWT email
CREATE POLICY "Users can view own admin email"
ON public.admin_emails
FOR SELECT
TO authenticated
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'email') = email);
