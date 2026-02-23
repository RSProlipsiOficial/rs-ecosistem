
const XLSX = require('xlsx');
const { Client } = require('pg');
const path = require('path');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';
const excelPath = 'd:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx';

async function run() {
    try {
        console.log('--- Reading Excel ---');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log('Excel Sample (First 2 rows):');
        console.log(JSON.stringify(data.slice(0, 2), null, 2));

        console.log('\n--- Reading DB Schema ---');
        const client = new Client({ connectionString });
        await client.connect();
        const columnsRes = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'consultores' ORDER BY column_name");
        console.log('Consultores Columns:', columnsRes.rows.map(r => r.column_name).join(', '));

        const sampleRes = await client.query("SELECT * FROM consultores LIMIT 3");
        console.log('\nDB Sample Data:');
        console.log(JSON.stringify(sampleRes.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

run();
