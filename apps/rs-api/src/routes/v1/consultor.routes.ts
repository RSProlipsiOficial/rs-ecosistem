/**
 * 👨‍💼 ROTAS DO CONSULTOR - V1
 * 
 * Endpoints específicos para consultores
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth, requireRole, ROLES, AuthenticatedRequest } from '../../middlewares/supabaseAuth';

const router = express.Router();

// GET /v1/consultor/dashboard/overview
router.get('/dashboard/overview', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req: AuthenticatedRequest, res) => {
  // ... existing dashboard logic ...
  // (Copied the logic from the old /dashboard handler)
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    const userId = req.user.id;

    // Buscar dados de vendas
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('amount, status, created_at')
      .eq('consultant_id', userId)
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('Erro ao buscar vendas:', salesError);
    }

    // Buscar dados da rede
    const { data: networkData, error: networkError } = await supabase
      .from('consultant_network')
      .select('count, active_count, new_this_month')
      .eq('consultant_id', userId)
      .single();

    if (networkError) {
      console.error('Erro ao buscar rede:', networkError);
    }

    // Buscar saldo da carteira
    const { data: walletData, error: walletError } = await supabase
      .from('wallet_accounts')
      .select('balance, available_balance, blocked_balance')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Erro ao buscar carteira:', walletError);
    }

    // Buscar performance e rank
    const { data: performanceData, error: performanceError } = await supabase
      .from('consultant_performance')
      .select('current_rank, points, next_rank')
      .eq('consultant_id', userId)
      .single();

    if (performanceError) {
      console.error('Erro ao buscar performance:', performanceError);
    }

    // Calcular totais
    const totalSales = salesData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
    const thisMonthSales = salesData
      ?.filter(sale => {
        const saleDate = new Date(sale.created_at);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;

    const pendingSales = salesData
      ?.filter(sale => sale.status === 'pending')
      .reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;

    const dashboardData = {
      sales: {
        total: totalSales,
        thisMonth: thisMonthSales,
        pending: pendingSales
      },
      network: {
        total: networkData?.count || 0,
        active: networkData?.active_count || 0,
        newThisMonth: networkData?.new_this_month || 0
      },
      wallet: {
        balance: walletData?.balance || 0,
        available: walletData?.available_balance || 0,
        blocked: walletData?.blocked_balance || 0
      },
      performance: {
        rank: performanceData?.current_rank || 'Iniciante',
        points: performanceData?.points || 0,
        nextRank: performanceData?.next_rank || 'Bronze'
      }
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /v1/consultor/dashboard/network
router.get('/dashboard/network', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req: AuthenticatedRequest, res) => {
  // Logic from old /network
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    const userId = req.user.id;

    // Buscar rede do consultor
    const { data: networkData, error: networkError } = await supabase
      .from('consultant_network_levels')
      .select('level, total_members, active_members')
      .eq('consultant_id', userId)
      .order('level', { ascending: true });

    if (networkError) {
      console.error('Erro ao buscar rede:', networkError);
      return res.status(500).json({
        error: 'Erro ao carregar dados da rede',
        code: 'NETWORK_DATA_ERROR'
      });
    }

    // Buscar totais da rede
    const { data: totalsData, error: totalsError } = await supabase
      .from('consultant_network_totals')
      .select('total_members, active_members, total_sales, team_sales')
      .eq('consultant_id', userId)
      .single();

    if (totalsError) {
      console.error('Erro ao buscar totais da rede:', totalsError);
    }

    const networkResponse = {
      totalMembers: totalsData?.total_members || 0,
      activeMembers: totalsData?.active_members || 0,
      levels: networkData?.map(level => ({
        level: level.level,
        count: level.total_members || 0,
        active: level.active_members || 0
      })) || [],
      performance: {
        totalSales: totalsData?.total_sales || 0,
        teamSales: totalsData?.team_sales || 0
      }
    };

    res.json(networkResponse);

  } catch (error) {
    console.error('Erro na rede:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /v1/consultor/dashboard/performance
router.get('/dashboard/performance', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req, res) => {
  // Logic from old /performance
  try {
    // TODO: Buscar performance real do consultor
    // Retornando zeros por enquanto para remover dados fictícios
    const performanceData = {
      sales: {
        daily: 0.00,
        weekly: 0.00,
        monthly: 0.00
      },
      commissions: {
        total: 0.00,
        available: 0.00,
        pending: 0.00
      },
      goals: {
        current: 0.00,
        target: 5000.00,
        progress: 0
      }
    };

    res.json(performanceData);

  } catch (error) {
    console.error('Erro na performance:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /v1/consultor/distribution-centers
router.get('/distribution-centers', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req, res) => {
  try {
    const { data: centers, error } = await supabase
      .from('distribution_centers')
      .select('*')
      .eq('status', 'active')
      .order('is_federal_sede', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform to match frontend expectation if needed, or just return as is
    // Frontend expects: { id, name, city, isFederalSede, whatsapp, ... }
    // Database fields: id, name, city, is_federal_sede, whatsapp, ...

    const formattedCenters = centers.map(cd => ({
      id: cd.id,
      name: cd.name,
      city: cd.city,
      uf: cd.uf,
      address: cd.address,
      whatsapp: cd.whatsapp,
      isFederalSede: cd.is_federal_sede,
      mapLink: cd.map_link
    }));

    res.json(formattedCenters);

  } catch (error: any) {
    console.error('Erro ao buscar CDs:', error);
    res.status(500).json({
      error: 'Erro interno do servidor: ' + error.message
    });
  }
});

// GET /v1/consultor/cd-products
router.get('/cd-products', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('product_catalog')
      .select('*')
      .eq('status', 'active')
      .eq('contributes_to_matrix', true); // Only activation products

    if (error) throw error;

    // Frontend expects: { id, name, description, fullPrice, discount, image, ... }
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      fullPrice: p.price_base,
      discount: p.discount_consultor,
      price: p.price_consultor,
      image: p.image_url || 'https://via.placeholder.com/150',
      points: p.points_per_cycle
    }));

    res.json(formattedProducts);

  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor: ' + error.message
    });
  }
});

export default router;
