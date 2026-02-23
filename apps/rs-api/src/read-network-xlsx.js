
const XLSX = require('xlsx');
const path = require('path');

const filePath = "d:/Rs  Ecosystem/rs-ecosystem/Documentação RS Prólipsi (Ver Sempre)/Rede da RS Prólipsi Completo.xlsx";

try {
    console.log(`📖 Lendo arquivo: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Sucesso! Total de registros encontrados: ${data.length}`);
    console.log('📝 Amostra dos primeiros 5 registros:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));

    // Exibir as colunas
    if (data.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(data[0]));
    }

} catch (error) {
    console.error('❌ Erro ao ler planilha:', error.message);
}
