-- Allow public (no-auth) to manage default-tenant driver checklists
-- Table: public.checklists_motorista

DO $$
BEGIN
  -- Public SELECT on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklists_motorista'
      AND policyname = 'Public view default checklists'
  ) THEN
    CREATE POLICY "Public view default checklists"
    ON public.checklists_motorista
    FOR SELECT
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public INSERT into default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklists_motorista'
      AND policyname = 'Public insert default checklists'
  ) THEN
    CREATE POLICY "Public insert default checklists"
    ON public.checklists_motorista
    FOR INSERT
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public UPDATE on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklists_motorista'
      AND policyname = 'Public update default checklists'
  ) THEN
    CREATE POLICY "Public update default checklists"
    ON public.checklists_motorista
    FOR UPDATE
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public DELETE on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklists_motorista'
      AND policyname = 'Public delete default checklists'
  ) THEN
    CREATE POLICY "Public delete default checklists"
    ON public.checklists_motorista
    FOR DELETE
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
END
$$;