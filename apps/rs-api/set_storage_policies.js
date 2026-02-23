const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setPolicies() {
    console.log('--- Configurando Políticas de Storage ---');

    const sql = `
    -- Permitir acesso público de leitura
    BEGIN;
    
    -- Limpar políticas antigas se existirem para evitar erros de duplicidade
    DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access Public" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access Geral" ON storage.objects;
    
    -- Criar novas políticas permissivas para o ambiente de dev
    CREATE POLICY "Public Access Avatars" ON storage.objects FOR ALL TO public USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
    CREATE POLICY "Public Access Public" ON storage.objects FOR ALL TO public USING (bucket_id = 'public') WITH CHECK (bucket_id = 'public');
    CREATE POLICY "Public Access Geral" ON storage.objects FOR ALL TO public USING (bucket_id = 'geral') WITH CHECK (bucket_id = 'geral');
    
    COMMIT;
  `;

    try {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

        if (error) {
            console.error('Erro ao configurar políticas via RPC:', error.message);

            // Tentativa 2: Sem o BEGIN/COMMIT se o RPC já lidar com isso
            const sqlSimple = `
        CREATE POLICY "Public Access Avatars" ON storage.objects FOR ALL TO public USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
      `;
            await supabase.rpc('execute_sql', { sql_query: sqlSimple });
        } else {
            console.log('Políticas de Storage configuradas com sucesso!');
        }
    } catch (err) {
        console.error('Exceção ao configurar políticas:', err.message);
    }
}

setPolicies();
