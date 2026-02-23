const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Documentação RS Prólipsi (Ver Sempre)', 'Rede da RS Prólipsi Completo.xlsx');

async function readExcel() {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Lidas ${data.length} linhas da planilha.`);

        // Salvar uma amostra para análise
        fs.writeFileSync('excel-data-sample.json', JSON.stringify(data.slice(0, 20), null, 2));

        // Mapear colunas interessantes (adaptar após ver a amostra)
        console.log('Colunas encontradas:', Object.keys(data[0]));

        // Salvar tudo para uso posterior
        fs.writeFileSync('excel-full-data.json', JSON.stringify(data, null, 2));

        console.log('Dados salvos em excel-full-data.json');
    } catch (error) {
        console.error('Erro ao ler Excel:', error);
    }
}

readExcel();
