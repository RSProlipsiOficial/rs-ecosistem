/**
 * DESABILITAR RLS COMPLETAMENTE
 * Em ambiente de desenvolvimento/teste, não precisamos de RLS
 */

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function desabilitarRLS() {
    try {
        console.log('🔓 DESABILITANDO RLS...\n');
        await client.connect();
        
        const tabelas = ['announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials'];
        
        for (const tabela of tabelas) {
            console.log(`📝 Desabilitando RLS: ${tabela}`);
            
            await client.query(`ALTER TABLE ${tabela} DISABLE ROW LEVEL SECURITY;`);
            
            console.log(`  ✅ ${tabela}: RLS desabilitado\n`);
        }
        
        console.log('✅ RLS DESABILITADO EM TODAS AS TABELAS!');
        console.log('\n💡 NOTA: Agora qualquer usuário pode acessar os dados.');
        console.log('   Em produção, você deve habilitar novamente e configurar políticas corretas.');
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

desabilitarRLS();
