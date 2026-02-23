const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = 'd:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx';

async function fullCrossCheck() {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const { data: dbConsultants } = await supabase.from('consultores').select('nome, email, id');
        const dbNames = new Set(dbConsultants.map(c => c.nome.toLowerCase().trim()));

        console.log('--- CRUZAMENTO PLANILHA VS BANCO ---');
        console.log('Total Planilha:', sheetData.length);
        console.log('Total Banco:', dbConsultants.length);

        const matches = [];
        const missing = [];

        sheetData.forEach(row => {
            const name = row.Nome ? row.Nome.toLowerCase().trim() : '';
            if (dbNames.has(name)) {
                matches.push(row.Nome);
            } else {
                missing.push(row.Nome);
            }
        });

        console.log('\nNomes em Comum:', matches.length);
        console.log('Nomes na Planilha que NÃO estão no Banco:', missing.length);

        if (missing.length > 0) {
            console.log('\nExemplos de Nomes Ausentes (Primeiros 10):');
            console.log(missing.slice(0, 10));
        }

    } catch (error) {
        console.error(error);
    }
}

fullCrossCheck();
