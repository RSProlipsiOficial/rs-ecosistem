const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, 'apps/rs-api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function finalAudit() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const rootIds = ['89c000c0-7a39-4e1e-8dee-5978d846fa89', 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'];
    const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';

    console.log('--- AUDITORIA FINAL ---');

    // 1. Diretos da Raiz
    const { data: rootDirects } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .in('patrocinador_id', rootIds);

    // 2. Filhos de Emanuel
    const { data: emanuelChildren } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .eq('patrocinador_id', emanuelId);

    // 3. Busca por Maxwell
    const { data: maxwellSearch } = await supabase
        .from('consultores')
        .select('*')
        .or('nome.ilike.%Maxwell%,email.ilike.%Maxwell%');

    // 4. Busca por Sérgio Filgueiras
    const { data: sergioSearch } = await supabase
        .from('consultores')
        .select('*')
        .or('nome.ilike.%Sérgio%,nome.ilike.%Filgueiras%');

    const report = {
        rootDirects: rootDirects || [],
        emanuelChildren: emanuelChildren || [],
        maxwell: maxwellSearch || [],
        sergio: sergioSearch || []
    };

    fs.writeFileSync('final_audit_report.json', JSON.stringify(report, null, 2));
    console.log('Relatório salvo em final_audit_report.json');
}

finalAudit();
