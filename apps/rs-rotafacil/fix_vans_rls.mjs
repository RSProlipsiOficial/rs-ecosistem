import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixVansRLS() {
    console.log('🔧 Corrigindo políticas RLS da tabela vans...')

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

        // Criar políticas simples SEM recursão
        `CREATE POLICY "Users can view own vans" ON vans FOR SELECT USING (auth.uid() = user_id)`,
        `CREATE POLICY "Users can insert own vans" ON vans FOR INSERT WITH CHECK (auth.uid() = user_id)`,
        `CREATE POLICY "Users can update own vans" ON vans FOR UPDATE USING (auth.uid() = user_id)`,
        `CREATE POLICY "Users can delete own vans" ON vans FOR DELETE USING (auth.uid() = user_id)`,
        `CREATE POLICY "Guardians view student vans" ON vans FOR SELECT USING (EXISTS (SELECT 1 FROM alunos a JOIN responsavel_alunos ra ON ra.aluno_id = a.id WHERE a.van_id = vans.id AND ra.responsavel_id = auth.uid()))`
    ]

    for (const query of queries) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: query })
            if (error) {
                console.error(`❌ Erro ao executar: ${query.substring(0, 50)}...`)
                console.error(error)
            } else {
                console.log(`✅ Executado: ${query.substring(0, 50)}...`)
            }
        } catch (err) {
            console.error(`❌ Erro:`, err)
        }
    }

    console.log('✅ Correção concluída!')
}

fixVansRLS()
