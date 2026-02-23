
const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, 'data-bridge', 'shared-identity.ts');
const TARGETS = [
    path.join(__dirname, 'apps', 'rs-consultor', 'consultant', 'shared-identity.ts'),
    // Add other apps here as needed, e.g., RotaFacil path
];

console.log('💎 Iniciando sincronização da Ponte de Identidade...');

if (!fs.existsSync(SOURCE_FILE)) {
    console.error('❌ Erro: Arquivo fonte da ponte não encontrado:', SOURCE_FILE);
    process.exit(1);
}

const content = fs.readFileSync(SOURCE_FILE, 'utf8');

TARGETS.forEach(target => {
    try {
        fs.writeFileSync(target, content);
        console.log(`✅ Sincronizado: ${target}`);
    } catch (err) {
        console.error(`❌ Falha ao escrever em ${target}:`, err);
    }
});

console.log('🚀 Ponte de Identidade sincronizada com sucesso!');
