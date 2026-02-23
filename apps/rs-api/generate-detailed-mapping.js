
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'd:/Rs  Ecosystem/rs-ecosystem/Documentação RS Prólipsi (Ver Sempre)/Rede da RS Prólipsi Completo.xlsx';
const OUTPUT_PATH = path.join(__dirname, 'src/routes/v1/detailed_id_mapping.json');

function generateMapping() {
    console.log('🚀 Gerando mapeamento avançado da rede...');

    try {
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let mappingByEmail = {};
        let mappingByName = {};
        let registrationOrder = 0;

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const id = row[0]; // ID Numérico
            const nome = row[1];
            const email = row[3];

            if (id && !isNaN(id)) {
                registrationOrder++;
                const emailClean = String(email || '').trim().toLowerCase();
                const nomeClean = String(nome || '').trim();
                const nomeKey = nomeClean.toLowerCase();

                let username = '';
                const nextRow = data[i + 1];
                if (nextRow && !nextRow[0] && nextRow[1]) {
                    username = String(nextRow[1]).trim();
                }

                if (String(id) === '7838667') username = 'rsprolipsi';

                const entry = {
                    code: String(id),
                    username: username || null,
                    order: registrationOrder,
                    name: nomeClean
                };

                if (emailClean && emailClean !== 'undefined' && emailClean !== 'null' && emailClean.includes('@')) {
                    mappingByEmail[emailClean] = entry;
                }

                if (nomeKey) {
                    mappingByName[nomeKey] = entry;
                }
            }
        }

        const finalMapping = {
            byEmail: mappingByEmail,
            byName: mappingByName,
            metadata: {
                totalRows: registrationOrder,
                emailsMapped: Object.keys(mappingByEmail).length,
                namesMapped: Object.keys(mappingByName).length
            }
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalMapping, null, 2));
        console.log(`🏁 Mapeamento concluído!`);
        console.log(`📊 Emails: ${Object.keys(mappingByEmail).length}, Nomes: ${Object.keys(mappingByName).length}`);
        console.log(`📍 Salvo em: ${OUTPUT_PATH}`);
    } catch (err) {
        console.error('❌ Erro:', err);
    }
}

generateMapping();
