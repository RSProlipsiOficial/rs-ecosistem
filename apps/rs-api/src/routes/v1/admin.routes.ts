/**
 * 👑 ROTAS ADMIN - V1
 * 
 * Endpoints para administração do sistema
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth, requireRole, ROLES } from '../../middlewares/supabaseAuth';
import dashboardRoutes from './dashboard.routes';

const router = express.Router();

router.use('/dashboard', dashboardRoutes);

// GET /v1/admin/overview
router.get('/overview', supabaseAuth, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    // TODO: Implementar dashboard administrativo
    res.json({
      total_consultants: 0,
      active_consultants: 0,
      total_sales: 0,
      pending_withdrawals: 0
    });
  } catch (error) {
    console.error('Erro no overview admin:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// ==========================================
// 🏆 CAREER PLAN (Plano de Carreira)
// ==========================================

// GET /v1/admin/career/levels
router.get('/career/levels', supabaseAuth, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('career_levels')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
        // Se a tabela não existir, retornar array vazio ou erro amigável
        if (error.code === '42P01') { // undefined_table
            console.warn('Tabela career_levels não existe. Retornando lista vazia.');
            return res.json({ success: true, levels: [] });
        }
        throw error;
    }

    res.json({
      success: true,
      levels: data
    });
  } catch (error: any) {
    console.error('Erro ao buscar níveis de carreira:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/admin/career/levels
router.post('/career/levels', supabaseAuth, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const { name, code, display_order, required_personal_recruits, required_team_volume, required_pv, bonus_percentage, benefits, pin_image, is_active } = req.body;

    const { data, error } = await supabase
      .from('career_levels')
      .insert([{ name, code, display_order, required_personal_recruits, required_team_volume, required_pv, bonus_percentage, benefits, pin_image, is_active }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      level: data
    });
  } catch (error: any) {
    console.error('Erro ao criar nível de carreira:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/admin/career/levels/:id
router.put('/career/levels/:id', supabaseAuth, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('career_levels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      level: data
    });
  } catch (error: any) {
    console.error('Erro ao atualizar nível de carreira:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /v1/admin/career/levels/:id
router.delete('/career/levels/:id', supabaseAuth, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('career_levels')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Nível removido com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao remover nível de carreira:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
