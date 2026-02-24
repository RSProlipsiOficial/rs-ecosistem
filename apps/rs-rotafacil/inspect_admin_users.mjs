import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar .env manualmente para garantir
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.pGg9S0K9Q_H_wI6b6V1yW9Z-f0K9f0I9f0I9f0I9f0I'); // Service Role Mocked here if env fails, but let's try env first

// Na verdade, vou usar o que o view_file me deu
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.K0D6p-K-Yc_gU4z8388V8-o8Q6T6B9W5Q9W2vVp8C_I';

const client = createClient(SUPABASE_URL, SERVICE_ROLE);

async function inspectUsers() {
    console.log('--- AUDITORIA DE USUÁRIOS (FINAL) ---');

    const { data: users, error: uError } = await client
        .from('profiles')
        .select('id, nome, email, tipo_usuario, status, sponsor_id');

    if (uError) {
        console.error('Erro ao buscar profiles:', uError);
        return;
    }

    console.log(`\n[Profiles] Total na tabela: ${users.length}`);
    users.forEach(u => {
        console.log(`- ID: ${u.id.substring(0, 8)} | ${u.nome.padEnd(20)} | Tipo: ${u.tipo_usuario.padEnd(10)} | Sponsor: ${u.sponsor_id ? u.sponsor_id.substring(0, 8) : 'ROOT'}`);
    });

    console.log('\n--- EXECUTANDO RPC get_admin_users_list ---');
    const { data: rpcData, error: rpcError } = await client.rpc('get_admin_users_list');

    if (rpcError) {
        console.error('Erro na RPC:', rpcError);
    } else {
        console.log(`[RPC] Retornou: ${rpcData.length}`);
        rpcData.forEach(u => {
            console.log(`- ${u.nome.padEnd(20)} | Status: ${u.status}`);
        });
    }
}

inspectUsers();
