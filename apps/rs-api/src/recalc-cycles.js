const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function recalcCycles() {
    console.log('🚀 INICIANDO RECALCULO MATEMÁTICO DE CICLOS MMN...');

    // 1. Limpar tabelas de ciclos para recomeçar do zero (fonte da verdade)
    console.log('🧹 Limpando matriz_cycles e cycle_events...');
    await supabase.from('cycle_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matriz_cycles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Buscar todos os pedidos pagos em 'orders'
    const { data: orders, error: errOrders } = await supabase
        .from('orders')
        .select('buyer_id, total, payment_status')
        .eq('payment_status', 'Pago');

    if (errOrders) throw errOrders;
    console.log(`✅ ${orders.length} pedidos pagos encontrados.`);

    const userMap = {};
    for (const order of orders) {
        if (!order.buyer_id) continue;
        userMap[order.buyer_id] = (userMap[order.buyer_id] || 0) + Number(order.total || 0);
    }

    // 3. Atualizar matrix_accumulator
    console.log('🔄 Atualizando matrix_accumulator...');
    const accToUpsert = [];
    for (const [userId, totalSpent] of Object.entries(userMap)) {
        const totalActivated = Math.floor(totalSpent / 60);
        accToUpsert.push({
            consultor_id: userId,
            accumulated_value: totalSpent,
            total_activated: totalActivated
        });
    }

    // Upsert (atualiza se existir, insere se não)
    for (const acc of accToUpsert) {
        const { data: existing } = await supabase.from('matrix_accumulator').select('consultor_id').eq('consultor_id', acc.consultor_id).maybeSingle();
        if (existing) {
            await supabase.from('matrix_accumulator').update(acc).eq('consultor_id', acc.consultor_id);
        } else {
            await supabase.from('matrix_accumulator').insert(acc);
        }
    }

    // 4. Processar Ciclos Baseados Exatamente nos Diretos Ativos
    const { data: allConsultants } = await supabase.from('consultores').select('id');
    const { data: allDownlines } = await supabase.from('downlines').select('upline_id, downline_id, nivel');
    const { data: allAccs } = await supabase.from('matrix_accumulator').select('consultor_id, total_activated');

    const accMap = new Map();
    allAccs.forEach(a => accMap.set(a.consultor_id, a.total_activated || 0));

    console.log(`\n⏳ Calculando ciclos para ${allConsultants.length} consultores...`);

    for (const consultant of allConsultants) {
        const userId = consultant.id;
        
        // Diretos (nivel 1) do consultor
        const directIds = allDownlines
            .filter(d => d.upline_id === userId && d.nivel === 1)
            .map(d => d.downline_id);

        // Quantos diretos são ativos? (compraram pelo menos 60 R$)
        let activeDirectsCount = 0;
        const activeDirectIds = [];
        for (const directId of directIds) {
            if (accMap.get(directId) >= 1) {
                activeDirectsCount++;
                activeDirectIds.push(directId);
            }
        }

        // Regra Matemática Absoluta
        const completedCyclesCount = Math.floor(activeDirectsCount / 6);
        const currentSlotsFilled = activeDirectsCount % 6;
        const currentCycleNumber = completedCyclesCount + 1;

        if (activeDirectsCount > 0 || accMap.get(userId) >= 1) {
             console.log(`\n👤 Consultor: ${userId} | Diretos Ativos: ${activeDirectsCount}`);
             console.log(`   🔸 Ciclos Completos: ${completedCyclesCount} | Ciclo Atual: ${currentCycleNumber} (${currentSlotsFilled}/6)`);
        }

        // Criar ciclos completos no banco
        for (let i = 1; i <= completedCyclesCount; i++) {
            await supabase.from('matriz_cycles').insert({
                consultor_id: userId,
                cycle_number: i,
                status: 'completed',
                slots_filled: 6,
                slots_total: 6,
                opened_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás (placeholder)
                completed_at: new Date().toISOString()
            });
            
            // Evento de ciclo
            await supabase.from('cycle_events').insert({
                consultor_id: userId,
                event_type: 'cycle_completed',
                event_data: { cycle_number: i, payout: 108.00 }
            });
        }

        // Criar o ciclo atual (open)
        // Se o consultor tem acumulado pago >= 60, ele DEVE ter um ciclo aberto
        if (accMap.get(userId) >= 1) {
            await supabase.from('matriz_cycles').insert({
                consultor_id: userId,
                cycle_number: currentCycleNumber,
                status: 'open',
                slots_filled: currentSlotsFilled,
                slots_total: 6,
                opened_at: new Date().toISOString()
            });
        }
    }

    console.log('\n✨ RECALCULO CONCLUÍDO COM SUCESSO APLICANDO REGRA DE MÚLTIPLOS DE 6!');
}

recalcCycles().catch(err => {
    console.error('❌ ERRO FATAL:', err);
    process.exit(1);
});
