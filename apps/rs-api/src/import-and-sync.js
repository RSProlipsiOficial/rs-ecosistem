/**
 * IMPORTAÇÃO E SINCRONIZAÇÃO DA REDE - PLANILHA EXCEL → SUPABASE → MATRIZ 6x6
 * 
 * Este script:
 * 1. Lê a planilha Excel com os dados reais
 * 2. Atualiza/insere consultores no Supabase respeitando ordem e hierarquia
 * 3. Reconstrói a matriz 6x6 forçada com spillover automático
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PLANILHA_PATH = "d:/Rs  Ecosystem/rs-ecosystem/Documentação RS Prólipsi (Ver Sempre)/Rede da RS Prólipsi Completo.xlsx";

async function importAndSyncNetwork() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🚀 IMPORTAÇÃO E SINCRONIZAÇÃO COMPLETA DA REDE');
    console.log('═══════════════════════════════════════════════════\n');

    // ========== ETAPA 1: LER PLANILHA ==========
    console.log('📖 ETAPA 1: Lendo planilha Excel...');

    const workbook = XLSX.readFile(PLANILHA_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const planilhaData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`  ✅ ${planilhaData.length} registros carregados da planilha\n`);

    // ========== ETAPA 2: CRIAR MAPA DE IDS ==========
    console.log('🗺️  ETAPA 2: Criando mapa de hierarquia...');

    // Mapa: Login/Nome → Dados
    const consultorMap = new Map();
    const loginToSupabaseId = new Map();

    // Primeiro, criar todos os consultores
    for (const row of planilhaData) {
        const key = row.Login || row.Nome;
        consultorMap.set(key, row);
    }

    console.log(`  ✅ Mapa criado com ${consultorMap.size} consultores\n`);

    // ========== ETAPA 3: BUSCAR/CRIAR CONSULTORES NO BANCO ==========
    console.log('💾 ETAPA 3: Sincronizando consultores com Supabase...');

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const row of planilhaData) {
        try {
            const nome = row.Nome;
            const login = row.Login;
            const email = row['E-mail'] || '';
            const cpf = row.CNPJ_CPF?.replace(/[^0-9]/g, '') || '';
            const whatsapp = row.Celular || '';
            const cidade = row.Cidade || '';
            const estado = row.Estado || '';
            const sexo = row.Sexo || 'M';
            const situacao = row.Situacao || 'Ativo';
            const indicadorNome = row.Indicador;

            // Verificar se já existe
            const { data: existing, error: searchError } = await supabase
                .from('consultores')
                .select('id, nome')
                .or(`nome.eq.${nome},email.eq.${email}`)
                .maybeSingle();

            if (searchError && searchError.code !== 'PGRST116') {
                console.error(`  ❌ Erro ao buscar ${nome}:`, searchError.message);
                errors++;
                continue;
            }

            let supabaseId;

            if (existing) {
                // Atualizar
                supabaseId = existing.id;
                loginToSupabaseId.set(login || nome, supabaseId);
                updated++;
            } else {
                // Criar novo
                const { data: newConsultor, error: insertError } = await supabase
                    .from('consultores')
                    .insert({
                        nome: nome,
                        email: email,
                        cpf: cpf,
                        whatsapp: whatsapp,
                        cidade: cidade,
                        estado: estado,
                        status: situacao.toLowerCase() === 'ativo' ? 'ativo' : 'inativo',
                        data_nascimento: '1990-01-01', // Default
                        pin_atual: 'Consultor',
                        pin_nivel: 0
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.error(`  ❌ Erro ao criar ${nome}:`, insertError.message);
                    errors++;
                    continue;
                }

                supabaseId = newConsultor.id;
                loginToSupabaseId.set(login || nome, supabaseId);
                created++;
            }

            if ((created + updated) % 50 === 0) {
                console.log(`  ✓ Processados: ${created + updated}/${planilhaData.length}...`);
            }

        } catch (err) {
            console.error(`  ❌ Erro inesperado:`, err.message);
            errors++;
        }
    }

    console.log(`\n  📊 Consultores: ${created} criados, ${updated} atualizados, ${errors} erros\n`);

    // ========== ETAPA 4: ATUALIZAR PATROCINADORES ==========
    console.log('👥 ETAPA 4: Configurando hierarquia de patrocínios...');

    let hierarquiaOK = 0;
    let hierarquiaErros = 0;

    for (const row of planilhaData) {
        try {
            const login = row.Login || row.Nome;
            const indicadorNome = row.Indicador;

            // Pular se for root
            if (!indicadorNome || indicadorNome.includes('Raiz') || indicadorNome.includes('top da rede')) {
                continue;
            }

            const consultorId = loginToSupabaseId.get(login);

            // Buscar ID do patrocinador pelo nome
            const { data: patrocinador } = await supabase
                .from('consultores')
                .select('id')
                .eq('nome', indicadorNome)
                .maybeSingle();

            if (!patrocinador) {
                // Tentar buscar por login
                const patrocinadorLogin = loginToSupabaseId.get(indicadorNome);
                if (patrocinadorLogin) {
                    await supabase
                        .from('consultores')
                        .update({ patrocinador_id: patrocinadorLogin })
                        .eq('id', consultorId);
                    hierarquiaOK++;
                } else {
                    console.warn(`  ⚠️  Patrocinador não encontrado: ${indicadorNome}`);
                    hierarquiaErros++;
                }
            } else {
                await supabase
                    .from('consultores')
                    .update({ patrocinador_id: patrocinador.id })
                    .eq('id', consultorId);
                hierarquiaOK++;
            }

        } catch (err) {
            hierarquiaErros++;
        }
    }

    console.log(`  ✅ ${hierarquiaOK} hierarquias configuradas, ${hierarquiaErros} erros\n`);

    // ========== ETAPA 5: LIMPAR MATRIZ ANTIGA ==========
    console.log('🧹 ETAPA 5: Limpando matriz antiga...');

    await supabase.from('downlines').delete().neq('upline_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matriz_cycles').delete().neq('status', 'non-existent');
    await supabase.from('matrix_accumulator').delete().neq('accumulated_value', -999);
    await supabase.from('cycle_events').delete().neq('event_type', 'none');

    console.log('  ✅ Dados antigos limpos\n');

    // ========== ETAPA 6: RECONSTRUIR MATRIZ 6x6 ==========
    console.log('🔄 ETAPA 6: Reconstruindo matriz 6x6 forçada...');
    console.log('  (Esta etapa pode levar vários minutos...)\n');

    // Importar função de matriz
    const { adicionarNaMatriz } = require('./matrixService');

    // Buscar todos consultores na ordem correta
    const { data: consultores } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .order('created_at', { ascending: true });

    let processados = 0;
    let errosMatriz = 0;

    for (const consultor of consultores) {
        // Pular root
        if (!consultor.patrocinador_id) {
            continue;
        }

        try {
            await adicionarNaMatriz(consultor.id);
            processados++;

            if (processados % 20 === 0) {
                console.log(`  ✓ ${processados}/${consultores.length} na matriz...`);
            }

        } catch (err) {
            console.error(`  ❌ Erro ao adicionar ${consultor.nome}:`, err.message);
            errosMatriz++;
        }

        // Pequeno delay
        await new Promise(r => setTimeout(r, 50));
    }

    // ========== RESULTADO FINAL ==========
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ SINCRONIZAÇÃO CONCLUÍDA!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 Resumo:`);
    console.log(`   Consultores criados: ${created}`);
    console.log(`   Consultores atualizados: ${updated}`);
    console.log(`   Hierarquias configuradas: ${hierarquiaOK}`);
    console.log(`   Adicionados na matriz: ${processados}`);
    console.log(`   Erros: ${errors + hierarquiaErros + errosMatriz}`);
    console.log('═══════════════════════════════════════════════════\n');
}

// Executar
importAndSyncNetwork().catch(err => {
    console.error('\n❌ ERRO FATAL:', err);
    console.error(err.stack);
    process.exit(1);
});
