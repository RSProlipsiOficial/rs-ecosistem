const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo'; // service key

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Buscando SEDE RS PRÓLIPSI e Emanuel Mendes...");
    
    // Buscar em consultores
    const { data: consultores, error } = await supabase
        .from('consultores')
        .select('*')
        .or('nome.ilike.%sede rs%,nome.ilike.%emanuel%');

    if (error) {
        console.error("Erro consultores:", error);
    } else {
        console.log("Consultores encontrados:", consultores.map(c => ({
            id: c.id,
            nome: c.nome,
            email: c.email,
            status: c.status,
            mmn_id: c.mmn_id
        })));
    }

    // Buscar em user_profiles também para garantir
    const { data: profiles, error: errProf } = await supabase
        .from('user_profiles')
        .select('*')
        .or('nome_completo.ilike.%sede rs%,nome_completo.ilike.%emanuel%');

    if (errProf) {
        console.error("Erro profiles:", errProf);
    } else {
        console.log("Profiles encontrados:", profiles.map(p => ({
            id: p.id,
            user_id: p.user_id,
            nome: p.nome_completo,
            status: p.status,
            active: p.active
        })));
    }
}

main();
