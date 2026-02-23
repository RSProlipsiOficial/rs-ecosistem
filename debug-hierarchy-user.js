const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'apps/rs-api/.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConsultants() {
    const names = [
        'Joana', 'Maxwell', 'Patrick', 'Lucio', 'Antonio',
        'Simone', 'Felipe', 'Adriana', 'Roberto Tomé', 'Emanuel Mendes'
    ];

    console.log('--- Verificando Consultores ---');

    for (const name of names) {
        const { data, error } = await supabase
            .from('consultores')
            .select('id, nome, patrocinador_id, status')
            .ilike('nome', `%${name}%`);

        if (error) {
            console.error(`Erro ao buscar ${name}:`, error);
            continue;
        }

        if (data && data.length > 0) {
            data.forEach(c => {
                console.log(`Nome: ${c.nome} | ID: ${c.id} | Patrocinador: ${c.patrocinador_id} | Status: ${c.status}`);
            });
        } else {
            console.log(`Nenhum resultado para: ${name}`);
        }
    }

    // Verificar RS Prólipsi e Rota Fácil
    console.log('\n--- Verificando Raízes ---');
    const roots = ['89c000c0-7a39-4e1e-8dee-5978d846fa89', 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'];
    for (const rid of roots) {
        const { data: root } = await supabase.from('consultores').select('id, nome, patrocinador_id').eq('id', rid).single();
        console.log(`Raiz: ${root?.nome} | ID: ${root?.id} | Patrocinador: ${root?.patrocinador_id}`);
    }
}

checkConsultants();
