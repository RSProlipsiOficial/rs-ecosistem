require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function main() {
    const { data: authData } = await supabase.auth.admin.listUsers();

    console.log(`Total de usuarios no Auth: ${authData.users.length}\n`);

    // Listar todos os usuarios do Auth
    authData.users.forEach(u => {
        console.log(`  ${u.email} => ${u.id}`);
    });

    // Verificar quais consultores tem user_id apontando para Auth UUID valido
    const { data: consultores } = await supabase
        .from('consultores')
        .select('id, nome, email, user_id, username')
        .not('user_id', 'is', null)
        .limit(20);

    console.log('\n=== Consultores com user_id ===');
    consultores.forEach(c => {
        const authMatch = authData.users.find(u => u.id === c.user_id);
        const status = authMatch ? '✅ LINKADO' : '❌ SEM AUTH';
        console.log(`  ${c.nome} (${c.email}) => user_id: ${c.user_id?.substring(0, 8)}... ${status} | username: ${c.username}`);
    });

    process.exit(0);
}

main();
