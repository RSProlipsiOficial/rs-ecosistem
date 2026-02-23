
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function audit() {
  console.log('--- AUDITORIA DE REDE SIGME ---');
  
  // 1. Localizar João Miranda e Alciones
  const { data: leaders } = await supabase
    .from('consultores')
    .select('id, nome')
    .or('nome.ilike.%Miranda%,nome.ilike.%Alciones%');
    
  console.log('Líderes encontrados:', leaders);
  
  const jm = leaders.find(l => l.nome.includes('Miranda'));
  const ar = leaders.find(l => l.nome.includes('Alciones'));
  
  if (!jm || !ar) {
    console.error('Líderes não encontrados. Abortando.');
    return;
  }
  
  // 2. Diretos de JM no Unilevel (consultores.patrocinador_id)
  const { data: uniJM } = await supabase
    .from('consultores')
    .select('id, nome, status')
    .eq('patrocinador_id', jm.id);
    
  console.log(`João Miranda (JM) tem ${uniJM.length} diretos no Unilevel.`);
  
  // 3. JM na Matriz 6x6 (downlines.upline_id, nivel 1)
  const { data: matJM } = await supabase
    .from('downlines')
    .select('downline_id, linha, nivel, consultores!downline_id(nome)')
    .eq('upline_id', jm.id)
    .eq('nivel', 1)
    .order('linha');
    
  console.log('Nível 1 de JM na Matriz 6x6:');
  matJM.forEach(m => console.log(` - Slot ${m.linha}: ${m.consultores?.nome || m.downline_id}`));
  
  // 4. AR na Matriz 6x6 (downlines.upline_id, nivel 1)
  const { data: matAR } = await supabase
    .from('downlines')
    .select('downline_id, linha, nivel, consultores!downline_id(nome)')
    .eq('upline_id', ar.id)
    .eq('nivel', 1)
    .order('linha');
    
  console.log(`Alciones (AR) tem ${matAR?.length || 0} pessoas no Nível 1 da Matriz.`);
  (matAR || []).forEach(m => console.log(` - Slot ${m.linha}: ${m.consultores?.nome || m.downline_id}`));
  
  // 5. Verificar se algum direto de JM caiu sob AR
  const jmDirectIds = uniJM.map(u => u.id);
  const { data: spillAR } = await supabase
    .from('downlines')
    .select('downline_id, upline_id, linha, consultores!downline_id(nome)')
    .in('downline_id', jmDirectIds)
    .eq('upline_id', ar.id);
    
  console.log(`Derramamento detectado: ${spillAR?.length || 0} diretos de JM estão sob AR na matriz.`);
  (spillAR || []).forEach(s => console.log(` - ${s.consultores?.nome} está no Slot ${s.linha} de AR`));
}

audit().catch(console.error);
