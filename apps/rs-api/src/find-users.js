require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUsers() {
    console.log('🔍 Buscando primeiros consultores e específicos...');

    // 1. Primeiros 10 por data
    const { data: first10, error: err1 } = await supabase
        .from('consultores')
        .select('id, nome, email, created_at')
        .order('created_at', { ascending: true })
        .limit(10);

    if (err1) console.error('Erro ao buscar primeiros:', err1);
    else {
        console.log('\n--- Primeiros 10 Consultores ---');
        first10.forEach((c, i) => console.log(`${i + 1}. ${c.nome} (${c.email}) - ${c.created_at}`));
    }

    // 2. Buscar por nome (Emanuel, Max)
    const { data: specific, error: err2 } = await supabase
        .from('consultores')
        .select('id, nome, email, created_at')
        .or('nome.ilike.%Emanuel%,nome.ilike.%Max%')
        .limit(10);

    if (err2) console.error('Erro ao buscar específicos:', err2);
    else {
        console.log('\n--- Consultores Específicos (Emanuel/Max) ---');
        specific.forEach((c, i) => console.log(`${i + 1}. ${c.nome} (${c.email})`));
    }
}

findUsers();
