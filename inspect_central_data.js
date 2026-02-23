const { createClient } = require('@supabase/supabase-js');

const CENTRAL_SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(CENTRAL_SUPABASE_URL, SERVICE_ROLE_KEY);

async function exhaustiveCheck() {
    const email = 'rsprolipsioficial@gmail.com';

    console.log(`--- Buscando TODOS os registros na tabela 'consultores' para ${email} ---`);
    const { data: consultores, error: err1 } = await supabase
        .from('consultores')
        .select('*')
        .eq('email', email);

    if (err1) console.error("Erro consultores:", err1);
    console.log(`Encontrados ${consultores?.length || 0} consultores.`);

    for (const c of (consultores || [])) {
        console.log(`\nCONSULTOR ID: ${c.id}`);
        console.log(`Nome: ${c.nome}`);
        console.log(`Localização: ${c.cidade}/${c.estado}`);

        console.log(`> Buscando 'user_profiles'...`);
        const { data: p } = await supabase.from('user_profiles').select('*').eq('user_id', c.id).maybeSingle();
        console.log(p ? `  Encontrado perfil: ${p.nome_completo}` : `  Nenhum user_profile.`);

        console.log(`> Buscando 'minisite_profiles'...`);
        const { data: mp } = await supabase.from('minisite_profiles').select('*').eq('id', c.id).maybeSingle();
        console.log(mp ? `  Encontrado Minisite: ${mp.name} (Endereço: ${mp.address_street})` : `  Nenhum minisite_profile.`);
    }
}

exhaustiveCheck();
