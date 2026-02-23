const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHierarchy() {
    try {
        const rotaFacilId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
        const primaryRootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

        const { data: cons } = await supabase
            .from('consultores')
            .select('id, nome, patrocinador_id')
            .eq('id', rotaFacilId)
            .single();

        console.log('--- CONTA ROTA FÁCIL EM CONSULTORES ---');
        console.log(cons);
        if (cons && cons.patrocinador_id === primaryRootId) {
            console.log('✅ É direto do Root Principal!');
        } else {
            console.log('❌ NÃO é direto do Root Principal. Patrocinador:', cons ? cons.patrocinador_id : 'não encontrado');
        }

        // Ver se existem outros usuários em Usuarios vinculados ao primaryRootId
        const { count: directUsersRota } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', primaryRootId);

        console.log('\nUsuários da Rota vinculados DIRETO ao Root Principal:', directUsersRota);

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkHierarchy();
