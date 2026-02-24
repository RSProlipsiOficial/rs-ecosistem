// SCRIPT DE CORREÇÃO RLS - EXECUTE NO CONSOLE DO NAVEGADOR
// Abra o console (F12) em qualquer página do localhost:8080 e cole este código

(async function fixVansRLS() {
    console.log('🔧 Iniciando correção de políticas RLS...\n');

    // Importar Supabase client que já está configurado
    const { supabase } = await import('/src/integrations/supabase/client.ts');

    const dropPolicies = [
        "Vans: dynamic_visibility",
        "Guardian can view their students van",
        "Usuários podem atualizar suas próprias vans",
        "Usuários podem deletar suas próprias vans",
        "Usuários podem inserir suas próprias vans",
        "Users can view their own vans",
        "Users can insert their own vans",
        "Users can update their own vans",
        "Users can delete their own vans",
        "Guardians view student vans",
        "vans_select_own",
        "vans_insert_own",
        "vans_update_own",
        "vans_delete_own",
        "vans_select_guardian"
    ];

    console.log('📝 Removendo políticas antigas...');
    for (const policyName of dropPolicies) {
        const query = `DROP POLICY IF EXISTS "${policyName}" ON vans`;
        try {
            await supabase.rpc('exec_sql', { sql: query });
            console.log(`✅ Removida: ${policyName}`);
        } catch (err) {
            console.log(`⚠️ ${policyName} não existia`);
        }
    }

    console.log('\n📝 Criando políticas SIMPLES...');

    const newPolicies = [
        {
            name: 'vans_owner_all',
            sql: `CREATE POLICY "vans_owner_all" ON vans FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())`
        },
        {
            name: 'vans_public_read',
            sql: `CREATE POLICY "vans_public_read" ON vans FOR SELECT TO authenticated USING (true)`
        }
    ];

    for (const policy of newPolicies) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
            if (error) {
                console.error(`❌ Erro ao criar ${policy.name}:`, error.message);
            } else {
                console.log(`✅ Criada: ${policy.name}`);
            }
        } catch (err) {
            console.error(`❌ Exceção:`, err.message);
        }
    }

    console.log('\n🧪 Testando acesso às vans...');
    const { data, error } = await supabase.from('vans').select('id, nome').limit(10);

    if (error) {
        console.error('❌ ERRO:', error.message);
    } else {
        console.log(`✅ SUCESSO! ${data.length} vans encontradas:`);
        data.forEach(v => console.log(`   📦 ${v.nome}`));
        console.log('\n🎉 CORREÇÃO CONCLUÍDA! Recarregue a página.');
    }
})();
