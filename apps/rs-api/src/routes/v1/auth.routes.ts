/**
 * 🔐 ROTAS DE AUTENTICAÇÃO - V1
 * 
 * Endpoints para login, logout e gestão de perfis
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../middlewares/supabaseAuth';
import type { AuthenticatedRequest } from '../../middlewares/supabaseAuth';
import { adicionarNaMatriz } from '../../services/matrixService';

const router = express.Router();

// POST /v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, nome, cpf, telefone, sponsorId } = req.body;

    if (!email || !password || !nome || !cpf) {
      return res.status(400).json({ error: 'Dados incompletos: email, password, nome e cpf são obrigatórios.' });
    }

    console.log('📝 Iniciando cadastro:', email);

    // 1. Criar usuário no Auth (Admin)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm
      user_metadata: { nome, cpf }
    });

    if (authError) {
      console.error('Erro auth:', authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authUser.user.id;
    console.log('✅ Usuário Auth criado:', userId);

    // 2. Verificar Patrocinador
    let sponsorDbId = null;

    // Tentar encontrar pelo login fornecido
    if (sponsorId) {
      const { data: sponsor } = await supabase
        .from('consultores')
        .select('id')
        .eq('login', sponsorId)
        .single();
      if (sponsor) sponsorDbId = sponsor.id;
    }

    // Fallback para root (rsprolipsi) se não fornecido ou não encontrado
    if (!sponsorDbId) {
      const { data: root } = await supabase
        .from('consultores')
        .select('id')
        .eq('login', 'rsprolipsi')
        .single();
      sponsorDbId = root?.id;
    }

    if (!sponsorDbId) {
      // Se nem o root existir, falha crítica (ou usa o primeiro user?)
      // Vamos tentar buscar qualquer um se o root falhar, ou retornar erro
      return res.status(500).json({ error: 'Patrocinador raiz não encontrado. Sistema não inicializado.' });
    }

    // 3. Gerar Login (slug)
    // Ex: Nome Sobrenome -> nomesobrenome1234
    const loginBase = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const login = `${loginBase}${randomSuffix}`;

    // 4. Criar Consultor (Profile)
    const { error: profileError } = await supabase
      .from('consultores')
      .insert({
        id: userId,
        nome,
        cpf,
        email,
        telefone: telefone || '',
        patrocinador_id: sponsorDbId,
        login,
        status: 'ativo', // Entra ativo conforme solicitado
        pin_atual: 'Iniciante'
      });

    if (profileError) {
      console.error('Erro profile:', profileError);
      return res.status(500).json({ error: 'Erro ao criar perfil: ' + profileError.message });
    }

    // 5. Criar Wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        consultor_id: userId,
        balance: 0.00,
        balance_blocked: 0.00
      });

    if (walletError) {
      console.error('Erro wallet:', walletError);
    }

    // 6. Posicionar na Matriz
    try {
      await adicionarNaMatriz(userId);
    } catch (matrixError: any) {
      console.error('Erro matriz:', matrixError);
      // Não retornar erro para o usuário se falhar a matriz, mas logar
    }

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso',
      user: {
        id: userId,
        email,
        login
      }
    });

  } catch (error: any) {
    console.error('Erro interno cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

// GET /v1/auth/profile
router.get('/profile', supabaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    console.log('🔍 [DEBUG] Buscando perfil para Auth User ID:', req.user.id);

    // Buscar perfil completo do usuário
    const { data: profile, error: profileError } = await supabase
      .from('consultores')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profile) {
      console.log('✅ [DEBUG] Perfil encontrado:', profile.nome, 'ID:', profile.id);
    } else {
      console.warn('⚠️ [DEBUG] Perfil NÃO encontrado para ID:', req.user.id);
    }

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);

      // Se não encontrar perfil, retorna informações básicas do auth
      return res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        profile: {
          completed: false,
          needsSetup: true,
          nome: (req.user as any).user_metadata?.name || req.user.email

        },
        permissions: ['read:profile']
      });
    }

    // Buscar role do usuário
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .single();

    res.json({
      id: req.user.id,
      email: req.user.email,
      role: userRole?.role || 'user',
      profile: {
        ...profile,
        completed: true
      },
      permissions: getPermissionsForRole(userRole?.role || 'user')
    });

  } catch (error) {
    console.error('Erro no perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// POST /v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Login com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const user = authData.user;

    // Buscar dados do perfil
    const { data: profile } = await supabase
      .from('consultores')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: profile?.nome || 'Usuário',
        ...profile
      },
      token: authData.session.access_token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email é obrigatório'
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Email de recuperação enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro no forgot-password:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /v1/auth/logout
router.post('/logout', (req, res) => {
  // TODO: Implementar logout com Supabase Auth
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// POST /v1/auth/refresh
router.post('/refresh', (req, res) => {
  // TODO: Implementar refresh token com Supabase Auth
  res.json({
    success: true,
    token: 'new-mock-jwt-token-789012',
    expires_in: 3600
  });
});

/**
 * Retorna as permissões baseadas no role do usuário
 */
function getPermissionsForRole(role: string): string[] {
  const basePermissions = ['read:profile', 'read:wallet'];

  const rolePermissions: Record<string, string[]> = {
    admin: [
      'read:admin',
      'write:admin',
      'manage:users',
      'manage:consultants',
      'view:reports',
      'manage:system'
    ],
    consultor: [
      'read:dashboard',
      'read:network',
      'manage:referrals',
      'view:sales',
      'request:withdraw'
    ],
    master: [
      'read:dashboard',
      'read:network',
      'manage:team',
      'view:team-reports',
      'request:withdraw'
    ],
    lojista: [
      'read:store',
      'manage:products',
      'view:sales',
      'request:withdraw'
    ],
    user: [
      'read:profile',
      'read:wallet'
    ]
  };

  return [...basePermissions, ...(rolePermissions[role] || [])];
}

export default router;