/**
 * 👨‍💼 ROTAS DO CONSULTOR - V1
 * 
 * Endpoints específicos para consultores
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth, requireRole, ROLES, AuthenticatedRequest } from '../../middlewares/supabaseAuth';

const router = express.Router();

const defaultProfileEditPermissions = {
  can_edit_name: true,
  can_edit_birthDate: true,
  can_edit_whatsapp: true,
  can_edit_cep: true,
  can_edit_street: true,
  can_edit_number: true,
  can_edit_neighborhood: true,
  can_edit_city: true,
  can_edit_state: true,
  can_edit_bankName: true,
  can_edit_agency: true,
  can_edit_account: true,
  can_edit_accountType: true,
  can_edit_pix: true,
  can_edit_avatar: true,
  can_edit_cover: true,
  can_edit_cpfCnpj: true,
  can_edit_consultantId: false,
  can_edit_registerDate: false,
  can_edit_sponsor: false,
};

const permissionsKey = (id: string) => `consultant_edit_permissions:${id}`;

const resolveCurrentConsultant = async (authUserId: string) => {
  const { data, error } = await supabase
    .from('consultores')
    .select('id, user_id, nome, email, username, patrocinador_id, whatsapp, telefone')
    .or(`user_id.eq."${authUserId}",id.eq."${authUserId}"`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const isUuid = (value?: string | null) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value).trim()));

const resolveSponsorConsultant = async (sponsorRef?: string | null) => {
  const normalizedRef = String(sponsorRef || '').trim();
  if (!normalizedRef) {
    return null;
  }

  const normalizedDigits = normalizedRef.replace(/\D/g, '');

  if (isUuid(normalizedRef)) {
    const { data, error } = await supabase
      .from('consultores')
      .select('id, user_id, nome, email, username, whatsapp, telefone')
      .eq('id', normalizedRef)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  if (normalizedDigits) {
    try {
      const byNumericCode = await supabase
        .from('consultores')
        .select('id, user_id, nome, email, username, whatsapp, telefone')
        .eq('codigo_consultor', normalizedDigits)
        .maybeSingle();

      if (byNumericCode.data) {
        return byNumericCode.data;
      }
    } catch {
      // noop
    }

    try {
      const { data: profileByNumeric } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('id_numerico', normalizedDigits)
        .maybeSingle();

      if (profileByNumeric?.user_id) {
        const { data: consultorByUserId } = await supabase
          .from('consultores')
          .select('id, user_id, nome, email, username, whatsapp, telefone')
          .eq('user_id', profileByNumeric.user_id)
          .maybeSingle();

        if (consultorByUserId) {
          return consultorByUserId;
        }
      }
    } catch {
      // noop
    }
  }

  const { data, error } = await supabase
    .from('consultores')
    .select('id, user_id, nome, email, username, whatsapp, telefone')
    .eq('username', normalizedRef)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const byEmail = await supabase
    .from('consultores')
    .select('id, user_id, nome, email, username, whatsapp, telefone')
    .eq('email', normalizedRef)
    .maybeSingle();

  if (byEmail.data) {
    return byEmail.data;
  }

  const byName = await supabase
    .from('consultores')
    .select('id, user_id, nome, email, username, whatsapp, telefone')
    .ilike('nome', normalizedRef)
    .maybeSingle();

  return byName.data || null;
};

const loadProfileEditPermissions = async (consultantId: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', permissionsKey(consultantId))
    .maybeSingle();

  if (error) {
    const message = String(error.message || '');
    const missingSettingsTable =
      message.includes("Could not find the table 'public.settings'") ||
      message.includes('relation "public.settings" does not exist') ||
      message.includes('schema cache');

    if (missingSettingsTable) {
      console.warn('[consultor.profile.edit-permissions] tabela settings indisponivel; usando permissoes padrao');
      return { ...defaultProfileEditPermissions };
    }

    throw error;
  }

  return {
    ...defaultProfileEditPermissions,
    ...((data as any)?.value || {}),
  };
};

const isEditable = (permissions: Record<string, boolean>, key: keyof typeof defaultProfileEditPermissions) =>
  permissions[key] === true;

router.get('/profile/edit-permissions', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const consultant = await resolveCurrentConsultant(req.user.id);
    if (!consultant?.id) {
      return res.status(404).json({ success: false, error: 'Consultor não encontrado' });
    }

    const permissions = await loadProfileEditPermissions(consultant.id);
    res.json({
      success: true,
      consultantId: consultant.id,
      permissions,
    });
  } catch (error: any) {
    console.error('Erro ao carregar permissões do perfil do consultor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/profile/sponsor', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const consultant = await resolveCurrentConsultant(req.user.id);
    if (!consultant?.id) {
      return res.status(404).json({ success: false, error: 'Consultor não encontrado' });
    }

    const currentProfileResult = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', (consultant as any).user_id || req.user.id)
      .maybeSingle();

    const currentProfile = currentProfileResult.data || null;

    const sponsorRef =
      (consultant as any).patrocinador_id ||
      (currentProfile as any)?.sponsor_id ||
      (currentProfile as any)?.patrocinador_id ||
      null;

    const sponsor = await resolveSponsorConsultant(sponsorRef);
    if (!sponsor?.id) {
      return res.json({ success: true, data: { sponsor: null } });
    }

    let sponsorProfile: any = null;
    if ((sponsor as any).user_id) {
      const sponsorProfileResult = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', (sponsor as any).user_id)
        .maybeSingle();
      sponsorProfile = sponsorProfileResult.data || null;
    }

    res.json({
      success: true,
      data: {
        sponsor: {
          id: String((sponsor as any).id || ''),
          name: String((sponsorProfile as any)?.nome_completo || (sponsor as any).nome || ''),
          email: String((sponsorProfile as any)?.email || (sponsor as any).email || ''),
          whatsapp: String((sponsorProfile as any)?.whatsapp || (sponsorProfile as any)?.telefone || (sponsor as any).whatsapp || (sponsor as any).telefone || ''),
          loginId: String((sponsorProfile as any)?.slug || (sponsor as any).username || ''),
          numericId: String((sponsorProfile as any)?.id_numerico || ''),
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao carregar patrocinador do consultor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/profile', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const consultant = await resolveCurrentConsultant(req.user.id);
    if (!consultant?.id) {
      return res.status(404).json({ success: false, error: 'Consultor não encontrado' });
    }

    const permissions = await loadProfileEditPermissions(consultant.id);
    const payload = req.body || {};
    const blockedFields: string[] = [];
    const consultorUpdate: Record<string, any> = {};
    const profileUpdate: Record<string, any> = {
      user_id: consultant.user_id || req.user.id,
      updated_at: new Date().toISOString(),
    };

    const applyString = (
      permissionKey: keyof typeof defaultProfileEditPermissions,
      value: any,
      target: Record<string, any>,
      column: string,
      blockedField: string
    ) => {
      if (value === undefined) {
        return;
      }

      if (isEditable(permissions, permissionKey)) {
        target[column] = value || null;
      } else {
        blockedFields.push(blockedField);
      }
    };

    applyString('can_edit_name', payload.name, consultorUpdate, 'nome', 'name');
    applyString('can_edit_name', payload.name, profileUpdate, 'nome_completo', 'name');
    applyString('can_edit_cpfCnpj', payload.cpfCnpj, consultorUpdate, 'cpf', 'cpfCnpj');
    applyString('can_edit_cpfCnpj', payload.cpfCnpj, profileUpdate, 'cpf', 'cpfCnpj');
    applyString('can_edit_whatsapp', payload.whatsapp, consultorUpdate, 'telefone', 'whatsapp');
    applyString('can_edit_whatsapp', payload.whatsapp, consultorUpdate, 'whatsapp', 'whatsapp');
    applyString('can_edit_whatsapp', payload.whatsapp, profileUpdate, 'telefone', 'whatsapp');
    applyString('can_edit_birthDate', payload.birthDate, profileUpdate, 'data_nascimento', 'birthDate');

    if (payload.address) {
      applyString('can_edit_cep', payload.address.zipCode, consultorUpdate, 'cep', 'address.zipCode');
      applyString('can_edit_cep', payload.address.zipCode, profileUpdate, 'endereco_cep', 'address.zipCode');
      applyString('can_edit_street', payload.address.street, consultorUpdate, 'endereco', 'address.street');
      applyString('can_edit_street', payload.address.street, profileUpdate, 'endereco_rua', 'address.street');
      applyString('can_edit_number', payload.address.number, consultorUpdate, 'numero', 'address.number');
      applyString('can_edit_number', payload.address.number, profileUpdate, 'endereco_numero', 'address.number');
      applyString('can_edit_neighborhood', payload.address.neighborhood, consultorUpdate, 'bairro', 'address.neighborhood');
      applyString('can_edit_neighborhood', payload.address.neighborhood, profileUpdate, 'endereco_bairro', 'address.neighborhood');
      applyString('can_edit_city', payload.address.city, consultorUpdate, 'cidade', 'address.city');
      applyString('can_edit_city', payload.address.city, profileUpdate, 'endereco_cidade', 'address.city');
      applyString('can_edit_state', payload.address.state, consultorUpdate, 'estado', 'address.state');
      applyString('can_edit_state', payload.address.state, profileUpdate, 'endereco_estado', 'address.state');
    }

    if (payload.bankAccount) {
      applyString('can_edit_bankName', payload.bankAccount.bank, profileUpdate, 'banco_nome', 'bank.bank');
      applyString('can_edit_agency', payload.bankAccount.agency, profileUpdate, 'banco_agencia', 'bank.agency');
      applyString('can_edit_account', payload.bankAccount.accountNumber, profileUpdate, 'banco_conta', 'bank.accountNumber');
      applyString('can_edit_accountType', payload.bankAccount.accountType, profileUpdate, 'banco_tipo', 'bank.accountType');
      applyString('can_edit_pix', payload.bankAccount.pixKey, profileUpdate, 'banco_pix', 'bank.pixKey');
    }

    if (payload.avatarUrl !== undefined) {
      applyString('can_edit_avatar', payload.avatarUrl, profileUpdate, 'avatar_url', 'avatar');
    }

    if (payload.coverUrl !== undefined) {
      applyString('can_edit_cover', payload.coverUrl, profileUpdate, 'cover_url', 'cover');
    }

    if (Object.keys(consultorUpdate).length > 0) {
      const { error: consultorError } = await supabase
        .from('consultores')
        .update(consultorUpdate)
        .eq('id', consultant.id);

      if (consultorError) {
        throw consultorError;
      }
    }

    if (Object.keys(profileUpdate).length > 2) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileUpdate, { onConflict: 'user_id' });

      if (profileError) {
        throw profileError;
      }
    }

    res.json({
      success: true,
      blockedFields: [...new Set(blockedFields)],
      permissions,
    });
  } catch (error: any) {
    console.error('Erro ao salvar perfil do consultor com permissões:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

    // Buscar saldo da carteira (tabela wallets - real)
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('balance, available_balance, blocked_balance')
      .eq('user_id', userId)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('Erro ao buscar carteira:', walletError);
    }

    // Buscar performance e rank (tabela real)
    const { data: performanceData, error: performanceError } = await supabase
      .from('consultant_performance')
      .select('current_rank, points, next_rank')
      .eq('consultant_id', userId)
      .single();

    if (performanceError && performanceError.code !== 'PGRST116') {
      console.error('Erro ao buscar performance:', performanceError);
    }

    const dashboardData = {
      sales: {
        total: totalSales,
        thisMonth: thisMonthSales,
        pending: pendingSales
      },
      network: {
        total: networkData?.total_count || 0,
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
router.get('/dashboard/performance', supabaseAuth, requireRole([ROLES.CONSULTOR, ROLES.MASTER, ROLES.ADMIN]), async (req: any, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch performance stats (points, rank)
    const { data: perf } = await supabase
      .from('consultant_performance')
      .select('*')
      .eq('consultant_id', userId)
      .single();

    // 2. Fetch bonuses totals (cycle, depth, fidelity, top_sigma, career)
    const { data: bonuses } = await supabase
      .from('bonuses')
      .select('amount, bonus_type')
      .eq('user_id', userId);

    const bonusTotals = (bonuses || []).reduce((acc: any, b: any) => {
      acc[b.bonus_type] = (acc[b.bonus_type] || 0) + Number(b.amount);
      acc.total += Number(b.amount);
      return acc;
    }, { total: 0 });

    const performanceData = {
      sales: {
        daily: 0, // Need to implement daily sales tracking if required
        weekly: 0,
        monthly: 0
      },
      commissions: {
        total: bonusTotals.total || 0,
        available: bonusTotals.total || 0, // Simplified
        pending: 0
      },
      goals: {
        current: perf?.points || 0,
        target: 5000.00, // Hardcoded threshold for next rank or goal
        progress: perf?.points ? Math.min(Math.round((perf.points / 5000) * 100), 100) : 0
      },
      details: {
        rank: perf?.current_rank || 'Iniciante',
        nextRank: perf?.next_rank || 'Bronze',
        points: perf?.points || 0
      }
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Erro na performance:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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
