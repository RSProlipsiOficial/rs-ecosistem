require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function main() {
    console.log('=== Corrigindo linkage user_id (consultores -> Auth UUID) ===\n');

    // 1. Buscar todos os usuarios do Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) {
        console.error('Erro ao listar Auth users:', authErr.message);
        process.exit(1);
    }

    const authMap = new Map();
    authData.users.forEach(u => {
        if (u.email) authMap.set(u.email.toLowerCase().trim(), u.id);
    });

    console.log(`Auth users encontrados: ${authMap.size}\n`);

    // 2. Buscar todos os consultores
    const { data: consultores, error: consultErr } = await supabase
        .from('consultores')
        .select('id, nome, email, user_id')
        .not('email', 'is', null);

    if (consultErr) {
        console.error('Erro ao buscar consultores:', consultErr.message);
        process.exit(1);
    }

    console.log(`Consultores encontrados: ${consultores.length}\n`);

    let corrigidos = 0;
    let jaCorretos = 0;
    let semAuth = 0;

    for (const c of consultores) {
        const email = c.email?.toLowerCase().trim();
        if (!email) continue;

        const authUUID = authMap.get(email);

        if (!authUUID) {
            // Consultor nao tem conta no Auth
            semAuth++;
            continue;
        }

        if (c.user_id === authUUID) {
            // Ja esta correto
            jaCorretos++;
            continue;
        }

        // Precisa corrigir
        const { error: updateErr } = await supabase
            .from('consultores')
            .update({ user_id: authUUID })
            .eq('id', c.id);

        if (updateErr) {
            console.error(`  ERRO ao corrigir ${c.nome} (${email}): ${updateErr.message}`);
        } else {
            console.log(`  CORRIGIDO: ${c.nome} (${email})`);
            console.log(`    Antes:  ${c.user_id}`);
            console.log(`    Depois: ${authUUID}`);
            corrigidos++;
        }
    }

    console.log(`\n=== RESULTADO ===`);
    console.log(`  Corrigidos:   ${corrigidos}`);
    console.log(`  Ja corretos:  ${jaCorretos}`);
    console.log(`  Sem Auth:     ${semAuth}`);
    console.log(`  Total:        ${consultores.length}`);

    process.exit(0);
}

main();
