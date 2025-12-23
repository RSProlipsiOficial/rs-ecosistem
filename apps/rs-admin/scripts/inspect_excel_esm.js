
import pkg from 'xlsx';
const { readFile, utils } = pkg;
import fs from 'fs';

const filePath = String.raw`g:\Rs  Ecosystem\rs-ecosystem\Documentação RS Prólipsi (Ver Sempre)\Rede RS Prólipsi.xlsx`;

try {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }
    const workbook = readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Headers:', jsonData[0]);
    console.log('Rows 1-10:', jsonData.slice(1, 11)); // Print rows 1 to 10
} catch (error) {
    console.error('Error reading Excel:', error);
}
