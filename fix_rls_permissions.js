const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function fixRLS() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log("Habilitando RLS e criando políticas para user_profiles...");

        await client.query(`
            -- Habilita RLS
            ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

            -- Remove políticas antigas se existirem para evitar conflito
            DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
            DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
            DROP POLICY IF EXISTS "Service role has full access" ON public.user_profiles;

            -- Libera leitura total para anon/authenticated por enquanto (Para facilitar o MVP)
            -- Ou política restrita por user_id:
            CREATE POLICY "Users can view their own profile" 
            ON public.user_profiles FOR SELECT 
            USING (true); -- Para facilitar, permitimos leitura. No futuro: auth.uid() = user_id

            CREATE POLICY "Users can update their own profile" 
            ON public.user_profiles FOR UPDATE 
            USING (true);

            -- Garantir permissões de SELECT/UPDATE para os roles
            GRANT ALL ON public.user_profiles TO anon;
            GRANT ALL ON public.user_profiles TO authenticated;
            GRANT ALL ON public.user_profiles TO service_role;
            
            -- Fazer o mesmo para a tabela consultores
            ALTER TABLE public.consultores ENABLE ROW LEVEL SECURITY;
            DROP POLICY IF EXISTS "Enable all access for all users" ON public.consultores;
            CREATE POLICY "Enable all access for all users" ON public.consultores FOR ALL USING (true);
            GRANT ALL ON public.consultores TO anon;
            GRANT ALL ON public.consultores TO authenticated;
        `);

        console.log("Políticas e Permissões configuradas!");
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await client.end();
    }
}

fixRLS();
