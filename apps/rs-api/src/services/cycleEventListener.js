/**
 * RS PRÓLIPSI - CYCLE EVENT LISTENER
 * Escuta eventos de ciclo completado e dispara rs-ops para distribuir bônus
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Importar closeCycle do rs-ops
 * Verifica se o módulo existe antes de importar
 */
/**
 * Importar lógica de bônus do rs-core
 */
const { distributeAllBonuses } = require('../../../rs-core/src/math/distributeBonus');
const { getSigmaConfigCore } = require('../../../rs-core/src/services/sigmaConfigCore');

/**
 * Inicia listener de eventos de ciclo via Supabase Realtime
 */
function startCycleEventListener() {
  console.log('🎧 Iniciando listener de eventos de ciclo...');
  console.log('📡 Conectando ao Supabase Realtime...');

  const channel = supabase
    .channel('cycle-events-channel')
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'cycle_events',
        filter: 'event_type=eq.cycle_completed'
      },
      async (payload) => {
        console.log('\n🎯 ======= CICLO COMPLETADO DETECTADO! =======');
        console.log('📦 Payload:', JSON.stringify(payload.new, null, 2));

        const { id, cycle_id, consultor_id, event_data } = payload.new;

        try {
          console.log(`💰 Processando bônus para consultor ${consultor_id}...`);
          console.log(`🔄 Ciclo ID: ${cycle_id}`);

          // Distribuir bônus usando rs-core
          console.log('📞 Distribuindo bônus via rs-core...');
          const cfg = await getSigmaConfigCore();
          await distributeAllBonuses({
            consultor_id: consultor_id,
            cycle_id: cycle_id,
            cycle_value: cfg.cycle.value
          });

          // Marcar evento como processado
          await supabase
            .from('cycle_events')
            .update({
              processed: true,
              processed_at: new Date().toISOString()
            })
            .eq('id', id);

          console.log('✅ Bônus distribuídos e evento marcado como processado!');
          console.log('========================================\n');

        } catch (error) {
          console.error('❌ Erro ao processar ciclo:', error);
          console.error('Stack:', error.stack);

          // Registrar erro no evento
          await supabase
            .from('cycle_events')
            .update({
              processed: false,
              error: error.message
            })
            .eq('id', id);

          console.log('⚠️  Erro registrado no evento');
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error('❌ Erro na subscription:', err);
        return;
      }

      console.log('📡 Status do listener:', status);

      if (status === 'SUBSCRIBED') {
        console.log('✅ Listener ativo e escutando eventos de ciclo!');
        console.log('🎯 Aguardando eventos de cycle_completed...\n');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erro no canal Realtime');
      } else if (status === 'TIMED_OUT') {
        console.warn('⚠️  Timeout na conexão, tentando reconectar...');
      } else if (status === 'CLOSED') {
        console.warn('⚠️  Canal fechado, tentando reconectar...');
        // Tentar reconectar após 5 segundos
        setTimeout(() => {
          console.log('🔄 Reconectando listener...');
          startCycleEventListener();
        }, 5000);
      }
    });

  return channel;
}

/**
 * Fallback: Chama rs-ops via HTTP
 * Usado se rs-ops estiver rodando em servidor separado
 */
/**
 * Fallback: Chama rs-ops via HTTP
 * Usado se rs-ops estiver rodando em servidor separado
 */
async function callRsOpsViaHTTP(consultorId, cycleId) {
  try {
    // Importação dinâmica para evitar erro se rs-ops-config não estiver buildado
    const { ServiceHttpClient } = require('rs-ops-config');

    // Instancia cliente (assume produção se env não definida)
    const client = new ServiceHttpClient(process.env.NODE_ENV || 'production');

    console.log('📞 Chamando rs-ops via ServiceHttpClient...');

    const response = await client.post('rs-ops', '/ops/close-cycle', {
      consultorId,
      cycleId
    });

    console.log('✅ rs-ops respondeu:', response);

  } catch (error) {
    console.error('❌ Erro ao chamar rs-ops via HTTP:', error.message);
    throw error;
  }
}

/**
 * Para o listener (para testes ou desligamento)
 */
function stopCycleEventListener(channel) {
  if (channel) {
    console.log('🛑 Parando listener de eventos...');
    supabase.removeChannel(channel);
    console.log('✅ Listener parado');
  }
}

/**
 * Polling alternativo (backup se Realtime não funcionar)
 * Verifica banco a cada X segundos
 */
async function startPollingListener(intervalSeconds = 10) {
  console.log(`🔄 Iniciando polling a cada ${intervalSeconds} segundos...`);

  const poller = setInterval(async () => {
    try {
      // Buscar eventos não processados
      const { data: events, error } = await supabase
        .from('cycle_events')
        .select('*')
        .eq('event_type', 'cycle_completed')
        .eq('processed', false)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        return;
      }

      if (events && events.length > 0) {
        console.log(`📋 ${events.length} eventos pendentes encontrados`);

        for (const event of events) {
          console.log(`🎯 Processando evento ${event.id}...`);

          try {
            if (closeCycle) {
              await closeCycle(event.consultor_id);
            } else {
              await callRsOpsViaHTTP(event.consultor_id, event.cycle_id);
            }

            await supabase
              .from('cycle_events')
              .update({
                processed: true,
                processed_at: new Date().toISOString()
              })
              .eq('id', event.id);

            console.log(`✅ Evento ${event.id} processado`);

          } catch (error) {
            console.error(`❌ Erro no evento ${event.id}:`, error);

            await supabase
              .from('cycle_events')
              .update({ error: error.message })
              .eq('id', event.id);
          }
        }
      }

    } catch (error) {
      console.error('❌ Erro no polling:', error);
    }
  }, intervalSeconds * 1000);

  console.log('✅ Polling iniciado');

  return poller;
}

module.exports = {
  startCycleEventListener,
  stopCycleEventListener,
  startPollingListener
};
