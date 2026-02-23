const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function findUsers() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const targetNames = [
        'Emanuel Mendes Claro', 'Oseias Silva', 'Sidinalva Maria Bueno Camargo',
        'Rosely Monteiro', 'Marisane Antunes de Lima', 'Júlio Galvão',
        'Geraldo Carvalho Costa', 'Kaue Moreira', 'Edinelson Manoel Dos Santos',
        'Laércio Montesso Gonçalves', 'Marcos Abreu', 'Pedro Henrique',
        'Rafael Alves Guido', 'Tiago Santos Miranda', 'Odair Luna',
        'Salvador dos Reus', 'Francisco das Chagas Pereira Araujo'
    ];

    console.log('--- BUSCANDO USUÁRIOS POR NOME ---');

    const { data: consultores, error } = await supabase
        .from('consultores')
        .select('id, user_id, nome, email, patrocinador_id, mmn_id, created_at');

    if (error) {
        console.error('Erro ao buscar consultores:', error);
        return;
    }

    // Filtragem manual para maior flexibilidade
    const filtered = consultores.filter(c => {
        return targetNames.some(name => c.nome.toLowerCase().includes(name.toLowerCase().split(' ')[0])) ||
            c.nome.toLowerCase().includes('sidinalva') ||
            c.nome.toLowerCase().includes('reus') ||
            (c.email && c.email.toLowerCase().includes('sidnalva')) ||
            (c.email && c.email.toLowerCase().includes('reidosul'));
    });

    console.log('\n--- CONSULTORES ENCONTRADOS ---');
    console.table(filtered.map(c => ({ id: c.id, nome: c.nome })));

    const rootIds = ['89c000c0-7a39-4e1e-8dee-5978d846fa89', 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'];
    const roots = consultores.filter(c => rootIds.includes(c.id));

    const result = { consultores: filtered, roots };
    fs.writeFileSync('mapped_users.json', JSON.stringify(result, null, 2));

    console.log('\n--- RESULTADO FINAL SALVO EM mapped_users.json ---');
}

findUsers();
