const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const ownerEmails = [
    'robertocamargooficial@gmail.com',
    'rsprolipsioficial@gmail.com',
    'xtntplay@gmail.com',
    'matheusdorneles2804@gmail.com'
];

async function checkOwnersPattern() {
    try {
        console.log('--- ANALISANDO PADRÃO DOS PROPRIETÁRIOS ---');

        // 1. Buscar perfis pelos emails conhecidos
        // Como user_profiles não tem email, vamos buscar em usuarios primeiro para pegar o ID
        const { data: users } = await supabase
            .from('usuarios')
            .select('id, email, nome')
            .in('email', ownerEmails);

        console.log('Usuários Encontrados:', users);

        if (users && users.length > 0) {
            const ids = users.map(u => u.id);
            const { data: profs } = await supabase
                .from('user_profiles')
                .select('*')
                .in('id', ids);

            console.log('\nPerfis Detalhados:');
            console.log(JSON.stringify(profs, null, 2));
        }

        // 2. Buscar por Beto pelo nome
        const { data: beto } = await supabase
            .from('user_profiles')
            .select('*')
            .ilike('nome_completo', '%Beto%');
        console.log('\nPerfil Beto:', JSON.stringify(beto, null, 2));

        // 3. Contar quantos no sistema têm "empresa" preenchida
        const { count: withEmpresa } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .not('empresa', 'is', null);

        console.log('\nTotal com campo "empresa" preenchido:', withEmpresa);

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkOwnersPattern();
