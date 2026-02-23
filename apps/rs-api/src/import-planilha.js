/**
 * SCRIPT SIMPLIFICADO DE IMPORTAÇÃO - PLANILHA → SUPABASE
 * Versão JavaScript pura sem dependências complexas
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const PLANILHA = "d:/Rs  Ecosystem/rs-ecosystem/Documentação RS Prólipsi (Ver Sempre)/Rede da RS Prólipsi Completo.xlsx";

async function main() {
    console.log('\n🚀 IMPORTAÇÃO DE REDE - PLANILHA → SUPABASE\n');

    // 1. Ler planilha
    console.log('📖 Lendo planilha...');
    const wb = XLSX.readFile(PLANILHA);
    const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    console.log(`✅ ${data.length} registros\n`);

    // 2. Criar mapa Login → ID
    console.log('💾 Processando consultores...');
    const loginMap = new Map();
    const nomeMap = new Map();

    let novos = 0;
    let existentes = 0;

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const nome = row.Nome;
        const login = row.Login || nome;
        const email = row['E-mail'] || `temp${row.ID}@rs.com`;
        const cpf = (row.CNPJ_CPF || '').replace(/[^0-9]/g, '') || `000${row.ID}`;

        // Verificar se existe
        const { data: existe } = await supabase
            .from('consultores')
            .select('id')
            .or(`email.eq.${email},cpf.eq.${cpf}`)
            .maybeSingle();

        if (existe) {
            loginMap.set(login, existe.id);
            nomeMap.set(nome, existe.id);
            existentes++;
        } else {
            // Criar novo
            const { data: novo } = await supabase
                .from('consultores')
                .upsert({
                    nome: nome,
                    email: email,
                    cpf: cpf,
                    whatsapp: row.Celular || '',
                    cidade: row.Cidade || '',
                    estado: row.Estado || '',
                    status: (row.Situacao || '').toLowerCase().includes('ativo') ? 'ativo' : 'inativo',
                    data_nascimento: '1990-01-01',
                    pin_atual: 'Consultor',
                    pin_nivel: 0
                }, {
                    onConflict: 'email',
                    ignoreDuplicates: false
                })
                .select('id')
                .single();

            if (novo) {
                loginMap.set(login, novo.id);
                nomeMap.set(nome, novo.id);
                novos++;
            }
        }

        if ((novos + existentes) % 50 === 0) {
            console.log(`  ✓ ${novos + existentes}/${data.length}...`);
        }
    }

    console.log(`✅ ${novos} novos, ${existentes} existentes\n`);

    // 3. Atualizar patrocinadores
    console.log('👥 Configurando hierarquia...');
    let hierarquia = 0;

    for (const row of data) {
        const indicador = row.Indicador;
        if (!indicador || indicador.includes('Raiz') || indicador.includes('top da rede')) {
            continue;
        }

        const consultorId = loginMap.get(row.Login || row.Nome);
        let patrocinadorId = loginMap.get(indicador) || nomeMap.get(indicador);

        // Se não encontrou por login/nome exato, buscar no banco
        if (!patrocinadorId) {
            const { data: patroc } = await supabase
                .from('consultores')
                .select('id')
                .ilike('nome', indicador)
                .maybeSingle();

            if (patroc) patrocinadorId = patroc.id;
        }

        if (consultorId && patrocinadorId) {
            await supabase
                .from('consultores')
                .update({ patrocinador_id: patrocinadorId })
                .eq('id', consultorId);
            hierarquia++;
        }
    }

    console.log(`✅ ${hierarquia} hierarquias configuradas\n`);

    console.log('═══════════════════════════════════════════');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA!');
    console.log(`   Total: ${novos + existentes} consultores`);
    console.log(`   Novos: ${novos}`);
    console.log(`   Hierarquia: ${hierarquia}`);
    console.log('═══════════════════════════════════════════\n');

    console.log('ℹ️  Próximo passo: Execute o script de matriz');
    console.log('   node src/rebuild-matrix.js\n');
}

main().catch(err => {
    console.error('\n❌ ERRO:', err.message);
    process.exit(1);
});
