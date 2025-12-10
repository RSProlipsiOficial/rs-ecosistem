-- Allow public (no auth) to manage the shared "default user" checklist items
-- Table: public.checklist_items_personalizados
-- Reason: Client inserts use user_id '00000000-0000-0000-0000-000000000000' when no session; current RLS blocks INSERT/SELECT

DO $$
BEGIN
  -- Public SELECT on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklist_items_personalizados'
      AND policyname = 'Public view default checklist items'
  ) THEN
    CREATE POLICY "Public view default checklist items"
    ON public.checklist_items_personalizados
    FOR SELECT
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public INSERT into default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklist_items_personalizados'
      AND policyname = 'Public insert default checklist items'
  ) THEN
    CREATE POLICY "Public insert default checklist items"
    ON public.checklist_items_personalizados
    FOR INSERT
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public UPDATE on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklist_items_personalizados'
      AND policyname = 'Public update default checklist items'
  ) THEN
    CREATE POLICY "Public update default checklist items"
    ON public.checklist_items_personalizados
    FOR UPDATE
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Public DELETE on default tenant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'checklist_items_personalizados'
      AND policyname = 'Public delete default checklist items'
  ) THEN
    CREATE POLICY "Public delete default checklist items"
    ON public.checklist_items_personalizados
    FOR DELETE
    USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
END
$$;
