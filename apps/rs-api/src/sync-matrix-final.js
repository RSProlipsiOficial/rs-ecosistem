const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const OFFICIAL_EMAILS = ['rsprolipsioficial@gmail.com', 'robertorjbc@gmail.com'];

async function syncMatrixFinalConsolidated() {
    console.log('🚀 INICIANDO SINCRONIZAÇÃO CONSOLIDADA (OFICIAIS) + 10 CICLOS...');

    // 1. Buscar todos os pedidos pagos
    const { data: orders, error: errOrders } = await supabase
        .from('orders')
        .select('buyer_id, total, payment_status')
        .eq('payment_status', 'Pago');

    if (errOrders) throw errOrders;
    
    const userMap = {};
    for (const order of orders) {
        if (!order.buyer_id) continue;
        userMap[order.buyer_id] = (userMap[order.buyer_id] || 0) + Number(order.total || 0);
    }

    // 2. Atualizar matrix_accumulator
    const accToUpsert = Object.entries(userMap).map(([userId, totalSpent]) => ({
        consultor_id: userId,
        accumulated_value: totalSpent,
        total_activated: Math.floor(totalSpent / 60)
    }));

    for (const acc of accToUpsert) {
        await supabase.from('matrix_accumulator').upsert(acc, { onConflict: 'consultor_id' });
    }

    // 3. Mapear Consultores e Downlines
    const { data: allConsultants } = await supabase.from('consultores').select('id, email');
    const { data: allDownlines } = await supabase.from('downlines').select('upline_id, downline_id, nivel');
    const { data: allAccs } = await supabase.from('matrix_accumulator').select('consultor_id, total_activated');

    const accMap = new Map();
    allAccs.forEach(a => accMap.set(a.consultor_id, a.total_activated || 0));

    // Identificar IDs oficiais
    const officialIds = allConsultants
        .filter(c => OFFICIAL_EMAILS.includes(c.email?.toLowerCase().trim()))
        .map(c => c.id);

    console.log(`IDs Oficiais identificados: ${officialIds.join(', ')}`);

    // 4. Calcular consolidação para oficiais
    let consolidatedActiveDirects = 0;
    if (officialIds.length > 0) {
        const officialDirects = allDownlines
            .filter(d => officialIds.includes(d.upline_id) && d.nivel === 1)
            .map(d => d.downline_id);
        
        // Remover duplicatas se houver
        const uniqueDirects = [...new Set(officialDirects)];
        
        for (const dId of uniqueDirects) {
            if (accMap.get(dId) >= 1) consolidatedActiveDirects++;
        }
    }

    console.log(`Total de Diretos Ativos Consolidados (Sede): ${consolidatedActiveDirects}`);

    // 5. Atualizar Ciclos para todos
    for (const consultant of allConsultants) {
        const userId = consultant.id;
        const isOfficial = officialIds.includes(userId);
        
        let activeDirectsCount = 0;
        if (isOfficial) {
            activeDirectsCount = consolidatedActiveDirects;
        } else {
            const directs = allDownlines
                .filter(d => d.upline_id === userId && d.nivel === 1)
                .map(d => d.downline_id);
            for (const dId of directs) {
                if (accMap.get(dId) >= 1) activeDirectsCount++;
            }
        }

        const completedCyclesCount = Math.floor(activeDirectsCount / 6);
        const currentSlotsFilled = activeDirectsCount % 6;
        const currentCycleNumber = completedCyclesCount + 1;

        // Limite de 10 ciclos conforme o Roberto pediu
        const MAX_CYCLES = 10;

        if (accMap.get(userId) >= 1 || isOfficial) {
            // Criar/Atualizar ciclos concluídos
            for (let i = 1; i <= Math.min(completedCyclesCount, MAX_CYCLES); i++) {
                await supabase.from('matriz_cycles').upsert({
                    consultor_id: userId,
                    cycle_number: i,
                    status: 'completed',
                    slots_filled: 6,
                    slots_total: 6,
                    completed_at: new Date().toISOString()
                }, { onConflict: 'consultor_id,cycle_number' });
            }

            // Ciclo Aberto
            if (currentCycleNumber <= MAX_CYCLES) {
                await supabase.from('matriz_cycles').upsert({
                    consultor_id: userId,
                    cycle_number: currentCycleNumber,
                    status: 'open',
                    slots_filled: currentSlotsFilled,
                    slots_total: 6,
                    opened_at: new Date().toISOString()
                }, { onConflict: 'consultor_id,cycle_number' });

                // Remover ciclos 'open' indevidos acima do atual
                await supabase.from('matriz_cycles')
                    .delete()
                    .eq('consultor_id', userId)
                    .eq('status', 'open')
                    .gt('cycle_number', currentCycleNumber);
            }
        }
    }

    console.log('✨ SINCRONIZAÇÃO CONSOLIDADA E LIMITE DE 10 CICLOS APLICADO!');
}

syncMatrixFinalConsolidated().catch(console.error);
