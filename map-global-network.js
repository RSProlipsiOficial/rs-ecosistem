const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Quem é o patrocinador do Michael?
    const sponsorId = '69806370-f06e-4c5f-b728-f96410a6f462';
    const { data: sponsor } = await supabase
        .from('consultores')
        .select('id, nome')
        .eq('id', sponsorId)
        .single();

    console.log(`Patrocinador do Michael (${sponsorId}):`, sponsor?.nome || 'NÃO ENCONTRADO');

    // 2. Quantos indicados esse patrocinador tem?
    if (sponsor) {
        const { count } = await supabase
            .from('consultores')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', sponsorId);
        console.log(`Total de indicados diretos deste patrocinador: ${count}`);
    }

    // 3. Vamos ver o conteúdo do endpoint /v1/admin/network/root (lógica simulada)
    // A lógica anterior era: patrocinador_id IS NULL AND (nome ILIKE '%PRÓLIPSI%' OR nome ILIKE '%ROTA%')
    const { data: potentialRoots } = await supabase
        .from('consultores')
        .select('id, nome')
        .is('patrocinador_id', null)
        .or('nome.ilike.%PRÓLIPSI%,nome.ilike.%ROTA%');

    console.log('Potenciais Roots (Mestres):');
    console.table(potentialRoots);
}
run();
