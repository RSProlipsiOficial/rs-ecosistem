/**
 * Serviço de integração com Supabase (rs-core)
 * Gerencia todas as operações de banco de dados
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logEvent } from '../utils/log';

let supabase: SupabaseClient;

/**
 * Inicializa cliente Supabase
 */
export function initSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes('placeholder')) {
    console.warn("⚠️  Supabase não configurado - rodando em modo DEMONSTRAÇÃO");
    console.warn("   Configure .env com credenciais reais do CREDENCIAIS.md");
    // Cria cliente fake para não quebrar
    supabase = createClient(
      'https://demo.supabase.co',
      'demo-key',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    return;
  }

  supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  logEvent("supabase.init", { url });
}

/**
 * Busca consultor por ID
 */
export async function getConsultorById(consultorId: string) {
  const { data, error } = await supabase
    .from('consultores')
    .select('*')
    .eq('id', consultorId)
    .single();

  if (error) {
    logEvent("supabase.error", { operation: "getConsultorById", error: error.message });
    throw new Error(`Erro ao buscar consultor: ${error.message}`);
  }

  return data;
}

/**
 * Busca downlines diretos de um consultor
 */
export async function getDownlines(consultorId: string) {
  const { data, error } = await supabase
    .from('consultores')
    .select('*')
    .eq('patrocinador_id', consultorId)
    .eq('status', 'ativo');

  if (error) {
    logEvent("supabase.error", { operation: "getDownlines", error: error.message });
    throw new Error(`Erro ao buscar downlines: ${error.message}`);
  }

  return data || [];
}

/**
 * Salva histórico de ciclo
 */
export async function saveCycleHistory(cycleData: any) {
  const { data, error } = await supabase
    .from('cycles')
    .insert([{
      consultor_id: cycleData.consultorId,
      cycle_index: cycleData.cycle_index || 1,
      status: 'completed',
      slots_filled: 6
    }])
    .select()
    .single();

  if (error) {
    logEvent("supabase.error", { operation: "saveCycleHistory", error: error.message });
    throw new Error(`Erro ao salvar ciclo: ${error.message}`);
  }

  logEvent("cycle.saved", { cycleId: data.id });
  return data;
}

/**
 * Registra pagamento de bônus
 */
export async function saveBonus(bonusData: any) {
  const { data, error } = await supabase
    .from('bonuses')
    .insert([bonusData])
    .select()
    .single();

  if (error) {
    logEvent("supabase.error", { operation: "saveBonus", error: error.message });
    throw new Error(`Erro ao registrar bônus: ${error.message}`);
  }

  logEvent("bonus.saved", { bonusId: data.id, type: bonusData.tipo });
  return data;
}

/**
 * Atualiza saldo na carteira
 */
export async function updateWallet(consultorId: string, amount: number, type: string) {
  // Busca saldo atual
  const { data: currentWallet, error: fetchError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', consultorId)
    .single();

  if (fetchError) {
    logEvent("supabase.error", { operation: "fetchWallet", error: fetchError.message });
    throw new Error(`Erro ao buscar carteira: ${fetchError.message}`);
  }

  const newBalance = (currentWallet?.balance || 0) + amount;

  // Atualiza com novo saldo
  const { data, error } = await supabase
    .from('wallets')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', consultorId)
    .select()
    .single();

  if (error) {
    logEvent("supabase.error", { operation: "updateWallet", error: error.message });
    throw new Error(`Erro ao atualizar carteira: ${error.message}`);
  }

  logEvent("wallet.updated", { consultorId, amount, type, newBalance: data.balance });
  return data;
}

/**
 * Busca upline até nível N
 */
export async function getUpline(consultorId: string, levels: number = 6) {
  const upline = [];
  let currentId = consultorId;

  for (let i = 0; i < levels; i++) {
    const { data } = await supabase
      .from('consultores')
      .select('id, nome, patrocinador_id')
      .eq('id', currentId)
      .single();

    if (!data || !data.patrocinador_id) break;

    upline.push(data);
    currentId = data.patrocinador_id;
  }

  return upline;
}

/**
 * Busca Top 10 do ranking
 */
export async function getTop10Ranking(period: string = 'monthly') {
  const { data, error } = await supabase
    .from('ranking')
    .select('*')
    .eq('period', period)
    .order('points', { ascending: false })
    .limit(10);

  if (error) {
    logEvent("supabase.error", { operation: "getTop10Ranking", error: error.message });
    return [];
  }

  return data || [];
}

// Inicializa automaticamente
initSupabase();
