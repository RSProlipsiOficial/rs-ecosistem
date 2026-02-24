
-- 1. Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_id TEXT,
    to_number TEXT,
    message_content TEXT,
    status TEXT,
    ai_generated BOOLEAN DEFAULT false,
    context JSONB
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Users can view their own whatsapp messages" ON public.whatsapp_messages FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Users can insert their own whatsapp messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Create user_ai_credits table
CREATE TABLE IF NOT EXISTS public.user_ai_credits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mes INTEGER,
    ano INTEGER,
    creditos_usados INTEGER DEFAULT 0,
    limite_mensal INTEGER DEFAULT 100,
    UNIQUE(user_id, mes, ano)
);

ALTER TABLE public.user_ai_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_ai_credits;
CREATE POLICY "Users can view their own credits" ON public.user_ai_credits FOR SELECT USING (auth.uid() = user_id);

-- 3. Fix mensalidades_mensagens (ensure user_id exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensalidades_mensagens' AND column_name = 'user_id') THEN
        ALTER TABLE public.mensalidades_mensagens ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.mensalidades_mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.mensalidades_mensagens;
CREATE POLICY "Users can view their own messages" ON public.mensalidades_mensagens FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.mensalidades_mensagens;
CREATE POLICY "Users can insert their own messages" ON public.mensalidades_mensagens FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create 'usuarios' View for backward compatibility
CREATE OR REPLACE VIEW public.usuarios AS
SELECT
    id,
    sponsor_id AS patrocinador_id
FROM public.user_profiles;

GRANT SELECT ON public.usuarios TO authenticated;
GRANT SELECT ON public.usuarios TO service_role;
