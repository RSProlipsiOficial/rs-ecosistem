const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setStoragePolicies() {
    console.log('--- Configurando Políticas de Storage (Passo a Passo) ---');

    const policies = [
        {
            name: "Public Access Avatars",
            bucket: "avatars"
        },
        {
            name: "Public Access Public",
            bucket: "public"
        },
        {
            name: "Public Access Geral",
            bucket: "geral"
        },
        {
            name: "Public Access Images",
            bucket: "images"
        }
    ];

    for (const p of policies) {
        console.log(`Configurando política para bucket ${p.bucket}...`);
        const sql = `
      DO $$
      BEGIN
          -- Remover política se existir
          DROP POLICY IF EXISTS "${p.name}" ON storage.objects;
          
          -- Criar nova política permitindo tudo para o bucket específico (Dev mode)
          CREATE POLICY "${p.name}" ON storage.objects 
          FOR ALL 
          TO public 
          USING (bucket_id = '${p.bucket}') 
          WITH CHECK (bucket_id = '${p.bucket}');
      END $$;
    `;

        const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

        if (error) {
            console.error(`Erro no bucket ${p.bucket}:`, error.message);
        } else {
            console.log(`Sucesso no bucket ${p.bucket}!`);
        }
    }
}

setStoragePolicies();
