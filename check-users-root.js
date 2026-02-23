require('dotenv').config({ path: 'apps/rs-api/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: Variáveis de ambiente não encontradas em apps/rs-api/.env');
    console.log('Tentando raiz...');
    require('dotenv').config();
}

console.log('URL:', process.env.SUPABASE_URL);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
    console.log('🔍 Verificando usuários suspeitos...');

    const { data: users, error } = await supabase
        .from('consultores')
        .select('id, nome, email, created_at')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log(`Total de usuários: ${users.length}`);

    const suspeitos = users.filter(u => u.nome.includes('Emanuel') || u.nome.includes('Paola') || u.nome.includes('Davi'));

    if (suspeitos.length > 0) {
        console.log('\n⚠️ Usuários suspeitos encontrados:');
        suspeitos.forEach(u => console.log(`- ${u.nome} (${u.email})`));
    } else {
        console.log('✅ Nenhum usuário suspeito com esses nomes encontrado.');
    }

    console.log('\n--- 10 Primeiros Usuários Reais ---');
    users.slice(0, 10).forEach((u, i) => console.log(`${i + 1}. ${u.nome} (${u.email})`));
}

checkUsers();
