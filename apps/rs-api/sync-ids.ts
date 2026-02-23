
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';
const EXCEL_PATH = 'd:/Rs  Ecosystem/rs-ecosystem/Documentação RS Prólipsi (Ver Sempre)/Rede da RS Prólipsi Completo.xlsx';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ExcelRow {
    ID?: string | number;
    Nome?: string;
    Indicador?: string | number;
    'E-mail'?: string;
}

async function syncIds() {
    console.log('🚀 Iniciando sincronização de IDs...');

    try {
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        console.log(`📊 Processando ${rows.length} linhas do Excel...`);

        let updatedCount = 0;
        let lastId = '';

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as any;

            // Lógica baseada no import_consultants.ts:
            // Se tem ID, é a linha de dados básicos.
            // Se não tem ID mas tem Nome, é a linha do Username/Slug.

            if (row.ID) {
                lastId = String(row.ID);
                const email = row['E-mail'];
                const nome = row.Nome;

                if (email) {
                    // Tentar encontrar por email na tabela consultores
                    const { data: consultor, error } = await supabase
                        .from('consultores')
                        .select('id, email')
                        .ilike('email', email.trim())
                        .maybeSingle();

                    if (consultor) {
                        // Verificar se a próxima linha tem o username
                        const nextRow = rows[i + 1] as any;
                        let username = '';
                        if (nextRow && !nextRow.ID && nextRow.Nome) {
                            username = String(nextRow.Nome).trim();
                        }

                        // Especial para RS Prólipsi Root
                        if (lastId === '7838667') username = 'rsprolipsi';

                        const { error: updateErr } = await supabase
                            .from('consultores')
                            .update({
                                username: username || null,
                                id: consultor.id // Mantém o UUID original
                            })
                            .eq('id', consultor.id);

                        // Como a tabela consultores pode não ter a coluna id_numerico ainda (UUID é PK), 
                        // vamos usar o 'username' por enquanto e, se necessário, adicionar campos via SQL.

                        if (!updateErr) {
                            updatedCount++;
                            if (updatedCount % 50 === 0) console.log(`✅ ${updatedCount} consultores sincronizados...`);
                        }
                    }
                }
            }
        }

        console.log(`✅ Sincronização concluída! ${updatedCount} consultores atualizados.`);
    } catch (err) {
        console.error('❌ Erro fatal:', err);
    }
}

syncIds();
