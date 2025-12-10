/**
 * DADOS PARA CADASTRO - Rede RS Prólipsi
 * 
 * Lista formatada com TODOS os 379 consultores extraídos da planilha Excel
 * Ordem sequencial respeitando hierarquia de matriz
 * 
 * COMO USAR:
 * 1. Acesse o painel admin: http://localhost:3000/admin
 * 2. Vá em Consultores > Cadastrar Consultor
 * 3. Para cada entrada abaixo, preencher o formulário
 */

const fs = require('fs');
const path = require('path');

// Ler os dados salvos
const dataPath = path.join(__dirname, 'network-data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Processar e formatar dados
const consultants = [];

for (let i = 0; i < rawData.length; i++) {
  const row = rawData[i];
  
  if (!row || row.Nome === 'topo') continue;
  
  if (row.ID && row.Origem) {
    const consultant = {
      ordem: consultants.length + 1,
      id: row.ID,
      nome: row.Nome?.trim(),
      email: row['E-mail']?.trim() || `consultor${row.ID}@rsprolipsi.com.br`,
      indicador_nome: row.Indicador?.trim(),
      origem: row.Origem?.trim(),
      username: null,
      indicador_username: null,
      senha: `RS${Math.random().toString(36).slice(2, 8)}`
    };
    
    if (i + 1 < rawData.length) {
      const nextRow = rawData[i + 1];
      if (nextRow && !nextRow.ID && nextRow.Nome) {
        consultant.username = nextRow.Nome.trim();
        consultant.indicador_username = nextRow.Indicador?.trim();
      }
    }
    
    consultants.push(consultant);
  }
}

// Salvar em formato legível
const output = consultants.map(c => {
  return `
// ====================[ ${c.ordem}/${consultants.length} ]====================
export const consultor_${c.id} = {
  // Dados pessoais
  nome: "${c.nome}",
  email: "${c.email}",
  telefone: "",
  cpf: "",
  
  // Credenciais
  username: "${c.username || `user${c.id}`}",
  codigo_consultor: "${c.id}",
  senha: "${c.senha}",
  
  // Rede
  indicador: "${c.indicador_username || c.indicador_nome || 'admin'}",
  
  // Config
  pin_inicial: "Consultor",
  ativo_sigma: false
};
`;
}).join('\n');

// Salvar arquivo TypeScript
const outputPath = path.join(__dirname, 'consultants-data.ts');
fs.writeFileSync(outputPath, output);

console.log(`✅ Dados formatados salvos em: ${outputPath}`);
console.log(`📊 Total: ${consultants.length} consultores`);

// Salvar JSON simples para import
const jsonPath = path.join(__dirname, 'consultants-list.json');
fs.writeFileSync(jsonPath, JSON.stringify(consultants, null, 2));
console.log(`✅ JSON salvo em: ${jsonPath}`);

// Gerar SQL de insert
const sqlInserts = consultants.map(c => {
    return `INSERT INTO consultants (id, nome, email, username, senha, indicador, pin_inicial, ativo_sigma, created_at) 
VALUES (${c.id}, '${c.nome.replace(/'/g, "''")}', '${c.email}', '${c.username || `user${c.id}`}', '${c.senha}', '${c.indicador_username || c.indicador_nome || 'admin'}', 'Consultor', false, NOW());`;
}).join('\n\n');

const sqlPath = path.join(__dirname, 'consultants-insert.sql');
fs.writeFileSync(sqlPath, sqlInserts);
console.log(`✅ SQL de insert salvo em: ${sqlPath}`);
