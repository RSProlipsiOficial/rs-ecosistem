
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const IDS_SEDE = [
  'd107da4e-e266-41b0-947a-0c66b2f2b9ef', 
  '89c000c0-7a39-4e1e-8dee-5978d846fa89', 
  '30c74d63-c184-4f7d-898a-8e16b3babd39'
];

async function diagnose() {
  console.log('--- DIAGNÓSTICO DE VALORES ---');
  
  // 1. Verificar ordens
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total, created_at, buyer_id')
    .or(`buyer_id.in.(${IDS_SEDE.join(',')})`)
    .limit(5);
    
  console.log('\nExemplos de Ordens (Sede):');
  console.table(orders);

  // 2. Verificar transações de carteira
  const { data: txs } = await supabase
    .from('wallet_transactions')
    .select('id, type, amount, balance_after, description, reference_id')
    .in('consultant_id', IDS_SEDE)
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log('\nÚltimas Transações de Carteira (Sede):');
  console.table(txs);

  // 3. Verificar bônus
  const { data: bonuses } = await supabase
    .from('bonuses')
    .select('id, bonus_type, amount, description')
    .in('consultor_id', IDS_SEDE)
    .limit(5);
    
  console.log('\nExemplos de Bônus (Sede):');
  console.table(bonuses);

  // 4. Verificar tabela cd_transactions (já que ele é Sede/CD)
  const { data: cdTxs } = await supabase
    .from('cd_transactions')
    .select('id, type, amount, description')
    .limit(5);
    
  console.log('\nExemplos de CD Transactions:');
  console.table(cdTxs);
}

diagnose();
