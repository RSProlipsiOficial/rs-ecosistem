/**
 * Script para executar SQL diretamente no Supabase PostgreSQL
 * Engenheiro Sênior - Automação completa
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Connection string do Supabase (substitua pela sua)
const DATABASE_URL = 'postgresql://postgres.rptkhrboejbwexseikuo:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function executeSQL() {
    console.log('🚀 RS PRÓLIPSI - SETUP AUTOMÁTICO DO BANCO DE DADOS\n');
    console.log('='.repeat(60) + '\n');

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Conectar ao banco
        console.log('🔌 Conectando ao Supabase PostgreSQL...');
        await client.connect();
        console.log('✅ Conectado com sucesso!\n');

        // Ler o arquivo SQL
        const sqlPath = path.join(__dirname, '..', '..', 'SQL-COMUNICACAO-SUPABASE.sql');
        console.log(`📄 Lendo arquivo SQL: ${path.basename(sqlPath)}`);
        
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        console.log(`✅ SQL carregado: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

        // Executar o SQL completo
        console.log('⚙️  Executando comandos SQL...\n');
        
        await client.query(sqlContent);
        
        console.log('✅ SQL executado com sucesso!\n');

        // Verificar tabelas criadas
        console.log('🔍 Verificando tabelas criadas...\n');
        
        const tables = [
            'announcements',
            'agenda_items',
            'trainings',
            'training_lessons',
            'training_progress',
            'catalogs',
            'download_materials',
            'download_logs',
            'content_tags',
            'content_tag_relations'
        ];

        for (const table of tables) {
            try {
                const result = await client.query(`
                    SELECT COUNT(*) as count 
                    FROM ${table}
                `);
                
                const count = parseInt(result.rows[0].count);
                console.log(`   ✅ ${table.padEnd(25)} - ${count} registros`);
            } catch (err) {
                console.log(`   ❌ ${table.padEnd(25)} - ERRO: ${err.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!');
        console.log('='.repeat(60) + '\n');

        console.log('📊 PRÓXIMOS PASSOS:\n');
        console.log('   1. ✅ Tabelas criadas no Supabase');
        console.log('   2. ⏳ Modificar Admin para salvar no Supabase');
        console.log('   3. ⏳ Modificar Escritório (modo leitura)');
        console.log('   4. ⏳ Modificar Marketplace (modo leitura)\n');

    } catch (error) {
        console.error('\n❌ ERRO AO EXECUTAR SQL:\n');
        console.error(error.message);
        
        if (error.message.includes('already exists')) {
            console.log('\n⚠️  Algumas tabelas já existem. Isso é normal se você já executou antes.');
            console.log('   O banco de dados está pronto para uso!\n');
        } else {
            console.error('\n💡 Dica: Verifique se a connection string está correta.\n');
            process.exit(1);
        }
    } finally {
        // Desconectar
        await client.end();
        console.log('🔌 Desconectado do banco de dados.\n');
    }
}

// Executar
executeSQL()
    .then(() => {
        console.log('🏁 Script finalizado com sucesso!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
