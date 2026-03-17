const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncFromOrders() {
    console.log('🔄 Sincronizando Ativações e Ciclos a partir da tabela ORDERS...');

    // 1. Buscar todos os pedidos pagos
    const { data: orders, error: errOrders } = await supabase
        .from('orders')
        .select('buyer_id, total, payment_status, contributes_to_matrix')
        .eq('payment_status', 'Pago');

    if (errOrders) {
        console.error('Erro ao buscar pedidos:', errOrders);
        return;
    }

    console.log(`Encontrados ${orders.length} pedidos pagos.`);

    const userMap = {};

    for (const order of orders) {
        if (!order.buyer_id) continue;
        const amount = Number(order.total || 0);
        userMap[order.buyer_id] = (userMap[order.buyer_id] || 0) + amount;
    }

    for (const [userId, amount] of Object.entries(userMap)) {
        console.log(`-> Usuário ${userId}: R$ ${amount.toFixed(2)}`);

        const totalActivated = Math.floor(amount / 60);

        // --- UPDATE MATRIX ACCUMULATOR ---
        const { data: existingAcc, error: errAcc } = await supabase
            .from('matrix_accumulator')
            .select('id')
            .eq('consultor_id', userId)
            .maybeSingle();

        if (errAcc) console.error(`Erro ao buscar acumulador para ${userId}:`, errAcc);

        if (existingAcc) {
            console.log(`   Atualizando acumulador existente...`);
            const { error: updErr } = await supabase
                .from('matrix_accumulator')
                .update({
                    accumulated_value: amount,
                    total_activated: totalActivated,
                    updated_at: new Date().toISOString()
                })
                .eq('consultor_id', userId);
            if (updErr) console.error(`Erro ao atualizar acumulador:`, updErr);
        } else {
            console.log(`   Criando novo registro de acumulador...`);
            const { error: insErr } = await supabase
                .from('matrix_accumulator')
                .insert({
                    consultor_id: userId,
                    accumulated_value: amount,
                    total_activated: totalActivated,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            if (insErr) console.error(`Erro ao inserir acumulador:`, insErr);
        }
        
        // --- OPEN CYCLE IF ACTIVE ---
        if (amount >= 60) {
            let { data: currentCycle, error: errCyc } = await supabase
                .from('matriz_cycles')
                .select('id, cycle_number, status')
                .eq('consultor_id', userId)
                .eq('status', 'open')
                .maybeSingle();

            if (!currentCycle) {
                console.log(`   Sem ciclo aberto. Verificando histórico...`);
                const { data: lastCycle } = await supabase
                    .from('matriz_cycles')
                    .select('cycle_number')
                    .eq('consultor_id', userId)
                    .order('cycle_number', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                const nextCycleNum = lastCycle ? lastCycle.cycle_number + 1 : 1;
                console.log(`   Abrindo Ciclo ${nextCycleNum}...`);
                
                const { data: newCycle, error: openErr } = await supabase
                    .from('matriz_cycles')
                    .insert({
                        consultor_id: userId,
                        cycle_number: nextCycleNum,
                        status: 'open',
                        opened_at: new Date().toISOString(),
                        slots_filled: 0
                    })
                    .select()
                    .single();

                if (openErr) {
                    console.error(`Erro ao abrir ciclo:`, openErr);
                } else if (newCycle) {
                    await supabase.from('cycle_events').insert({
                        cycle_id: newCycle.id,
                        consultor_id: userId,
                        event_type: 'cycle_opened',
                        event_data: { cycle_number: nextCycleNum }
                    });
                }
            } else {
                console.log(`   Ciclo ${currentCycle.cycle_number} já está aberto.`);
            }
        }
        
        console.log(`   Status: ${totalActivated > 0 ? 'ATIVO' : 'INATIVO'}`);
    }

    console.log('✅ Sincronização e Abertura de Ciclos concluída!');
}

syncFromOrders().catch(console.error);
