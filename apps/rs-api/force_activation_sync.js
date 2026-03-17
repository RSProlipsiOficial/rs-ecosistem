const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("=========================================");
    console.log("Forçando ativação de SEDE RS PRÓLIPSI e Emanuel Mendes para 'ativo'...");
    console.log("=========================================");
    
    // Atualizar tabela `consultores`
    const { data: consultores, error: errC } = await supabase
        .from('consultores')
        .update({ status: 'ativo' })
        .or('nome.ilike.%sede rs%,nome.ilike.%emanuel%')
        .select('id, nome, email, status, mmn_id');

    if (errC) {
        console.error("Erro ao atualizar consultores:", errC);
    } else {
        console.log("\n[ Tabela: consultores ] - Atualizados com Sucesso:");
        console.table(consultores);
    }

    // Atualizar tabela `user_profiles` se aplicável
    const { data: profiles, error: errP } = await supabase
        .from('user_profiles')
        .update({ status: 'ativo' })
        .or('nome_completo.ilike.%sede rs%,nome_completo.ilike.%emanuel%')
        .select('id, user_id, nome_completo, status');

    if (errP) {
        // Ignorar coluna inexistente
        console.error("Erro ao atualizar user_profiles:", errP.message);
    } else {
        console.log("\n[ Tabela: user_profiles ] - Atualizados com Sucesso:");
        console.table(profiles);
    }

    console.log("Finalizado!");
}

main();
