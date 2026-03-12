/**
 * 👑 ROTAS ADMIN - V1
 * 
 * Endpoints para administração do sistema
 */

import { Router } from 'express';
import { supabase, supabaseAdmin } from '../../lib/supabaseClient';
import { requireRole, ROLES, supabaseAuth } from '../../middlewares/supabaseAuth';
import dashboardRoutes from './dashboard.routes';
import { getAdminOverview } from '../../services/adminDashboardService';
import fs from 'fs';
import path from 'path';
import { cycleClosingService } from '../../services/cycleClosingService';
import { collectExistingIdentifiers, isPlaceholderIdentifier, persistConsultantIdentifiers, resolveConsultantIdentifiers } from '../../utils/consultantIdentifiers';

const router = Router();

const SETTINGS_KEYS = {
  payment: 'marketplace_payment_settings',
  shipping: 'marketplace_shipping_settings',
  wallet: 'marketplace_wallet_settings'
} as const;

const readAppConfig = async <T = any>(key: string): Promise<T | null> => {
  const { data, error } = await supabaseAdmin
    .from('app_configs')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return (data?.value ?? null) as T | null;
};

const writeAppConfig = async (key: string, value: any) => {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('app_configs')
    .select('key')
    .eq('key', key)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabaseAdmin
      .from('app_configs')
      .update({
        value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);

    if (error) throw error;
    return;
  }

  const { error } = await supabaseAdmin
    .from('app_configs')
    .insert([{ key, value }]);

  if (error) throw error;
};

const sanitizePaymentSettings = (settings: any) => ({
  mercadoPago: {
    enabled: Boolean(settings?.mercadoPago?.enabled),
    publicKey: String(settings?.mercadoPago?.publicKey ?? ''),
    accessToken: ''
  },
  pagSeguro: {
    enabled: Boolean(settings?.pagSeguro?.enabled),
    email: String(settings?.pagSeguro?.email ?? ''),
    token: ''
  },
  pix: {
    enabled: Boolean(settings?.pix?.enabled),
    pixKeyType: String(settings?.pix?.pixKeyType ?? 'CPF'),
    pixKey: String(settings?.pix?.pixKey ?? '')
  },
  appmax: {
    enabled: Boolean(settings?.appmax?.enabled),
    apiKey: ''
  },
  asaas: {
    enabled: Boolean(settings?.asaas?.enabled),
    apiKey: ''
  },
  pagarme: {
    enabled: Boolean(settings?.pagarme?.enabled),
    apiKey: '',
    encryptionKey: ''
  },
  stripe: {
    enabled: Boolean(settings?.stripe?.enabled),
    publishableKey: String(settings?.stripe?.publishableKey ?? ''),
    secretKey: ''
  }
});

// Carregar mapeamento de IDs do excel
const mappingPath = path.join(__dirname, 'detailed_id_mapping.json');
let detailedMapping: any = { byEmail: {}, byName: {}, metadata: {} };
try {
  if (fs.existsSync(mappingPath)) {
    detailedMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    console.log(`[DEBUG] Mapeamento detalhado carregado: ${detailedMapping.metadata?.totalRows} entradas`);
  }
} catch (e) {
  console.error('Falha ao carregar mapping detalhado:', e);
}

router.use('/dashboard', dashboardRoutes);

