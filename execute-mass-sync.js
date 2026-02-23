const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function executeSync() {
    const report = JSON.parse(fs.readFileSync('audit-hierarchy-report.json', 'utf8'));
    const updates = report.filter(r => r.id && (r.expected_sponsor_id !== undefined));

    console.log(`Iniciando atualização de ${updates.length} registros...`);

    let success = 0;
    let errors = 0;

    // Processar em batches para não sobrecarregar
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);

        await Promise.all(batch.map(async (u) => {
            const { error } = await supabase
                .from('consultores')
                .update({ patrocinador_id: u.expected_sponsor_id })
                .eq('id', u.id);

            if (error) {
                console.error(`Erro ao atualizar ${u.nome}:`, error.message);
                errors++;
            } else {
                success++;
            }
        }));

        if (i % 50 === 0) console.log(`Progresso: ${i}/${updates.length}...`);
    }

    console.log(`Sincronização concluída! Sucessos: ${success}, Erros: ${errors}`);
}

executeSync();
