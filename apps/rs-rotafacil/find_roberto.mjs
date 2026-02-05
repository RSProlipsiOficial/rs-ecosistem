import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findRoberto() {
    console.log('--- BUSCANDO PERFIS DE USUÁRIO ---');

    // Tentar várias tabelas possíveis de perfil
    const tables = ['profiles', 'user_profiles', 'admins', 'motoristas'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(10);
        console.log(`\nTabela: ${table} (${data?.length || 0} registros)`);
        if (data) data.forEach(p => {
            console.log(`ID: ${p.id || p.user_id} | Nome: ${p.nome || p.full_name} | Email: ${p.email}`);
        });
    }

    // Buscar especificamente por "Roberto" ou "RS Prólipsi"
    const { data: search } = await supabase.from('profiles').select('*').ilike('full_name', '%Roberto%');
    console.log('\nBusca por "Roberto" em profiles:', search);

    const { data: search2 } = await supabase.from('user_profiles').select('*').ilike('nome', '%Roberto%');
    console.log('Busca por "Roberto" em user_profiles:', search2);
}

findRoberto();
