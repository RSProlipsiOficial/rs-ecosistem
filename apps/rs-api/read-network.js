const xlsx = require('xlsx');
const path = require('path');

const filePath = 'd:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx';

function readNetwork() {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log('--- DADOS DA PLANILHA DE REDE ---');
        console.log('Total linhas:', data.length);
        console.log('Primeiras 10 linhas:');
        console.log(JSON.stringify(data.slice(0, 10), null, 2));

        // Buscar Aryn ou Rota Fácil na planilha
        const found = data.filter(row =>
            (row.Nome && row.Nome.includes('Aryn')) ||
            (row.Nome && row.Nome.includes('Rota Fácil')) ||
            (row.Email && row.Email.includes('xtntplay'))
        );
        console.log('\nRegistros encontrados relacionados a proprietários Rota:', found);

    } catch (error) {
        console.error('Erro ao ler planilha:', error);
    }
}

readNetwork();
