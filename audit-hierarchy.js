const fs = require('fs');

const excelData = JSON.parse(fs.readFileSync('excel-full-data.json', 'utf8'));
const dbData = JSON.parse(fs.readFileSync('db-consultants-mapping.json', 'utf8'));

// Normalizar CPF (remover pontos e traços)
function normalizeCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/[.\-\s]/g, '');
}

// Mapa de CPF -> DB_ID
const cpfToDbId = {};
dbData.forEach(c => {
    cpfToDbId[normalizeCPF(c.cpf)] = c.id;
});

// Mapa de Login -> DB_ID (Excel usa Login como referência de Indicador às vezes, ou Nome)
// Na planilha, a coluna Indicador parece conter o Nome ou Login. 
// Vamos mapear Nome do Excel -> DB_ID
const nameToDbId = {};
const cpfToExcelData = {};
excelData.forEach(e => {
    const normalizedCpf = normalizeCPF(e.CNPJ_CPF);
    cpfToExcelData[normalizedCpf] = e;
    if (cpfToDbId[normalizedCpf]) {
        nameToDbId[e.Nome.trim()] = cpfToDbId[normalizedCpf];
        nameToDbId[e.Login.trim()] = cpfToDbId[normalizedCpf];
    }
});

// RS Prólipsi Root
const ROOT_ID = '89c000c0-7a39-4e1e-8dee-5978d846fa89';
nameToDbId['RS Prólipsi Empresa'] = ROOT_ID;
nameToDbId['Raiz top da rede'] = null;

const report = [];
let matched = 0;
let missingInDb = 0;

excelData.forEach(e => {
    const normalizedCpf = normalizeCPF(e.CNPJ_CPF);
    const dbId = cpfToDbId[normalizedCpf];

    if (!dbId) {
        missingInDb++;
        report.push({
            nome: e.Nome,
            cpf: e.CNPJ_CPF,
            status: 'Não encontrado no Banco'
        });
        return;
    }

    matched++;
    const indicadorName = e.Indicador ? e.Indicador.trim() : '';
    const expectedSponsorId = nameToDbId[indicadorName] || null;

    report.push({
        id: dbId,
        nome: e.Nome,
        cpf: e.CNPJ_CPF,
        indicador_excel: indicadorName,
        expected_sponsor_id: expectedSponsorId,
        status: 'Mapeado'
    });
});

console.log(`Relatório: ${matched} encontrados, ${missingInDb} ausentes no DB.`);
fs.writeFileSync('audit-hierarchy-report.json', JSON.stringify(report, null, 2));
