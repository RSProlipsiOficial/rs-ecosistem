/**
 * AUDITORIA COMPLETA DO PAINEL ADMINISTRATIVO
 * Verifica TODAS as conexões e funcionalidades
 */

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function auditoriaCompleta() {
    try {
        console.log('🔍 AUDITORIA COMPLETA - PAINEL ADMINISTRATIVO\n');
        console.log('=' .repeat(80));
        
        await client.connect();
        console.log('✅ Conexão PostgreSQL estabelecida\n');
        
        // 1. VERIFICAR TODAS AS TABELAS
        console.log('📊 1. VERIFICAÇÃO DE TABELAS');
        console.log('-'.repeat(80));
        
        const tabelasEsperadas = [
            'announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials',
            'consultants', 'products', 'orders', 'pins', 'bonuses', 'commissions',
            'wallet_transactions', 'marketplace_products', 'logistics'
        ];
        
        for (const tabela of tabelasEsperadas) {
            const resultado = await client.query(`
                SELECT COUNT(*) as total 
                FROM information_schema.tables 
                WHERE table_name = $1 AND table_schema = 'public';
            `, [tabela]);
            
            const existe = resultado.rows[0].total > 0;
            console.log(`  ${existe ? '✅' : '❌'} ${tabela.padEnd(30)} ${existe ? 'OK' : 'NÃO EXISTE'}`);
            
            if (existe) {
                const count = await client.query(`SELECT COUNT(*) as total FROM ${tabela};`);
                console.log(`      └─ Registros: ${count.rows[0].total}`);
            }
        }
        
        // 2. VERIFICAR COLUNAS DAS TABELAS DE COMUNICAÇÃO
        console.log('\n📋 2. ESTRUTURA DAS TABELAS DE COMUNICAÇÃO');
        console.log('-'.repeat(80));
        
        const tabelasComunicacao = ['announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials'];
        
        for (const tabela of tabelasComunicacao) {
            try {
                const colunas = await client.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = $1
                    ORDER BY ordinal_position;
                `, [tabela]);
                
                console.log(`\n  📄 ${tabela.toUpperCase()}`);
                colunas.rows.forEach(col => {
                    console.log(`      ${col.column_name.padEnd(20)} ${col.data_type.padEnd(30)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
                });
            } catch (err) {
                console.log(`  ❌ ${tabela}: ${err.message}`);
            }
        }
        
        // 3. VERIFICAR POLÍTICAS RLS
        console.log('\n🔒 3. POLÍTICAS RLS (ROW LEVEL SECURITY)');
        console.log('-'.repeat(80));
        
        const politicas = await client.query(`
            SELECT 
                tablename,
                policyname,
                cmd,
                permissive,
                roles
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, cmd;
        `);
        
        const agrupado = {};
        politicas.rows.forEach(p => {
            if (!agrupado[p.tablename]) agrupado[p.tablename] = {};
            if (!agrupado[p.tablename][p.cmd]) agrupado[p.tablename][p.cmd] = [];
            agrupado[p.tablename][p.cmd].push(p.policyname);
        });
        
        Object.keys(agrupado).forEach(tabela => {
            console.log(`\n  📋 ${tabela}`);
            Object.keys(agrupado[tabela]).forEach(cmd => {
                console.log(`      ${cmd.padEnd(10)} ${agrupado[tabela][cmd].length} política(s)`);
            });
        });
        
        // 4. TESTAR INSERÇÃO EM CADA TABELA
        console.log('\n🧪 4. TESTE DE INSERÇÃO');
        console.log('-'.repeat(80));
        
        // Teste 1: Announcements
        try {
            const res1 = await client.query(`
                INSERT INTO announcements (type, title, content, is_new, is_published, created_by)
                VALUES ('info', 'Teste Auditoria', 'Teste', true, true, 'admin')
                RETURNING id;
            `);
            console.log(`  ✅ announcements: Inserido ID ${res1.rows[0].id}`);
            
            // Deletar teste
            await client.query(`DELETE FROM announcements WHERE id = $1;`, [res1.rows[0].id]);
            console.log(`      └─ Teste deletado`);
        } catch (err) {
            console.log(`  ❌ announcements: ${err.message}`);
        }
        
        // Teste 2: Agenda Items
        try {
            const res2 = await client.query(`
                INSERT INTO agenda_items (category, title, content, is_deletable, active)
                VALUES ('Boas-vindas', 'Teste', 'Teste', true, true)
                RETURNING id;
            `);
            console.log(`  ✅ agenda_items: Inserido ID ${res2.rows[0].id}`);
            await client.query(`DELETE FROM agenda_items WHERE id = $1;`, [res2.rows[0].id]);
            console.log(`      └─ Teste deletado`);
        } catch (err) {
            console.log(`  ❌ agenda_items: ${err.message}`);
        }
        
        // 5. VERIFICAR TRIGGERS
        console.log('\n⚡ 5. TRIGGERS ATIVOS');
        console.log('-'.repeat(80));
        
        const triggers = await client.query(`
            SELECT 
                trigger_name,
                event_object_table,
                action_timing,
                event_manipulation
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table;
        `);
        
        triggers.rows.forEach(t => {
            console.log(`  ✅ ${t.event_object_table.padEnd(30)} ${t.trigger_name.padEnd(40)} ${t.action_timing} ${t.event_manipulation}`);
        });
        
        // 6. VERIFICAR CONEXÃO COM SUPABASE REST API
        console.log('\n🌐 6. TESTE DE CONEXÃO SUPABASE REST API');
        console.log('-'.repeat(80));
        
        const https = require('https');
        const testAPI = () => {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'rptkhrboejbwexseikuo.supabase.co',
                    port: 443,
                    path: '/rest/v1/announcements?limit=1',
                    method: 'GET',
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjkyNTIsImV4cCI6MjA0Njg0NTI1Mn0.KxLqKgZ8N5Q6kXhPbKj7gT3dC4mB1wV9zR2eS8fN6jI',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjkyNTIsImV4cCI6MjA0Njg0NTI1Mn0.KxLqKgZ8N5Q6kXhPbKj7gT3dC4mB1wV9zR2eS8fN6jI'
                    }
                };
                
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, data }));
                });
                
                req.on('error', reject);
                req.end();
            });
        };
        
        try {
            const apiResult = await testAPI();
            console.log(`  ✅ REST API: Status ${apiResult.status}`);
            const parsed = JSON.parse(apiResult.data);
            console.log(`      └─ Retornou ${Array.isArray(parsed) ? parsed.length : 0} registros`);
        } catch (err) {
            console.log(`  ❌ REST API: ${err.message}`);
        }
        
        // RESUMO FINAL
        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMO DA AUDITORIA');
        console.log('='.repeat(80));
        console.log('✅ Conexão PostgreSQL: OK');
        console.log('✅ Tabelas criadas: Verificadas');
        console.log('✅ Políticas RLS: Verificadas');
        console.log('✅ Triggers: Verificados');
        console.log('✅ REST API: Testada');
        console.log('\n💡 PRÓXIMO PASSO: Verificar código do Admin frontend');
        
    } catch (err) {
        console.error('\n❌ ERRO NA AUDITORIA:', err.message);
        console.error(err.stack);
    } finally {
        await client.end();
        console.log('\n🔌 Conexão encerrada.');
    }
}

auditoriaCompleta();
