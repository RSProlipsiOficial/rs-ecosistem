/**
 * CAREER CONTROLLER
 * Lógica de negócio para Carreira (13 PINs)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ================================================
// NÍVEL E PROGRESSO
// ================================================

/**
 * Retorna o nível de carreira atual (PIN)
 */
exports.getLevel = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('consultores')
      .select('pin_atual, pin_nivel, total_ciclos, ciclos_acumulados_trimestre')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      level: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Retorna o progresso para o próximo nível
 */
exports.getProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase.rpc('get_career_progress', {
      p_user_id: userId
    });

    if (error) throw error;

    res.json({
      success: true,
      progress: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Retorna os requisitos para um PIN específico
 */
exports.getRequirements = async (req, res) => {
  try {
    const { pin } = req.params;

    const { data, error } = await supabase
      .from('career_levels')
      .select('*')
      .eq('pin', pin)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      requirements: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Retorna informações do próximo nível
 */
exports.getNextLevel = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase.rpc('get_next_level', {
      p_user_id: userId
    });

    if (error) throw error;

    res.json({
      success: true,
      next_level: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// APURAÇÃO E VMEC
// ================================================

/**
 * Executa apuração trimestral de carreira
 */
exports.runAppraisal = async (req, res) => {
  try {
    const { quarter, year } = req.body;

    const { data, error } = await supabase.rpc('run_career_appraisal', {
      p_quarter: quarter,
      p_year: year
    });

    if (error) throw error;

    res.json({
      success: true,
      appraisal: data,
      message: 'Apuração executada com sucesso!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Calcula VMEC (Volume Máximo por Equipe Cíclica)
 */
exports.calculateVMEC = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase.rpc('calculate_vmec_for_user', {
      p_user_id: userId
    });

    if (error) throw error;

    res.json({
      success: true,
      vmec: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * VMEC detalhado por linha
 */
exports.getVMECByLines = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase.rpc('get_vmec_by_lines', {
      p_user_id: userId
    });

    if (error) throw error;

    res.json({
      success: true,
      vmec_lines: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// BÔNUS DE CARREIRA
// ================================================

/**
 * Histórico de bônus de carreira
 */
exports.getCareerBonus = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('career_bonus')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      bonus: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Distribui bônus de carreira trimestral
 */
exports.distributeCareerBonus = async (req, res) => {
  try {
    const { quarter, year } = req.body;

    const { data, error } = await supabase.rpc('distribute_career_bonus', {
      p_quarter: quarter,
      p_year: year
    });

    if (error) throw error;

    res.json({
      success: true,
      distribution: data,
      message: 'Bônus de carreira distribuído!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// RANKING E ESTATÍSTICAS
// ================================================

/**
 * Ranking geral de carreira
 */
exports.getRanking = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consultores')
      .select('id, nome, pin_atual, pin_nivel, total_ciclos')
      .order('pin_nivel', { ascending: false })
      .order('total_ciclos', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      ranking: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Estatísticas de carreira do usuário
 */
exports.getStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase.rpc('get_career_stats', {
      p_user_id: userId
    });

    if (error) throw error;

    res.json({
      success: true,
      stats: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
