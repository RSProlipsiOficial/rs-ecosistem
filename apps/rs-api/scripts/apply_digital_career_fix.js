
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function applySql() {
    console.log('🚀 Aplicando Infraestrutura de Carreira Digital...');

    try {
        const sqlPath = path.join(__dirname, '../career_levels_digital_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Note: Supabase JS client doesn't have a direct execute SQL method.
        // Usually, we use an RPC 'exec_sql' if the user created it, or we use psql.
        // Since I'm an agent, I'll try to use a more direct approach if possible, 
        // or guide the user to run it in the SQL Editor.

        // However, I can try to run the critical parts via simple queries if they are DDL.
        console.log('Tentando habilitar RLS e Políticas via DDL...');

        // Enabling RLS and creating policies
        const queries = [
            `ALTER TABLE public.career_levels_digital ENABLE ROW LEVEL SECURITY;`,
            `DROP POLICY IF EXISTS "Leitura pública para todos" ON public.career_levels_digital;`,
            `CREATE POLICY "Leitura pública para todos" ON public.career_levels_digital FOR SELECT USING (true);`,
            `DROP POLICY IF EXISTS "Acesso total para service_role" ON public.career_levels_digital;`,
            `CREATE POLICY "Acesso total para service_role" ON public.career_levels_digital USING (auth.jwt() ->> 'role' = 'service_role');`,
            `GRANT SELECT ON public.career_levels_digital TO anon, authenticated;`
        ];

        for (const q of queries) {
            const { error } = await supabase.rpc('exec_sql', { sql_query: q }); // Attempt via RPC if exists
            if (error) {
                // Fallback: Try a regular query (some Supabase setups allow this via service_role in some contexts, but rare)
                // Actually, best is to report if RPC fails.
                console.log(`Failed query via RPC exec_sql: ${q}`);
                console.log(`Error: ${error.message}`);

                // If special RPC doesn't exist, we might need another way.
            } else {
                console.log(`✅ Success: ${q.substring(0, 50)}...`);
            }
        }

    } catch (err) {
        console.error('Erro ao processar SQL:', err);
    }
}

applySql();
