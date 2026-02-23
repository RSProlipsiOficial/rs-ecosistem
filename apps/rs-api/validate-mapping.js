
const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'src/routes/v1/id_mapping.json');
if (!fs.existsSync(mappingPath)) {
    console.error('❌ id_mapping.json não encontrado!');
    process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Casos de teste prioritários do usuário
const testCases = [
    { email: 'emanuelmendesclaro@gmail.com', expectedCode: '9772169', expectedUsername: 'emclaro' },
    { email: 'rsprolipsioficial@gmail.com', expectedCode: '7838667', expectedUsername: 'rsprolipsi' }
];

console.log('🧪 Validando Mapeamento de IDs...');

testCases.forEach(tc => {
    const entry = Object.entries(mapping).find(([email]) => email.toLowerCase().includes(tc.email.split('@')[0]));
    if (entry) {
        const [email, data] = entry;
        console.log(`✅ Sucesso para ${tc.email}:`);
        console.log(`   - Code: ${data.code} (Esperado: ${tc.expectedCode})`);
        console.log(`   - Username: ${data.username} (Esperado: ${tc.expectedUsername})`);
    } else {
        console.log(`❌ Falha: Não encontrou entrada para ${tc.email}`);
    }
});

console.log(`📊 Total de consultores multinível mapeados: ${Object.keys(mapping).length}`);
