/**
 * SINCRONIZAÇÃO DA REDE GLOBAL - MATRIZ 6x6 FORÇADA
 * 
 * Este script reconstrói toda a hierarquia da matriz a partir dos dados do Supabase,
 * processando consultores na ordem de cadastro (created_at) e aplicando spillover
 * automático da esquerda para a direita.
 * 
 * ATENÇÃO: Este script APAGA todos os dados atuais de matriz antes de reconstruir!
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Import matrix service
const { adicionarNaMatriz } = require('./matrixService');

async function syncFullNetwork() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🚀 RS PRÓLIPSI - SINCRONIZAÇÃO DE REDE GLOBAL');
    console.log('═══════════════════════════════════════════════════\n');

    // Confirmação de segurança
    console.log('⚠️  ATENÇÃO: Este script irá LIMPAR e RECONSTRUIR toda a matriz!');
    console.log('    - Todos os ciclos atuais serão removidos');
    console.log('    - Todas as downlines serão recalculadas');
    console.log('    - A rede será reconstruída na ordem de cadastro\n');

    // Etapa 1: Limpeza de dados antigos
    console.log('🧹 ETAPA 1: Limpando dados antigos...');

    // Limpar downlines
    const { error: e1 } = await supabase.from('downlines').delete().neq('upline_id', '00000000-0000-0000-0000-000000000000');
    if (e1) console.error('  ⚠️  Erro ao limpar downlines:', e1.message);
    else console.log('  ✅ Downlines limpas');

    // Limpar ciclos
    const { error: e2 } = await supabase.from('matriz_cycles').delete().neq('status', 'non-existent');
    if (e2) console.error('  ⚠️  Erro ao limpar ciclos:', e2.message);
    else console.log('  ✅ Ciclos limpos');

    // Limpar acumuladores
    const { error: e3 } = await supabase.from('matrix_accumulator').delete().neq('accumulated_value', -999);
    if (e3) console.error('  ⚠️  Erro ao limpar acumuladores:', e3.message);
    else console.log('  ✅ Acumuladores limpos');

    // Limpar eventos
    const { error: e4 } = await supabase.from('cycle_events').delete().neq('event_type', 'none');
    if (e4) console.error('  ⚠️  Erro ao limpar eventos:', e4.message);
    else console.log('  ✅ Eventos limpos\n');

    // Etapa 2: Buscar consultores
    console.log('📋 ETAPA 2: Carregando consultores do banco...');

    const { data: consultores, error: fetchError } = await supabase
        .from('consultores')
        .select('id, nome, username, patrocinador_id, status, created_at')
        .order('created_at', { ascending: true });

    if (fetchError) {
        console.error('❌ Erro ao buscar consultores:', fetchError.message);
        return;
    }

    console.log(`  ✅ ${consultores.length} consultores carregados\n`);

    // Encontrar usuário root (sem patrocinador)
    const roots = consultores.filter(c => !c.patrocinador_id);
    console.log(`👑 Usuários raiz encontrados: ${roots.length}`);
    roots.forEach(r => console.log(`   - ${r.nome || r.username} (ID: ${r.id})`));
    console.log('');

    // Etapa 3: Processar cada consultor
    console.log('🔄 ETAPA 3: Reconstruindo matriz 6x6...\n');

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const consultor of consultores) {
        // Pular root
        if (!consultor.patrocinador_id) {
            console.log(`  ⏭️  Pulando root: ${consultor.nome || consultor.username}`);
            skipped++;
            continue;
        }

        try {
            console.log(`  ${processed + 1}/${consultores.length - roots.length}: ${consultor.nome || consultor.username}...`);

            // Adicionar na matriz usando o serviço existente
            await adicionarNaMatriz(consultor.id);

            processed++;

            // Pequeno delay para evitar sobrecarga
            if (processed % 10 === 0) {
                console.log(`     ✓ ${processed} processados até agora...\n`);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

        } catch (err) {
            console.error(`  ❌ Erro: ${err.message}`);
            errors++;
        }
    }

    // Resultados
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ SINCRONIZAÇÃO CONCLUÍDA!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Total de consultores: ${consultores.length}`);
    console.log(`   - Processados: ${processed}`);
    console.log(`   - Pulados (root): ${skipped}`);
    console.log(`   - Erros: ${errors}`);
    console.log('═══════════════════════════════════════════════════\n');

    if (errors > 0) {
        console.log('⚠️  Alguns erros ocorreram. Verifique os logs acima.\n');
    }
}

// Executar
syncFullNetwork().catch(err => {
    console.error('\n❌ ERRO FATAL:', err);
    console.error(err.stack);
});
