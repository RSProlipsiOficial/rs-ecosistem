
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Encontrar o Master novamente
    const { data: root } = await supabase
        .from('consultores')
        .select('id, nome')
        .or('nome.ilike.%PRÓLIPSI%,patrocinador_id.is.null')
        .limit(1)
        .single();

    if (!root) {
        console.log('Master não encontrado');
        return;
    }
    console.log('Root:', root.nome, 'ID:', root.id);

    // 2. Buscar Diretos na tabela downlines
    const { data: downlines, error } = await supabase
        .from('downlines')
        .select('downline_id, created_at')
        .eq('upline_id', root.id)
        .eq('nivel', 1);

    if (error) {
        console.error('Erro ao buscar downlines:', error);
        return;
    }
    console.log('Total de diretos encontrados:', downlines.length);

    // 3. Verificar se esses diretos existem na tabela consultores
    if (downlines.length > 0) {
        const ids = downlines.map(d => d.downline_id);
        const { data: consultores } = await supabase
            .from('consultores')
            .select('id, nome, created_at')
            .in('id', ids)
            .order('created_at', { ascending: true });

        console.log('--- DIREITOS CONFIRMADOS ---');
        console.table(consultores);
    }
}
run();
