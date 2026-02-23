const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function auditUsers() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lista de nomes para procurar
    const searchTerms = [
        'Sérgio Filgueiras',
        'Marcos Lima Rovaris',
        'Canal Audicir',
        'Maxwell',
        'Roberto Avelino',
        'Manuel Domingo',
        'João Medeiros',
        'Felipe Pereira',
        'Antônio Geraldo',
        'Luciano Cleilton',
        'Emanuel Mendes Claro',
        'Oseias Silva',
        'Sidinalva Maria Bueno',
        'Marisane Antunes',
        'Rosely Monteiro',
        'Júlio Galvão'
    ];

    console.log('--- INICIANDO AUDITORIA PROFUNDA ---');
    let results = [];

    for (const term of searchTerms) {
        const { data } = await supabase
            .from('consultores')
            .select('*')
            .ilike('nome', `%${term}%`);

        if (data) results.push(...data);
    }

    // Remover duplicatas
    const unique = Array.from(new Map(results.map(u => [u.id, u])).values());

    fs.writeFileSync('audit_results.json', JSON.stringify(unique, null, 2));
    console.log(`Auditoria concluída. ${unique.length} registros salvos em audit_results.json.`);

    // Verificar quem é o Root atual ou se existem outros
    const { data: noSponsor } = await supabase
        .from('consultores')
        .select('id, nome')
        .is('patrocinador_id', null);

    fs.appendFileSync('audit_results.json', '\n\n--- USERS WITHOUT SPONSOR ---\n' + JSON.stringify(noSponsor, null, 2));
}

auditUsers();
