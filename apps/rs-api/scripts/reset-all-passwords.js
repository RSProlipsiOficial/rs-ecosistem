require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function main() {
    console.log('=== Resetando TODAS as senhas para 123456 ===\n');

    // Buscar TODOS os usuarios do Auth (paginar se necessario)
    let allUsers = [];
    let page = 1;
    const perPage = 1000;

    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
        console.error('Erro ao listar usuarios:', error.message);
        process.exit(1);
    }
    allUsers = data.users;

    console.log(`Total de usuarios no Auth: ${allUsers.length}\n`);

    let success = 0;
    let failed = 0;

    for (const user of allUsers) {
        const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
            password: '123456'
        });

        if (updateErr) {
            console.error(`  ERRO: ${user.email} - ${updateErr.message}`);
            failed++;
        } else {
            success++;
        }
    }

    console.log(`\n=== RESULTADO ===`);
    console.log(`  Sucesso: ${success}`);
    console.log(`  Falha:   ${failed}`);
    console.log(`  Total:   ${allUsers.length}`);

    // Verificar conta especifica do screenshot
    const target = allUsers.find(u => u.email === 'sefanpitaquara@gmail.com');
    if (target) {
        console.log(`\n  sefanpitaquara@gmail.com: ENCONTRADO (ID: ${target.id})`);
    } else {
        console.log(`\n  sefanpitaquara@gmail.com: NAO ENCONTRADO no Auth!`);
        // Verificar se existe no consultores
        const { data: consultor } = await supabase
            .from('consultores')
            .select('id, nome, email')
            .eq('email', 'sefanpitaquara@gmail.com')
            .maybeSingle();
        if (consultor) {
            console.log(`  MAS existe no consultores: ${consultor.nome} - PRECISA CRIAR CONTA AUTH`);
        }
    }

    process.exit(0);
}

main();
