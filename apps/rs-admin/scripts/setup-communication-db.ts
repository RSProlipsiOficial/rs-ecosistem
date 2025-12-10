/**
 * Script para configurar as tabelas de comunicação no Supabase
 * Executa o SQL automaticamente
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTI2OTI1MiwiZXhwIjoyMDQ2ODQ1MjUyfQ.8aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aA1';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🚀 Iniciando configuração do banco de dados...\n');

    try {
        // Ler o arquivo SQL
        const sqlPath = path.join(__dirname, '..', '..', 'SQL-COMUNICACAO-SUPABASE.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

        console.log('📄 SQL carregado com sucesso!');
        console.log(`📊 Tamanho: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

        // Dividir o SQL em comandos individuais
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`📝 Total de comandos SQL: ${commands.length}\n`);

        let successCount = 0;
        let errorCount = 0;

        // Executar cada comando
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            
            try {
                // Pular comentários e linhas vazias
                if (command.startsWith('--') || command.trim() === '') {
                    continue;
                }

                console.log(`⚙️  Executando comando ${i + 1}/${commands.length}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: command + ';'
                });

                if (error) {
                    // Alguns erros são esperados (ex: tabela já existe)
                    if (error.message.includes('already exists') || 
                        error.message.includes('duplicate')) {
                        console.log(`⚠️  Aviso: ${error.message.substring(0, 60)}...`);
                    } else {
                        console.error(`❌ Erro: ${error.message}`);
                        errorCount++;
                    }
                } else {
                    successCount++;
                    console.log(`✅ Comando executado com sucesso!`);
                }
            } catch (err) {
                console.error(`❌ Erro ao executar comando: ${err.message}`);
                errorCount++;
            }

            // Pequeno delay entre comandos
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DA EXECUÇÃO:');
        console.log('='.repeat(60));
        console.log(`✅ Sucesso: ${successCount} comandos`);
        console.log(`❌ Erros: ${errorCount} comandos`);
        console.log('='.repeat(60));

        if (errorCount === 0) {
            console.log('\n🎉 Banco de dados configurado com sucesso!\n');
        } else {
            console.log('\n⚠️  Banco configurado com alguns avisos/erros.\n');
        }

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
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.log(`❌ Tabela ${table}: ERRO`);
                } else {
                    console.log(`✅ Tabela ${table}: OK (${count || 0} registros)`);
                }
            } catch (err) {
                console.log(`❌ Tabela ${table}: ${err.message}`);
            }
        }

        console.log('\n✨ Configuração concluída!\n');

    } catch (error) {
        console.error('\n❌ ERRO FATAL:', error);
        process.exit(1);
    }
}

// Executar
setupDatabase()
    .then(() => {
        console.log('🏁 Script finalizado!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
