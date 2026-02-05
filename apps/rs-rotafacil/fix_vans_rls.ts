import { supabase } from './src/integrations/supabase/client'

async function fixVansRLS() {
    console.log('🔧 Corrigindo políticas RLS da tabela vans...\n')

    const queries = [
        // Remover políticas antigas
        `DROP POLICY IF EXISTS "Vans: dynamic_visibility" ON vans`,
        `DROP POLICY IF EXISTS "Guardian can view their students van" ON vans`,
        `DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias vans" ON vans`,
        `DROP POLICY IF EXISTS "Usuários podem deletar suas próprias vans" ON vans`,
        `DROP POLICY IF EXISTS "Usuários podem inserir suas próprias vans" ON vans`,
        `DROP POLICY IF EXISTS "Users can view their own vans" ON vans`,
        `DROP POLICY IF EXISTS "Users can insert their own vans" ON vans`,
        `DROP POLICY IF EXISTS "Users can update their own vans" ON vans`,
        `DROP POLICY IF EXISTS "Users can delete their own vans" ON vans`,
        `DROP POLICY IF EXISTS "Guardians view student vans" ON vans`,

        // Criar políticas simples SEM recursão
        `CREATE POLICY "vans_select_own" ON vans FOR SELECT TO authenticated USING (auth.uid() = user_id)`,
        `CREATE POLICY "vans_insert_own" ON vans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`,
        `CREATE POLICY "vans_update_own" ON vans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`,
        `CREATE POLICY "vans_delete_own" ON vans FOR DELETE TO authenticated USING (auth.uid() = user_id)`,
        `CREATE POLICY "vans_select_guardian" ON vans FOR SELECT TO authenticated USING (id IN (SELECT DISTINCT a.van_id FROM alunos a INNER JOIN responsavel_alunos ra ON ra.aluno_id = a.id WHERE ra.responsavel_id = auth.uid() AND a.van_id IS NOT NULL))`
    ]

    for (let i = 0; i < queries.length; i++) {
        const query = queries[i]
        console.log(`Executando ${i + 1}/${queries.length}: ${query.substring(0, 60)}...`)

        try {
            const { error } = await supabase.rpc('exec_sql', { sql: query })
            if (error) {
                console.error(`❌ Erro:`, error.message)
            } else {
                console.log(`✅ Sucesso`)
            }
        } catch (err: any) {
            console.error(`❌ Exceção:`, err.message)
        }
    }

    console.log('\n✅ Correção concluída! Testando...\n')

    // Testar se as vans agora carregam
    const { data: vans, error: vansError } = await supabase
        .from('vans')
        .select('id, nome')
        .limit(5)

    if (vansError) {
        console.error('❌ Ainda há erro:', vansError.message)
    } else {
        console.log(`✅ SUCESSO! Vans carregadas: ${vans?.length || 0}`)
        vans?.forEach(v => console.log(`   - ${v.nome}`))
    }
}

fixVansRLS()
