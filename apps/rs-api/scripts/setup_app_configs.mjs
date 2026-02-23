
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function setupTable() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🚀 Conectado ao Postgres. Criando tabela app_configs...');

        const sql = `
            CREATE TABLE IF NOT EXISTS public.app_configs (
                key TEXT PRIMARY KEY,
                value JSONB NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- RLS e Permissões
            ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;

            -- Política para permitir que qualquer pessoa autenticada leia (Consultores e Admin)
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read' AND tablename = 'app_configs') THEN
                    CREATE POLICY "Allow authenticated read" ON public.app_configs FOR SELECT TO authenticated USING (true);
                END IF;
            END $$;

            -- Política para permitir que apenas admins editem
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admins to all' AND tablename = 'app_configs') THEN
                    CREATE POLICY "Allow admins to all" ON public.app_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
                END IF;
            END $$;

            -- Grant permissions for service_role and authenticated
            GRANT ALL ON public.app_configs TO postgres;
            GRANT ALL ON public.app_configs TO service_role;
            GRANT ALL ON public.app_configs TO authenticated;
            GRANT ALL ON public.app_configs TO anon;
        `;

        await client.query(sql);

        console.log('✅ Tabela app_configs criada com sucesso!');

    } catch (err) {
        console.error('❌ Erro ao criar tabela:', err.message);
    } finally {
        await client.end();
    }
}

setupTable();
