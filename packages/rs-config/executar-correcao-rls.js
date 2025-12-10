/**
 * CORRIGIR POLÍTICAS RLS - Permitir acesso ANON
 */

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function corrigirRLS() {
    try {
        console.log('🔧 Corrigindo Políticas RLS...\n');
        await client.connect();
        
        const tabelas = ['announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials'];
        
        for (const tabela of tabelas) {
            console.log(`📝 Processando: ${tabela}`);
            
            // Dropar políticas antigas
            await client.query(`DROP POLICY IF EXISTS "Permitir leitura pública" ON ${tabela};`);
            await client.query(`DROP POLICY IF EXISTS "Admin pode criar ${tabela === 'announcements' ? 'comunicados' : tabela}" ON ${tabela};`);
            await client.query(`DROP POLICY IF EXISTS "Admin pode atualizar ${tabela === 'announcements' ? 'comunicados' : tabela}" ON ${tabela};`);
            await client.query(`DROP POLICY IF EXISTS "Admin pode deletar ${tabela === 'announcements' ? 'comunicados' : tabela}" ON ${tabela};`);
            
            // Criar políticas novas
            await client.query(`CREATE POLICY "Permitir leitura para todos" ON ${tabela} FOR SELECT USING (true);`);
            await client.query(`CREATE POLICY "Permitir criar para todos" ON ${tabela} FOR INSERT WITH CHECK (true);`);
            await client.query(`CREATE POLICY "Permitir atualizar para todos" ON ${tabela} FOR UPDATE USING (true) WITH CHECK (true);`);
            await client.query(`CREATE POLICY "Permitir deletar para todos" ON ${tabela} FOR DELETE USING (true);`);
            
            console.log(`  ✅ ${tabela}: 4 políticas criadas\n`);
        }
        
        // Verificar
        console.log('📊 Verificando políticas...\n');
        const result = await client.query(`
            SELECT 
                tablename,
                COUNT(*) as total_politicas
            FROM pg_policies
            WHERE tablename IN ('announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials')
            GROUP BY tablename
            ORDER BY tablename;
        `);
        
        result.rows.forEach(r => {
            console.log(`  ${r.tablename}: ${r.total_politicas} políticas`);
        });
        
        console.log('\n✅ POLÍTICAS RLS CORRIGIDAS!');
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

corrigirRLS();