router.get('/settings/payment/public', async (_req, res) => {
  try {
    const settings = await readAppConfig(SETTINGS_KEYS.payment);
    res.json({ success: true, data: sanitizePaymentSettings(settings) });
  } catch (error: any) {
    console.error('Erro ao buscar configurações públicas de pagamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/settings/payment', supabaseAuth, async (_req, res) => {
  try {
    const settings = await readAppConfig(SETTINGS_KEYS.payment);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Erro ao buscar configurações de pagamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings/payment', supabaseAuth, async (req, res) => {
  try {
    await writeAppConfig(SETTINGS_KEYS.payment, req.body);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao salvar configurações de pagamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/settings/shipping', supabaseAuth, async (_req, res) => {
  try {
    const settings = await readAppConfig(SETTINGS_KEYS.shipping);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Erro ao buscar configurações de frete:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings/shipping', supabaseAuth, async (req, res) => {
  try {
    await writeAppConfig(SETTINGS_KEYS.shipping, req.body);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao salvar configurações de frete:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/settings/wallet', supabaseAuth, async (_req, res) => {
  try {
    const settings = await readAppConfig(SETTINGS_KEYS.wallet);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Erro ao buscar configurações da carteira:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings/wallet', supabaseAuth, async (req, res) => {
  try {
    await writeAppConfig(SETTINGS_KEYS.wallet, req.body);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao salvar configurações da carteira:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/admin/overview
router.get('/overview', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const stats = await getAdminOverview();
    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Erro no overview admin:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// DEBUG ENDPOINT - NO AUTH
router.get('/debug-overview', async (req, res) => {
  try {
    const stats = await getAdminOverview();
    res.json({ debug: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🏆 CAREER PLAN (Plano de Carreira)
// ==========================================

// GET /v1/admin/career/levels
router.get('/career/levels', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
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
router.post('/career/levels', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
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
router.put('/career/levels/:id', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
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
router.delete('/career/levels/:id', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
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

// ==========================================
// 🚀 DIGITAL CAREER PLAN (Plano de Carreira Digital)
// ==========================================

// GET /v1/admin/career/digital-levels
router.get('/career/digital-levels', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('career_levels_digital')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      if (error.code === '42P01') { // undefined_table
        console.warn('Tabela career_levels_digital não existe. Retornando lista vazia.');
        return res.json({ success: true, levels: [] });
      }
      throw error;
    }

    res.json({
      success: true,
      levels: data
    });
  } catch (error: any) {
    console.error('Erro ao buscar níveis de carreira digital:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /v1/admin/career/digital-levels
router.post('/career/digital-levels', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const {
      name,
      display_order,
      required_volume,
      commission_physical_rs,
      commission_rs_digital,
      commission_physical_affiliate,
      commission_affiliate_digital_essential,
      commission_affiliate_digital_professional,
      commission_affiliate_digital_premium,
      award,
      pin_image,
      active
    } = req.body;

    const { data, error } = await supabase
      .from('career_levels_digital')
      .insert([{
        name,
        display_order,
        required_volume,
        commission_physical_rs,
        commission_rs_digital,
        commission_physical_affiliate,
        commission_affiliate_digital_essential,
        commission_affiliate_digital_professional,
        commission_affiliate_digital_premium,
        award,
        pin_image,
        active
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      level: data
    });
  } catch (error: any) {
    console.error('Erro ao criar nível de carreira digital:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /v1/admin/career/digital-levels/:id
router.put('/career/digital-levels/:id', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('career_levels_digital')
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
    console.error('Erro ao atualizar nível de carreira digital:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /v1/admin/career/digital-levels/:id
router.delete('/career/digital-levels/:id', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('career_levels_digital')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Nível digital removido com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao remover nível de carreira digital:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 👥 CONSULTANTS MANAGEMENT
// ==========================================

// GET /v1/admin/consultants
router.get('/consultants', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    // 1. Buscar consultores com dados básicos (Bypass RLS)
    const { data: consultants, error } = await supabase
      .from('consultores')
      .select(`
        id, user_id, nome, email, telefone, whatsapp, cpf, pin_atual, status, created_at,
        endereco, numero, complemento, bairro, cidade, estado, cep,
        patrocinador:patrocinador_id(id, nome)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Buscar carteiras e rede em paralelo (Bypass RLS)
    const [walletsRes, networksRes, sigmaRes, profilesRes] = await Promise.all([
      supabaseAdmin.from('wallets').select('consultor_id, balance'),
      supabaseAdmin.from('downlines').select('upline_id, nivel'),
      supabaseAdmin.from('sigma_accumulators').select('*'),
      supabaseAdmin.from('user_profiles').select('user_id, id_numerico')
    ]);

    const walletMap = new Map((walletsRes.data || []).map(w => [w.consultor_id, w.balance]));
    const sigmaMap = new Map((sigmaRes.data || []).map(s => [s.consultor_id, s]));
    const profileMap = new Map((profilesRes.data || []).map((profile: any) => [profile.user_id, profile]));
    const { usedCodes, usedLogins } = collectExistingIdentifiers(consultants || [], profileMap);
    const statsMap = new Map();
    (networksRes.data || []).forEach(n => {
      const current = statsMap.get(n.upline_id) || { total: 0, l1: 0, l2: 0, l3: 0 };
      current.total++;
      if (n.nivel === 1) current.l1++;
      if (n.nivel === 2) current.l2++;
      if (n.nivel === 3) current.l3++;
      statsMap.set(n.upline_id, current);
    });

    // 3. Carregar Mapeamento Excel (Detailed Mapping)
    const mappingPath = path.join(__dirname, 'detailed_id_mapping.json');
    let detailedMapping: any = { byEmail: {}, byName: {} };
    if (fs.existsSync(mappingPath)) {
      try {
        const rawMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        Object.keys(rawMapping).forEach(key => {
          const entry = rawMapping[key];
          const nameKey = key.toLowerCase().trim();
          detailedMapping.byName[nameKey] = entry;
          if (entry.email) detailedMapping.byEmail[entry.email.toLowerCase().trim()] = entry;
        });
      } catch (err) { console.error('Erro no mapping:', err); }
    }

    // 4. Formatar resposta final
    const formattedConsultants = (consultants || []).map((c: any) => {
      const emailKey = (c.email || '').toLowerCase().trim();
      const nameKey = (c.nome || '').toLowerCase().trim();
      const mapping = detailedMapping.byEmail[emailKey] || detailedMapping.byName[nameKey] || detailedMapping[nameKey];
      const profile = profileMap.get(c.user_id) || profileMap.get(c.id);
      const identifiers = resolveConsultantIdentifiers({
        consultor: c,
        profile,
        mapping,
        usedCodes,
        usedLogins,
      });
      void persistConsultantIdentifiers({
        supabase: supabaseAdmin,
        consultor: c,
        profile,
        identifiers,
      }).catch(() => undefined);
      const stats = statsMap.get(c.id) || { total: 0, l1: 0, l2: 0, l3: 0 };
      const sigma = sigmaMap.get(c.id);

      return {
        id: c.id,
        uuid: c.user_id,
        code: identifiers.accountCode,
        username: identifiers.loginId,
        name: c.nome,
        registration_order: mapping?.order || c.registration_order || 9999,
        pin: c.pin_atual || 'Consultor',
        status: (c.status === 'ativo' ? 'Ativo' : c.status === 'pendente' ? 'Pendente' : 'Inativo'),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=random`,

        cpfCnpj: c.cpf || '',
        address: {
          street: (c.endereco ? `${c.endereco}${c.numero ? `, ${c.numero}` : ''}${c.bairro ? ` - ${c.bairro}` : ''}` : ''),
          city: c.cidade || '',
          state: c.estado || '',
          zip: c.cep || ''
        },
        contact: { email: c.email, phone: c.whatsapp || c.telefone || '' },
        bankInfo: {
          bank: c.banco || '',
          agency: c.agencia || '',
          account: c.conta || '',
          pixType: c.pix_tipo || 'CPF',
          pixKey: c.pix_chave || ''
        },

        balance: Number(walletMap.get(c.id) || 0),
        sigmaPoints: Number(sigma?.points_total || 0),
        sigmaCycles: Number(sigma?.cycles_total || 0),
        teamSize: stats.total,
        networkDetails: { directs: stats.l1, total: stats.total, l1: stats.l1, l2: stats.l2, l3: stats.l3 },
        sponsor: c.patrocinador ? { id: c.patrocinador.id, name: c.patrocinador.nome } : { id: 'root', name: 'RS Prólipsi' },
        registrationDate: c.created_at,
        sigmaActive: c.status === 'ativo',
        careerPinCurrent: c.pin_atual || 'Iniciante'
      };
    }).sort((a: any, b: any) => (a.registration_order || 9999) - (b.registration_order || 9999));

    res.json({ success: true, consultants: formattedConsultants });

  } catch (error: any) {
    console.error('Erro na rota de consultores:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/consultants/backfill-account-codes', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const { data: consultants, error: consultantsError } = await supabaseAdmin
      .from('consultores')
      .select('id, user_id, nome, email, username, codigo_consultor')
      .order('created_at', { ascending: true });

    if (consultantsError) throw consultantsError;

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, id_numerico');

    if (profilesError) throw profilesError;

    const profileMap = new Map((profiles || []).map((profile: any) => [profile.user_id, profile]));
    const { usedCodes, usedLogins } = collectExistingIdentifiers(consultants || [], profileMap);
    const updated: Array<{ id: string; name: string; accountCode: string }> = [];

    for (const consultant of consultants || []) {
      const profile = profileMap.get((consultant as any).user_id) || profileMap.get((consultant as any).id);
      const currentCode = String(profile?.id_numerico || (consultant as any).codigo_consultor || '').replace(/\D/g, '');

      if (!isPlaceholderIdentifier(currentCode)) {
        continue;
      }

      const identifiers = resolveConsultantIdentifiers({
        consultor: consultant,
        profile,
        usedCodes,
        usedLogins,
      });

      await persistConsultantIdentifiers({
        supabase: supabaseAdmin,
        consultor: consultant,
        profile,
        identifiers,
      });

      updated.push({
        id: (consultant as any).id,
        name: (consultant as any).nome || '',
        accountCode: identifiers.accountCode,
      });
    }

    res.json({
      success: true,
      processed: updated.length,
      updated,
    });
  } catch (error: any) {
    console.error('Erro ao vincular ID CONTA automatico:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/admin/network/root
router.get('/network/root', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    // Busca baseada no email oficial para garantir o root correto
    // 1. Prioridade MAXIMA: Email Oficial
    const OFFICIAL_EMAIL = 'rsprolipsioficial@gmail.com';
    const { data: rootByEmail } = await supabase
      .from('consultores')
      .select('id, nome, email, username, pin_atual, status')
      .eq('email', OFFICIAL_EMAIL)
      .maybeSingle();

    if (rootByEmail) return res.json({ success: true, root: rootByEmail });

    // 2. Prioridade ALTA: Nome da Empresa
    const { data: rootByName } = await supabase
      .from('consultores')
      .select('id, nome, email, username, pin_atual, status')
      .ilike('nome', '%PRÓLIPSI%OFICIAL%')
      .maybeSingle();

    if (rootByName) return res.json({ success: true, root: rootByName });

    // 3. Prioridade MÉDIA: ID Fixo legado (se existir)
    const KNOWN_ROOT_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    const { data: rootById } = await supabase
      .from('consultores')
      .select('id, nome, email, username, pin_atual, status')
      .eq('id', KNOWN_ROOT_ID)
      .maybeSingle();

    if (rootById) return res.json({ success: true, root: rootById });

    // 4. Último Recurso: O consultor mais antigo do banco (Provavelmente o dono)
    // NÃO PEGAR aleatório, pegar o Created At mais antigo
    const { data: oldestUser } = await supabase
      .from('consultores')
      .select('id, nome, email, username, pin_atual, status')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (oldestUser) return res.json({ success: true, root: oldestUser });

    return res.status(404).json({ success: false, error: 'Conta raiz não encontrada. Verifique se o usuário "rsprolipsioficial@gmail.com" existe.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/admin/network/tree/:id
// GET /v1/admin/network/tree/:id
router.get('/network/tree/:id', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  const { id } = req.params;
  const depth = parseInt(req.query.depth as string) || 99; // Profundidade ilimitada para o admin

  try {
    // 1. Carregar TODOS os consultores para memória (Hibrid ID Linkage Strategy)
    // Isso é necessário porque temos mix de UUIDs e Usernames como chaves de parentesco
    const { data: allConsultants, error } = await supabase
      .from('consultores')
      .select('id, nome, email, username, pin_atual, status, patrocinador_id, created_at, whatsapp, user_id')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 2. Encontrar o nó alvo (raiz da sub-árvore pedida)
    const targetNodeData = (allConsultants || []).find(c => String(c.id) === id || c.user_id === id);

    if (!targetNodeData) {
      return res.status(404).json({ success: false, message: 'Consultor não encontrado' });
    }

    // 3. Função recursiva de construção da árvore em memória
    const buildTreeInMemory = (parentId: string, currentLevel: number): any => {
      // Proteção de profundidade
      if (currentLevel > depth) return null;

      // Encontrar filhos: linkados por UUID ou Username
      const children = (allConsultants || []).filter(c => {
        // Vinculou direto pelo ID (UUID ou Int convertido p/ string)
        if (String(c.patrocinador_id) === String(parentId)) return true;

        // Vinculou pelo Username (Caso legado/app antigo)
        const parent = (allConsultants || []).find(p => String(p.id) === String(parentId));
        if (parent && parent.username && c.patrocinador_id === parent.username) return true;

        return false;
      });

      return {
        id: id === parentId ? targetNodeData.id : parentId, // Se for root, usa id do target
        // Dados do nó atual (precisamos buscar se não for o root inicial passado na func)
        ...((allConsultants || []).find(c => String(c.id) === String(parentId)) || {}),

        // Estrutura exigida pelo frontend
        name: ((allConsultants || []).find(c => String(c.id) === String(parentId))?.nome) || 'Desconhecido',
        pin: ((allConsultants || []).find(c => String(c.id) === String(parentId))?.pin_atual) || '',
        status: ((allConsultants || []).find(c => String(c.id) === String(parentId))?.status) || 'inativo',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(((allConsultants || []).find(c => String(c.id) === String(parentId))?.nome) || 'User')}&background=random`,
        level: currentLevel,
        directCount: children.length,

        // Recursão para filhos
        children: children.map(child => {
          // Construir o objeto do filho
          const childNode = buildTreeInMemory(child.id, currentLevel + 1);
          // Sobrescrever dados do nó filho com os dados reais dele (já que a função acima retorna baseada no ID)
          return {
            ...childNode,
            id: child.id,
            name: child.nome,
            pin: child.pin_atual || '',
            status: child.status,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(child.nome)}&background=random`,
            email: child.email,
            whatsapp: child.whatsapp,
            level: currentLevel + 1
          };
        }).filter(Boolean)
      };
    };

    // Construir a árvore starting from target
    // O nó raiz precisa ser construído manualmente pra iniciar a recursão corretamente nos filhos
    const children = (allConsultants || []).filter(c => {
      if (String(c.patrocinador_id) === String(targetNodeData.id)) return true;
      if (targetNodeData.username && c.patrocinador_id === targetNodeData.username) return true;
      return false;
    });

    const tree = {
      id: targetNodeData.id,
      name: targetNodeData.nome,
      pin: targetNodeData.pin_atual || '',
      status: targetNodeData.status,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(targetNodeData.nome)}&background=random`,
      level: 0,
      email: targetNodeData.email,
      whatsapp: targetNodeData.whatsapp,
      directCount: children.length,
      children: children.map(child => {
        const childNode = buildTreeInMemory(child.id, 1);
        return {
          ...childNode,
          id: child.id,
          name: child.nome,
          pin: child.pin_atual || '',
          status: child.status,
          email: child.email,
          whatsapp: child.whatsapp,
          level: 1
        };
      })
    };


    res.json({
      success: true,
      tree
    });

  } catch (error: any) {
    console.error('Erro ao buscar árvore:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/admin/network/children/:id
// Rota OTIMIZADA para buscar filhos diretos (Lazy Loading)
router.get('/network/children/:id', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar filhos diretos
    // Nota: patrocinador_id é UUID. Se id for string username, daria erro.
    // O Frontend deve garantir envio de UUID.
    const { data: children, error } = await supabase
      .from('consultores')
      .select('id, nome, email, username, pin_atual, status, whatsapp, created_at')
      .eq('patrocinador_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Formatar para o frontend
    const formattedChildren = children.map(c => ({
      id: c.id,
      name: c.nome,
      pin: c.pin_atual || '',
      status: c.status,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=random`,
      email: c.email,
      whatsapp: c.whatsapp,
      level: 1, // Relativo ao pai
      directCount: 0,
      hasChildren: false
    }));

    // Verificar se possuem filhos (para mostrar ícone de expansão)
    const childrenIds = formattedChildren.map(c => c.id);
    if (childrenIds.length > 0) {
      const { data: grandChildren } = await supabase
        .from('consultores')
        .select('patrocinador_id')
        .in('patrocinador_id', childrenIds);

      const grandChildrenMap = new Set(grandChildren?.map(g => g.patrocinador_id));
      formattedChildren.forEach(c => {
        c.hasChildren = grandChildrenMap.has(c.id);
        c.directCount = grandChildren?.filter(g => g.patrocinador_id === c.id).length || 0;
      });
    }

    res.json({ success: true, children: formattedChildren });

  } catch (error: any) {
    console.error('Erro ao buscar filhos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 🔄 CYCLE CLOSING (Fechamento de Ciclo)
// ==========================================

// POST /v1/admin/cycle/close
router.post('/cycle/close', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const { type } = req.body; // 'MENSAL' | 'TRIMESTRAL'

    if (type === 'MENSAL') {
      const result = await cycleClosingService.closeMonthlyCycle();
      return res.json(result);
    } else if (type === 'TRIMESTRAL') {
      const result = await cycleClosingService.closeQuarterlyCycle();
      return res.json(result);
    }

    res.status(400).json({ success: false, error: 'Tipo de fechamento inválido. Use MENSAL ou TRIMESTRAL.' });
  } catch (error: any) {
    console.error('Erro ao fechar ciclo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/admin/cycle/history
router.get('/cycle/history', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const history = await cycleClosingService.getHistory();
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 🔄 CYCLE CLOSING (Fechamento de Ciclo)
// ==========================================

// POST /v1/admin/cycle/close
router.post('/cycle/close', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const { type } = req.body; // 'MENSAL' | 'TRIMESTRAL'

    if (type === 'MENSAL') {
      const result = await cycleClosingService.closeMonthlyCycle();
      return res.json(result);
    } else if (type === 'TRIMESTRAL') {
      const result = await cycleClosingService.closeQuarterlyCycle();
      return res.json(result);
    }

    res.status(400).json({ success: false, error: 'Tipo de fechamento inválido. Use MENSAL ou TRIMESTRAL.' });
  } catch (error: any) {
    console.error('Erro ao fechar ciclo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/admin/cycle/history
router.get('/cycle/history', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {
  try {
    const history = await cycleClosingService.getHistory();
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
