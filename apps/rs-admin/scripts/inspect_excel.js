
const XLSX = require('xlsx');
const path = require('path');

const filePath = String.raw`g:\Rs  Ecosystem\rs-ecosystem\Documentação RS Prólipsi (Ver Sempre)\Rede RS Prólipsi.xlsx`;

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Headers:', jsonData[0]);
    console.log('First row:', jsonData[1]);
} catch (error) {
    console.error('Error reading Excel:', error);
}
