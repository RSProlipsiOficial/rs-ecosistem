-- Enable RLS and add policies for pagamentos_mensais to allow demo (public default user) and authenticated usage

-- Ensure table exists and set safe defaults (no-op if already set correctly)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pagamentos_mensais' AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'Table public.pagamentos_mensais or column user_id not found';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.pagamentos_mensais ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates (ignore if not present)
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Public view default pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Public view default pagamentos" ON public.pagamentos_mensais'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Public insert default pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Public insert default pagamentos" ON public.pagamentos_mensais'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Public update default pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Public update default pagamentos" ON public.pagamentos_mensais'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Public delete default pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Public delete default pagamentos" ON public.pagamentos_mensais'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Users can view their own pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their own pagamentos" ON public.pagamentos_mensais'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Users can create their own pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can create their own pagamentos" ON public.pagamentos_mensais'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Users can update their own pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their own pagamentos" ON public.pagamentos_mensais'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='pagamentos_mensais' AND policyname='Users can delete their own pagamentos';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can delete their own pagamentos" ON public.pagamentos_mensais'; END IF;
END $$;

-- Default user UUID used across the project for demo/public data
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pagamentos_mensais' AND column_name = 'user_id' AND column_default LIKE '%00000000-0000-0000-0000-000000000000%'
  ) THEN
    ALTER TABLE public.pagamentos_mensais ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;
END $$;

-- Public policies for default user (demo mode)
CREATE POLICY "Public view default pagamentos"
  ON public.pagamentos_mensais
  FOR SELECT
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Public insert default pagamentos"
  ON public.pagamentos_mensais
  FOR INSERT
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Public update default pagamentos"
  ON public.pagamentos_mensais
  FOR UPDATE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Public delete default pagamentos"
  ON public.pagamentos_mensais
  FOR DELETE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Authenticated users manage own records
CREATE POLICY "Users can view their own pagamentos"
  ON public.pagamentos_mensais
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pagamentos"
  ON public.pagamentos_mensais
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pagamentos"
  ON public.pagamentos_mensais
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pagamentos"
  ON public.pagamentos_mensais
  FOR DELETE
  USING (auth.uid() = user_id);
