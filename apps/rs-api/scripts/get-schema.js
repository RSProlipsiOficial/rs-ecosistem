const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const url = `${process.env.SUPABASE_URL}/rest/v1/`;
const apikey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getSchema() {
    console.log(`Conectando em: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: {
                'apikey': apikey,
                'Authorization': `Bearer ${apikey}`
            }
        });

        if (!response.data || !response.data.paths) {
            console.error('Formato de resposta inesperado.');
            return;
        }

        // Filtrar caminhos que são tabelas (ignorar rpc e caminhos raiz)
        const tables = Object.keys(response.data.definitions || {});

        fs.writeFileSync(path.resolve(__dirname, 'tables-list.txt'), tables.join('\n'));
        console.log(`✅ Inventário concluído: ${tables.length} tabelas encontradas.`);
        console.log('Nomes salvos em scripts/tables-list.txt');

        // Também salvar o JSON completo para referência de colunas
        fs.writeFileSync(path.resolve(__dirname, 'db-schema.json'), JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Erro ao buscar schema:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

getSchema();
