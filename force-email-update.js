const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const ROOT_ID = '89c000c0-7a39-4e1e-8dee-5978d846fa89';
    const NEW_EMAIL = 'rsprolipsioficial@gmail.com';

    console.log(`--- ATUALIZANDO ROOT: ${ROOT_ID} ---`);

    // 1. Verificar antes
    const { data: before } = await supabase.from('consultores').select('email').eq('id', ROOT_ID).single();
    console.log(`Email atual: ${before?.email}`);

    if (before?.email === NEW_EMAIL) {
        console.log('✅ Email já está correto.');
    } else {
        // 2. Atualizar
        const { error } = await supabase.from('consultores').update({ email: NEW_EMAIL }).eq('id', ROOT_ID);
        if (error) {
            console.error('❌ Erro ao atualizar:', error.message);
        } else {
            console.log('✅ Atualização concluída.');
        }
    }

    // 3. Verificar depois
    const { data: after } = await supabase.from('consultores').select('id, email, nome').eq('email', NEW_EMAIL);
    console.log(`\nConsultores com email ${NEW_EMAIL} encontrados: ${after?.length || 0}`);
    after.forEach(c => console.log(`- ${c.nome} (ID: ${c.id})`));
}

run();
