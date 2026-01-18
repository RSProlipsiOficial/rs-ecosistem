
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join('g:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

console.log('Headers:', data[0]);
console.log('First 3 rows:', data.slice(1, 4));
