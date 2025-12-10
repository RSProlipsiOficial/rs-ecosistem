/**
 * SIGMA CONTROLLER
 * Lógica de negócio para SIGMA (Matriz 1x6)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ================================================
// REDE E MATRIZ
// ================================================

/**
 * Retorna a rede completa do usuário (até 9 níveis)
 */
exports.getNetwork = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Busca rede recursiva até 9 níveis
    const { data, error } = await supabase.rpc('get_user_network', {
      p_user_id: userId,
      p_max_depth: 9
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      network: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Retorna a matriz atual do usuário
 */
exports.getMatrix = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Busca matriz ativa
    const { data: matrix, error } = await supabase
      .from('matrix_nodes')
      .select(`
        *,
        children:matrix_nodes!parent_id(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      matrix
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Retorna a posição do usuário na matriz
 */
exports.getPosition = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('matrix_nodes')
      .select('position, level, parent_id, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      position: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Retorna todos os diretos e indiretos
 */
exports.getDownlines = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('downlines')
      .select(`
        *,
        downline:consultores!downline_id(
          id,
          nome,
          email,
          nivel_carreira,
          status
        )
      `)
      .eq('upline_id', userId)
      .order('level', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      downlines: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// CICLOS
// ================================================

/**
 * Retorna histórico de ciclos completados
 */
exports.getCycles = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('matrix_cycles')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      cycles: data,
      total: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Completa um ciclo e processa bônus
 */
exports.completeCycle = async (req, res) => {
  try {
    const { userId, matrixId } = req.body;
    
    // Chama função do banco que processa tudo
    const { data, error } = await supabase.rpc('complete_cycle', {
      p_user_id: userId,
      p_matrix_id: matrixId
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      cycle: data,
      message: 'Ciclo completado com sucesso!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Status do ciclo atual
 */
exports.getCycleStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase.rpc('get_cycle_status', {
      p_user_id: userId
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      status: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// SPILLOVER E REENTRADA
// ================================================

/**
 * Processa spillover automático
 */
exports.processSpillover = async (req, res) => {
  try {
    const { userId, newMemberId } = req.body;
    
    const { data, error } = await supabase.rpc('process_spillover', {
      p_sponsor_id: userId,
      p_new_member_id: newMemberId
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      spillover: data,
      message: 'Spillover processado!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Cria reentrada automática após ciclo
 */
exports.createReentry = async (req, res) => {
  try {
    const { userId, cycleId } = req.body;
    
    const { data, error } = await supabase.rpc('create_reentry', {
      p_user_id: userId,
      p_cycle_id: cycleId
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      reentry: data,
      message: 'Reentrada criada com sucesso!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Lista todas as reentradas do usuário
 */
exports.listReentries = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('reentries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      reentries: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// BÔNUS
// ================================================

/**
 * Calcula bônus de profundidade
 */
exports.calculateBonus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase.rpc('calculate_depth_bonus', {
      p_user_id: userId
    });
    
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
 * Retorna bônus de profundidade por nível
 */
exports.getDepthBonus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('depth_bonus')
      .select('*')
      .eq('user_id', userId)
      .order('level', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      depth_bonus: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Distribui bônus após ciclo completado
 */
exports.distributeBonus = async (req, res) => {
  try {
    const { cycleId, userId } = req.body;
    
    const { data, error } = await supabase.rpc('distribute_cycle_bonus', {
      p_cycle_id: cycleId,
      p_user_id: userId
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      distribution: data,
      message: 'Bônus distribuído com sucesso!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// ESTATÍSTICAS
// ================================================

/**
 * Estatísticas gerais da rede
 */
exports.getStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase.rpc('get_network_stats', {
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

/**
 * Volume total da rede
 */
exports.getVolume = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase.rpc('calculate_network_volume', {
      p_user_id: userId
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      volume: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
