
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function linkAuthUsers() {
    console.log('🔄 Iniciando sincronização de usuários Auth -> Consultores...');

    // 1. Buscar todos os usuários do Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('❌ Erro ao listar usuários Auth:', authError);
        return;
    }

    console.log(`✅ Encontrados ${users.length} usuários no Auth.`);

    for (const user of users) {
        const email = user.email;
        const authId = user.id;

        console.log(`\n🔍 Verificando usuário: ${email} (${authId})`);

        // 2. Buscar consultor com este email
        const { data: consultant, error: consultorError } = await supabase
            .from('consultores')
            .select('*')
            .eq('email', email)
            .single();

        if (consultorError && consultorError.code !== 'PGRST116') {
            console.error(`   ❌ Erro ao buscar consultor: ${consultorError.message}`);
            continue;
        }

        if (!consultant) {
            console.log(`   ⚠️ Consultor não encontrado para este email.`);
            continue;
        }

        if (consultant.id === authId) {
            console.log(`   ✅ ID já está sincronizado.`);
            continue;
        }

        console.log(`   ⚠️ Mismatch de ID encontrado!`);
        console.log(`      Auth ID:       ${authId}`);
        console.log(`      Consultor ID:  ${consultant.id}`);
        console.log(`   🛠️ Corrigindo...`);

        const oldId = consultant.id;

        // 3. Atualizar ID na tabela consultores
        // Postgres não permite update de PK facilmente via API se houver constraints, 
        // mas vamos tentar criar um novo e mover os filhos.

        // a. Inserir novo registro com ID correto
        const { error: insertError } = await supabase
            .from('consultores')
            .insert({
                ...consultant,
                id: authId // Força o ID do Auth
            });

        if (insertError) {
            console.error(`   ❌ Erro ao criar novo registro de consultor: ${insertError.message}`);
            // Se falhar (ex: login duplicado), tenta update direto (se permitido) ou aborta
            continue;
        }

        console.log(`   ✅ Novo consultor criado com ID correto.`);

        // b. Mover filhos (atualizar patrocinador_id)
        const { data: children, error: childrenFetchError } = await supabase
            .from('consultores')
            .select('id')
            .eq('patrocinador_id', oldId);

        if (children && children.length > 0) {
            console.log(`   🔄 Movendo ${children.length} filhos para o novo patrocinador...`);
            const { error: updateChildrenError } = await supabase
                .from('consultores')
                .update({ patrocinador_id: authId })
                .eq('patrocinador_id', oldId);

            if (updateChildrenError) {
                console.error(`   ❌ Erro ao atualizar filhos: ${updateChildrenError.message}`);
            } else {
                console.log(`   ✅ Filhos movidos com sucesso.`);
            }
        }

        // c. Deletar registro antigo
        const { error: deleteError } = await supabase
            .from('consultores')
            .delete()
            .eq('id', oldId);

        if (deleteError) {
            console.error(`   ❌ Erro ao deletar consultor antigo: ${deleteError.message}`);
        } else {
            console.log(`   ✅ Registro antigo deletado.`);
        }
    }

    console.log('\n🏁 Sincronização concluída.');
}

linkAuthUsers();
