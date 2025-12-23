import { readFile, utils } from 'xlsx';

const filePath = String.raw`g:\Rs  Ecosystem\rs-ecosystem\Documentação RS Prólipsi (Ver Sempre)\Rede RS Prólipsi.xlsx`;

try {
    const wb = readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    // Get first 5 rows as array of arrays to see structure
    const data = utils.sheet_to_json(sheet, { header: 1 });
    console.log('--- EXCEL PREVIEW ---');
    console.log(JSON.stringify(data.slice(0, 6), null, 2));
    console.log('--- END PREVIEW ---');
} catch (e) {
    console.error('Error reading file:', e);
}
