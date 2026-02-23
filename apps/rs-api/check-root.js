const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoot() {
    try {
        const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // RS Prólipsi

        const { data: rsNode } = await supabase.from('consultores').select('id, nome').eq('id', rootId).single();
        console.log('Root em Consultores:', rsNode);

        const { data: rotaNode } = await supabase.from('usuarios').select('id').eq('id', rootId).single();
        console.log('Root em Usuarios (Rota):', rotaNode ? 'SIM' : 'NÃO');

        // Ver se "Rota Fácil Oficial" (d107da4e-e266-41b0-947a-0c66b2f2b9ef) tem patrocinador na tabela usuarios
        const { data: rotaFacil } = await supabase
            .from('usuarios')
            .select('id, patrocinador_id')
            .eq('id', 'd107da4e-e266-41b0-947a-0c66b2f2b9ef')
            .single();

        console.log('\nDados Rota Fácil Oficial em Usuarios:', rotaFacil);

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkRoot();
