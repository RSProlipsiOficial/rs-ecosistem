
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';
const EXCEL_PATH = 'd:/Rs  Ecosystem/rs-ecosystem/Documentação RS Prólipsi (Ver Sempre)/Rede da RS Prólipsi Completo.xlsx';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sync() {
    console.log('🚀 Iniciando sincronização profissional de rede...');

    try {
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Header está na primeira linha (índice 0)
        // Linhas de dados começam no índice 1

        let consultants = [];
        let registrationOrder = 0;

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const id = row[0]; // ID Numérico
            const nome = row[1];
            const indicador = row[2];
            const email = row[3];

            if (id) {
                registrationOrder++;
                const emailClean = String(email || '').trim().toLowerCase();

                // Procurar próxima linha para o username
                let username = '';
                const nextRow = data[i + 1];
                if (nextRow && !nextRow[0] && nextRow[1]) {
                    username = String(nextRow[1]).trim();
                }

                // Especial para Root
                if (String(id) === '7838667') username = 'rsprolipsi';

                consultants.push({
                    email: emailClean,
                    mmn_id: String(id),
                    username: username || null,
                    registration_order: registrationOrder
                });
            }
        }

        console.log(`📊 Mapeados ${consultants.length} consultores. Atualizando banco...`);

        let success = 0;
        for (const c of consultants) {
            if (!c.email) continue;

            const { data: consultor } = await supabase
                .from('consultores')
                .select('id')
                .ilike('email', c.email)
                .maybeSingle();

            if (consultor) {
                const { error } = await supabase
                    .from('consultores')
                    .update({
                        username: c.username,
                        mmn_id: c.mmn_id,
                        registration_order: c.registration_order
                    })
                    .eq('id', consultor.id);

                if (!error) {
                    success++;
                    if (success % 50 === 0) console.log(`✅ ${success} atualizados...`);
                } else {
                    console.error(`❌ Erro no email ${c.email}:`, error.message);
                }
            }
        }

        console.log(`🏁 Sincronização concluída! ${success} consultores atualizados e ordenados.`);
    } catch (err) {
        console.error('❌ Erro fatal:', err);
    }
}

sync();
