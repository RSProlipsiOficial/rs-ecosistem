
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAndSync() {
    const EMAIL = 'rsprolipsioficial@gmail.com';
    const PASSWORD = 'Yannis784512@';
    const TARGET_ROOT_ID = 'ab3c3567-69f4-4af8-9261-6d452d7a96dc';

    console.log(`🚀 Procurando usuário Root: ${EMAIL}`);

    let authUser = null;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        console.log(`   📄 Lendo página ${page}...`);
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: page, perPage: 1000 });

        if (error || !users || users.length === 0) {
            hasMore = false;
            break;
        }

        const found = users.find(u => u.email === EMAIL);
        if (found) {
            authUser = found;
            hasMore = false;
        } else {
            page++;
        }
    }

    if (!authUser) {
        console.log('✨ Usuario não encontrado em nenhuma página. Tentando criar...');
        const { data, error } = await supabase.auth.admin.createUser({
            email: EMAIL,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { nome: 'RS Prólipsi' }
        });

        if (error) {
            console.error('❌ Erro crítico: Diz que existe mas não acho na lista:', error.message);
            return;
        }
        authUser = data.user;
    } else {
        console.log(`ℹ️ Usuário Auth encontrado: ${authUser.id}`);
        await supabase.auth.admin.updateUserById(authUser.id, { password: PASSWORD });
        console.log('✅ Senha redefinida.');
    }

    if (!authUser) return;

    const { data: existingRoot } = await supabase
        .from('consultores')
        .select('*')
        .or(`id.eq.${TARGET_ROOT_ID},id.eq.${authUser.id}`)
        .single();

    if (!existingRoot) {
        console.error('❌ Registro "RS Prólipsi" não encontrado na tabela consultores.');
        return;
    }

    if (existingRoot.id === authUser.id) {
        console.log('✅ ID já sincronizado. OK.');
    } else {
        console.log('🛠️ Migrando ID (renomeando unicos, SEM login)...');

        // 0. Rename Old Unique Fields
        const tempEmail = `temp_root_${Date.now()}@temp.com`;
        const tempCpf = Math.floor(10000000000 + Math.random() * 90000000000).toString();

        console.log(`Renaming old record to: ${tempEmail}`);

        const { error: renameError } = await supabase.from('consultores').update({
            email: tempEmail,
            cpf: tempCpf
        }).eq('id', existingRoot.id);

        if (renameError) {
            console.error('❌ Erro no rename (Provavel causa da falha anterior):', renameError.message);
            return;
        }

        // 1. Insert New
        const recordToInsert = { ...existingRoot };
        delete recordToInsert.login; // Remove login if present in fetched object

        const { error: insertError } = await supabase
            .from('consultores')
            .insert({
                ...recordToInsert,
                id: authUser.id,
                email: EMAIL,
                cpf: existingRoot.cpf
            });

        if (!insertError) {
            // 2. Update Children
            await supabase.from('consultores').update({ patrocinador_id: authUser.id }).eq('patrocinador_id', existingRoot.id);
            // 3. Delete Old
            await supabase.from('consultores').delete().eq('id', existingRoot.id);
            console.log('✅ Migração concluída.');
        } else {
            console.error('❌ Falha na migração:', insertError.message);
        }
    }

    // Update PINs
    await supabase.from('consultores').update({ pin_atual: 'Consultor' }).eq('pin_atual', 'Bronze');
    console.log('✅ PINs corrigidos.');
    console.log('\n🏁 ACESSO LIBERADO: ' + EMAIL);
}

findAndSync();
