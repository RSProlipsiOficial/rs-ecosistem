const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function auditUsers() {
    const usersToSearch = ['Maxwell', 'João Miranda', 'Emanuel'];

    console.log('--- AUDITANDO USUÁRIOS ---');

    for (const name of usersToSearch) {
        const { data: consultores } = await supabase
            .from('consultores')
            .select('id, nome, patrocinador_id, user_id')
            .ilike('nome', `%${name}%`);

        if (!consultores || consultores.length === 0) {
            console.log(`Consulta: ${name} não encontrado.`);
            continue;
        }

        for (const c of consultores) {
            console.log(`\nConsultor: ${c.nome} (ID: ${c.id})`);

            // Buscar quem é o Upline na tabela downlines
            const { data: pos } = await supabase
                .from('downlines')
                .select('upline_id, nivel, linha')
                .eq('downline_id', c.id);

            console.log(`  Posições na Matriz:`, pos);

            // Buscar diretos (L1) deste consultor na tabela downlines
            const { data: children } = await supabase
                .from('downlines')
                .select('downline_id, linha, nivel')
                .eq('upline_id', c.id)
                .eq('nivel', 1)
                .order('linha', { ascending: true });

            console.log(`  Filhos Diretos (Total ${children?.length || 0}):`);
            if (children) {
                for (const child of children) {
                    const { data: childData } = await supabase.from('consultores').select('nome').eq('id', child.downline_id).single();
                    console.log(`    - Slot ${child.linha}: ${childData?.nome || '???'} (${child.downline_id})`);
                }
            }
        }
    }
}

auditUsers();
