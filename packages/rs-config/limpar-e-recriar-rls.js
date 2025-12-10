/**
 * LIMPAR TODAS AS POLÍTICAS E RECRIAR DO ZERO
 */

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function limparERecriar() {
    try {
        console.log('🧹 Limpando TODAS as políticas RLS...\n');
        await client.connect();
        
        const tabelas = ['announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials'];
        
        for (const tabela of tabelas) {
            console.log(`📝 Limpando: ${tabela}`);
            
            // Buscar TODAS as políticas
            const result = await client.query(`
                SELECT policyname 
                FROM pg_policies 
                WHERE tablename = $1;
            `, [tabela]);
            
            // Deletar TODAS
            for (const row of result.rows) {
                await client.query(`DROP POLICY IF EXISTS "${row.policyname}" ON ${tabela};`);
                console.log(`     ❌ Deletada: ${row.policyname}`);
            }
            
            console.log(`  ✅ ${tabela}: Limpa\n`);
        }
        
        // Agora recriar políticas SIMPLES
        console.log('🔧 Recriando políticas simples...\n');
        
        for (const tabela of tabelas) {
            console.log(`📝 Criando para: ${tabela}`);
            
            await client.query(`
                CREATE POLICY "Acesso total para todos" 
                ON ${tabela} 
                FOR ALL 
                USING (true) 
                WITH CHECK (true);
            `);
            
            console.log(`  ✅ ${tabela}: Política de acesso total criada\n`);
        }
        
        // Verificar
        console.log('📊 Verificando políticas...\n');
        const verify = await client.query(`
            SELECT 
                tablename,
                policyname,
                cmd
            FROM pg_policies
            WHERE tablename IN ('announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials')
            ORDER BY tablename;
        `);
        
        verify.rows.forEach(r => {
            console.log(`  ${r.tablename}: ${r.policyname} (${r.cmd})`);
        });
        
        console.log('\n✅ POLÍTICAS RECRIADAS COM SUCESSO!');
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
        console.error(err.stack);
    } finally {
        await client.end();
    }
}

limparERecriar();
