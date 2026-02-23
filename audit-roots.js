const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rootIds = {
        'RS Prólipsi': '89c000c0-7a39-4e1e-8dee-5978d846fa89',
        'Rota Fácil Oficial': 'd107da4e-e266-41b0-947a-0c66b2f2b9ef',
        'Joziana': '51fb8779-0b66-43ae-81e4-bebad05dd516'
    };

    console.log('--- AUDITORIA DE FILHOS DIRETOS (UNILEVEL) ---');
    for (const [name, id] of Object.entries(rootIds)) {
        const { count, data } = await supabase.from('consultores').select('id, nome', { count: 'exact' }).eq('patrocinador_id', id);
        console.log(`${name} (ID: ${id}) tem ${count} filhos diretos em "consultores".`);
        if (data && data.length > 0) {
            data.slice(0, 5).forEach(d => console.log(`   - ${d.nome}`));
        }
    }

    console.log('\n--- AUDITORIA DE FILHOS DIRETOS (MATRIX/DOWNLINES) ---');
    for (const [name, id] of Object.entries(rootIds)) {
        const { count, data } = await supabase.from('downlines').select('downline_id', { count: 'exact' }).eq('upline_id', id).eq('nivel', 1);
        console.log(`${name} (ID: ${id}) tem ${count} filhos na Matrix (Nível 1).`);
    }

    // Verificar se Joziana é patrocinadora dos outros roots
    console.log('\n--- VERIFICAÇÃO DE HIERARQUIA DE TOPO ---');
    const { data: rootsData } = await supabase.from('consultores').select('id, nome, patrocinador_id').in('id', Object.values(rootIds));
    rootsData.forEach(r => {
        const sponsor = rootsData.find(s => s.id === r.patrocinador_id);
        console.log(`${r.nome} -> Patrocinado por: ${sponsor ? sponsor.nome : (r.patrocinador_id || 'Ninguém')}`);
    });
}

run();
