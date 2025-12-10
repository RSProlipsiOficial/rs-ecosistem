/**
 * Script para conectar direto no PostgreSQL do Supabase
 * e executar as correções
 */

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function executarCorrecoes() {
    try {
        console.log('🔧 Conectando ao PostgreSQL do Supabase...');
        await client.connect();
        console.log('✅ Conectado!\n');
        
        // 1. Adicionar coluna created_by
        console.log('📝 Adicionando coluna created_by...');
        await client.query(`
            ALTER TABLE announcements 
            ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
        `);
        console.log('✅ Coluna created_by adicionada!');
        
        // 2. Adicionar coluna updated_at em todas as tabelas
        console.log('\n📝 Adicionando coluna updated_at...');
        const tabelas = ['announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials'];
        
        for (const tabela of tabelas) {
            await client.query(`
                ALTER TABLE ${tabela} 
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            `);
            console.log(`  ✅ ${tabela}: updated_at adicionada`);
        }
        
        // 3. Criar função de trigger
        console.log('\n📝 Criando função de trigger para updated_at...');
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        console.log('✅ Função criada!');
        
        // 4. Criar triggers
        console.log('\n📝 Criando triggers...');
        for (const tabela of tabelas) {
            await client.query(`DROP TRIGGER IF EXISTS update_${tabela}_updated_at ON ${tabela};`);
            await client.query(`
                CREATE TRIGGER update_${tabela}_updated_at 
                BEFORE UPDATE ON ${tabela} 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
            `);
            console.log(`  ✅ ${tabela}: trigger criado`);
        }
        
        // 5. Testar INSERT
        console.log('\n🧪 Testando INSERT...');
        const result = await client.query(`
            INSERT INTO announcements (type, title, content, is_new, is_published, created_by)
            VALUES ('info', 'Teste PostgreSQL Direto', 'Funcionou!', true, true, 'admin')
            RETURNING *;
        `);
        console.log('✅ Comunicado inserido com sucesso!');
        console.log('📊 Dados:', result.rows[0]);
        
        // 6. Verificar todos os registros
        console.log('\n📊 Verificando registros...');
        const registros = await client.query(`
            SELECT id, title, is_published, created_at, created_by
            FROM announcements 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
        console.log(`✅ Total de comunicados: ${registros.rows.length}`);
        registros.rows.forEach((r, i) => {
            console.log(`${i + 1}. ${r.title} (${r.is_published ? 'Publicado' : 'Não publicado'}) - por: ${r.created_by || 'N/A'}`);
        });
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
        console.log('\n🔌 Conexão encerrada.');
    }
}

executarCorrecoes();
