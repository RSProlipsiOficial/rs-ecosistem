-- Allow public (no-auth) to manage default-tenant maintenance reports
-- Table: public.manutencoes_van

DO $$
BEGIN
  -- Public SELECT on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'manutencoes_van'
      AND policyname = 'Public view default manutencoes'
  ) THEN
    CREATE POLICY "Public view default manutencoes"
    ON public.manutencoes_van
    FOR SELECT
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public INSERT into default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'manutencoes_van'
      AND policyname = 'Public insert default manutencoes'
  ) THEN
    CREATE POLICY "Public insert default manutencoes"
    ON public.manutencoes_van
    FOR INSERT
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public UPDATE on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'manutencoes_van'
      AND policyname = 'Public update default manutencoes'
  ) THEN
    CREATE POLICY "Public update default manutencoes"
    ON public.manutencoes_van
    FOR UPDATE
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public DELETE on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'manutencoes_van'
      AND policyname = 'Public delete default manutencoes'
  ) THEN
    CREATE POLICY "Public delete default manutencoes"
    ON public.manutencoes_van
    FOR DELETE
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
END
$$;