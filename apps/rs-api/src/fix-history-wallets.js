/**
 * Sincroniza ordens antigas de Roberto (Sede) com a carteira
 * Corrige o extrato que estava vazio
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const IDS_SEDE = [
  'd107da4e-e266-41b0-947a-0c66b2f2b9ef', // SEDE RS PRÓLIPSI (ID e User ID)
  '89c000c0-7a39-4e1e-8dee-5978d846fa89', // RS Prólipsi (ID)
  '30c74d63-c184-4f7d-898a-8e16b3babd39'  // RS Prólipsi (User ID)
];

async function fixHistory() {
  console.log('🚀 Iniciando correção de histórico...');

  // 1. Garantir que as carteiras existem
  for (const cid of IDS_SEDE) {
    const { data: wallet } = await supabase.from('wallets').select('id').eq('consultor_id', cid).maybeSingle();
    if (!wallet) {
      console.log(`🆕 Criando carteira para: ${cid}`);
      const { data: newWallet, error: err } = await supabase.from('wallets').insert({ 
        consultor_id: cid, 
        user_id: cid, 
        balance: 0,
        status: 'ativa' 
      }).select().single();
      
      if (err) console.error(`❌ Erro ao criar carteira para ${cid}:`, err.message);
    }
  }

  // 2. Buscar ordens de todos os IDs da Sede
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .or(`buyer_id.in.(${IDS_SEDE.join(',')})`)
    .in('payment_status', ['Pago', 'approved', 'paid']);

  if (error) {
    console.error('❌ Erro ao buscar ordens:', error);
    return;
  }

  console.log(`📊 Encontradas ${orders.length} ordens pagas.`);

  for (const order of orders) {
    // Verificar se já existe transação para esta ordem
    const { data: existing } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('reference_id', order.id)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️ Ordem #${order.id.split('-')[0]} já processada.`);
      continue;
    }

    // Buscar a carteira do comprador da ordem
    const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('consultor_id', order.buyer_id).maybeSingle();

    if (!wallet) {
      console.warn(`⚠️ Carteira não encontrada para comprador ${order.buyer_id} da ordem ${order.id}`);
      continue;
    }

    const orderRef = order.id.substring(0, 8);
    console.log(`🆕 Gerando transação para Pedido #${orderRef} (Buyer: ${order.buyer_id})`);

    // Inserir transação de débito (compra)
    const amount = parseFloat(order.total);
    const newBalance = parseFloat(wallet.balance) - amount;

    const { error: txErr } = await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      consultant_id: order.buyer_id,
      type: 'debit',
      amount: amount,
      balance_after: newBalance,
      description: `Compra Marketplace - Pedido #${orderRef}`,
      reference_id: order.id,
      reference_type: 'order',
      status: 'completed',
      created_at: order.created_at
    });

    if (txErr) {
      console.error(`❌ Erro ao inserir transação para ordem ${order.id}:`, txErr.message);
    } else {
      // Atualizar o saldo da carteira para refletir a transação
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
    }
  }

  console.log('🏁 Sincronização finalizada!');
}

fixHistory();

