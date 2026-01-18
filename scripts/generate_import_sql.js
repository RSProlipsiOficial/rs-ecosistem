
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join('g:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Map "Nome" and "Login" to "ID" for parent resolution
const lookup = new Map();

// Pass 1: Build Lookup
data.forEach(row => {
    if (row.ID) {
        const idStr = String(row.ID).trim();
        if (row.Nome) lookup.set(row.Nome.trim().toLowerCase(), idStr);
        if (row.Login) lookup.set(row.Login.trim().toLowerCase(), idStr);
    }
});

let sql = `-- Import Consultant Network
-- Generated automatically from Excel

BEGIN;

-- Ensure consultants table exists (basic definition if needed in dev)
-- assuming it exists.

`;

const processedIDs = new Set();

data.forEach(row => {
    if (!row.ID) return;

    const id = String(row.ID).trim();
    if (processedIDs.has(id)) return;
    processedIDs.add(id);

    const nome = (row.Nome || '').replace(/'/g, "''").trim();
    const login = (row.Login || `user${id}`).replace(/'/g, "''").trim();
    const email = (row['E-mail'] || `consultor${id}@rsprolipsi.com.br`).replace(/'/g, "''").trim();
    const fone = (row.Celular || '').replace(/'/g, "''").trim();
    const cpf = (row.CNPJ_CPF || '').replace(/'/g, "''").trim();
    const status = (row.Situacao || 'Ativo').trim();

    // Resolve Indicador
    let indicadorInput = (row.Indicador || '').trim();
    let parentId = null;

    // Special case for ROOT
    if (id === '7838667' || indicadorInput.toLowerCase().includes('raiz')) {
        parentId = null; // No parent for root
        indicadorInput = 'admin'; // Legacy string fallback
    } else {
        // Try to find parent by Name or Login
        const found = lookup.get(indicadorInput.toLowerCase());
        if (found) {
            parentId = found;
        } else {
            // Fallback: If not found, maybe link to Root to avoid orphan?
            // User said: "cadastra um abaixo do outro".
            // Let's console log warnings
            console.warn(`Parent not found for ${nome} (Indicador: ${indicadorInput}). Defaulting to RS Prólipsi.`);
            parentId = '7838667';
        }
    }

    const password = '123'; // Default password for initial access

    // Construct Insert
    // We try to fill as many fields as possible.
    // Assuming columns: id, name, email, username, password, phone, cpf, sponsor_id (if exists?), indicador (string?)
    // Based on previous files, 'indicador' column stores the username/name of sponsor.

    sql += `
INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    ${id}, 
    '${nome}', 
    '${email}', 
    '${login}', 
    '${password}', 
    '${fone}', 
    '${cpf}', 
    '${indicadorInput.replace(/'/g, "''")}', 
    NOW(), 
    ${status.toLowerCase() === 'ativo'}
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;
`;
});

sql += `
COMMIT;
`;

fs.writeFileSync(path.join(__dirname, 'import_network.sql'), sql);
console.log('SQL generated at scripts/import_network.sql');
