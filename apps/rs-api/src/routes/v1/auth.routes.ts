/**
 * Authentication routes - V1
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../middlewares/supabaseAuth';
import type { AuthenticatedRequest } from '../../middlewares/supabaseAuth';
import { adicionarNaMatriz } from '../../services/matrixService';

const router = express.Router();

const slugifyLoginBase = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '') || 'consultor';

const uploadAvatarFromDataUrl = async (userId: string, avatarDataUrl?: string | null) => {
  if (!avatarDataUrl || typeof avatarDataUrl !== 'string' || !avatarDataUrl.startsWith('data:image/')) {
    return null;
  }

  const match = avatarDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const mimeType = match[1];
  const base64Content = match[2];
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const filePath = `avatars/${userId}-${Date.now()}.${ext}`;

  try {
    const buffer = Buffer.from(base64Content, 'base64');
    const { error } = await supabase.storage
      .from('rsia-uploads')
      .upload(filePath, buffer, { contentType: mimeType, upsert: true });

    if (error) {
      console.warn('[auth.register] Falha ao enviar avatar:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('rsia-uploads').getPublicUrl(filePath);
    return data.publicUrl || null;
  } catch (error: any) {
    console.warn('[auth.register] Falha ao processar avatar:', error?.message || error);
    return null;
  }
};

const findConsultorByAuthId = async (authUserId: string) => {
  const byUserId = await supabase
    .from('consultores')
    .select('*')
    .eq('user_id', authUserId)
    .maybeSingle();

  if (byUserId.data) {
    return byUserId;
  }

  return supabase
    .from('consultores')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle();
};

const findSponsorId = async (sponsorId?: string | null) => {
  if (sponsorId) {
    const normalizedSponsor = String(sponsorId).trim();

    const byUsername = await supabase
      .from('consultores')
      .select('id')
      .eq('username', normalizedSponsor)
      .maybeSingle();

    if (byUsername.data?.id) {
      return byUsername.data.id;
    }

    const byId = await supabase
      .from('consultores')
      .select('id')
      .eq('id', normalizedSponsor)
      .maybeSingle();

    if (byId.data?.id) {
      return byId.data.id;
    }
  }

  const root = await supabase
    .from('consultores')
    .select('id')
    .eq('username', 'rsprolipsi')
    .maybeSingle();

  return root.data?.id || null;
};

// POST /v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      nome,
      cpf,
      telefone,
      sponsorId,
      birthDate,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      avatarDataUrl,
    } = req.body;

    if (!email || !password || !nome || !cpf) {
      return res.status(400).json({ error: 'Dados incompletos: email, password, nome e cpf sao obrigatorios.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCpf = String(cpf).replace(/\D/g, '');
    const normalizedPhone = String(telefone || '').trim();

    console.log('[auth.register] Iniciando cadastro:', normalizedEmail);

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cpf: normalizedCpf,
        telefone: normalizedPhone,
      },
    });

    if (authError || !authUser.user) {
      console.error('[auth.register] Erro auth:', authError);
      return res.status(400).json({ error: authError?.message || 'Nao foi possivel criar o usuario.' });
    }

    const userId = authUser.user.id;
    const resolvedSponsorId = await findSponsorId(sponsorId);

    if (!resolvedSponsorId) {
      await supabase.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Patrocinador raiz nao encontrado. Sistema nao inicializado.' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const login = `${slugifyLoginBase(String(nome))}${randomSuffix}`;
    const avatarUrl = await uploadAvatarFromDataUrl(userId, avatarDataUrl);

    const { error: profileError } = await supabase
      .from('consultores')
      .insert({
        id: userId,
        user_id: userId,
        nome,
        cpf: normalizedCpf,
        email: normalizedEmail,
        telefone: normalizedPhone,
        patrocinador_id: resolvedSponsorId,
        username: login,
        status: 'ativo',
        pin_atual: 'Iniciante',
      });

    if (profileError) {
      console.error('[auth.register] Erro consultores:', profileError);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Erro ao criar perfil: ' + profileError.message });
    }

    const profilePayload = {
      user_id: userId,
      nome_completo: nome,
      email: normalizedEmail,
      telefone: normalizedPhone,
      cpf: normalizedCpf,
      sponsor_id: resolvedSponsorId,
      perfil_completo: Boolean(
        nome &&
        normalizedEmail &&
        normalizedCpf &&
        normalizedPhone &&
        birthDate &&
        cep &&
        street &&
        number &&
        neighborhood &&
        city &&
        state
      ),
      data_nascimento: birthDate || null,
      endereco_cep: cep || null,
      endereco_rua: street || null,
      endereco_numero: number || null,
      endereco_complemento: complement || null,
      endereco_bairro: neighborhood || null,
      endereco_cidade: city || null,
      endereco_estado: state || null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: userProfileError } = await supabase
      .from('user_profiles')
      .upsert(profilePayload, { onConflict: 'user_id' });

    if (userProfileError) {
      console.error('[auth.register] Erro user_profiles:', userProfileError);

      const { error: fallbackProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          nome_completo: nome,
          email: normalizedEmail,
          telefone: normalizedPhone,
          cpf: normalizedCpf,
          sponsor_id: resolvedSponsorId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (fallbackProfileError) {
        console.error('[auth.register] Erro fallback user_profiles:', fallbackProfileError);
      }
    }

    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        consultor_id: userId,
        status: 'ativa',
        balance: 0,
      });

    if (walletError) {
      console.error('[auth.register] Erro wallet:', walletError);
    } else {
      const walletUpdates = [
        { balance_blocked: 0 },
        { saldo_disponivel: 0, saldo_bloqueado: 0, saldo_total: 0 },
        { available_balance: 0, blocked_balance: 0, currency: 'BRL' },
      ];

      for (const update of walletUpdates) {
        const { error: walletSyncError } = await supabase
          .from('wallets')
          .update(update)
          .eq('user_id', userId);

        if (walletSyncError && walletSyncError.code !== '42703') {
          console.error('[auth.register] Erro ao alinhar wallet:', walletSyncError);
        }
      }
    }

    try {
      await adicionarNaMatriz(userId);
    } catch (matrixError: any) {
      console.error('[auth.register] Erro matriz:', matrixError);
    }

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso',
      user: {
        id: userId,
        email: normalizedEmail,
        login,
        avatar_url: avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('[auth.register] Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

// GET /v1/auth/profile
router.get('/profile', supabaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario nao autenticado',
        code: 'USER_NOT_AUTHENTICATED',
      });
    }

    const { data: profile, error: profileError } = await findConsultorByAuthId(req.user.id);

    if (profileError && !profile) {
      console.error('[auth.profile] Erro ao buscar perfil:', profileError);
      return res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        profile: {
          completed: false,
          needsSetup: true,
          nome: (req.user as any).user_metadata?.name || req.user.email,
        },
        permissions: ['read:profile'],
      });
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .maybeSingle();

    res.json({
      id: req.user.id,
      email: req.user.email,
      role: userRole?.role || 'user',
      profile: {
        ...(profile || {}),
        completed: Boolean(profile),
      },
      permissions: getPermissionsForRole(userRole?.role || 'user'),
    });
  } catch (error) {
    console.error('[auth.profile] Erro interno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
});

// POST /v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha sao obrigatorios',
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return res.status(401).json({ error: 'Email ou senha invalidos' });
    }

    const user = authData.user;
    const { data: profile } = await findConsultorByAuthId(user.id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: profile?.nome || (user.user_metadata as any)?.nome || 'Usuario',
        ...profile,
      },
      token: authData.session.access_token,
    });
  } catch (error) {
    console.error('[auth.login] Erro interno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// POST /v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email e obrigatorio',
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      console.error('[auth.forgot-password] Erro:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Email de recuperacao enviado com sucesso',
    });
  } catch (error) {
    console.error('[auth.forgot-password] Erro interno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// POST /v1/auth/logout
router.post('/logout', (_req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
});

// POST /v1/auth/refresh
router.post('/refresh', (_req, res) => {
  res.json({
    success: true,
    token: 'new-mock-jwt-token-789012',
    expires_in: 3600,
  });
});

function getPermissionsForRole(role: string): string[] {
  const basePermissions = ['read:profile', 'read:wallet'];

  const rolePermissions: Record<string, string[]> = {
    admin: [
      'read:admin',
      'write:admin',
      'manage:users',
      'manage:consultants',
      'view:reports',
      'manage:system',
    ],
    consultor: [
      'read:dashboard',
      'read:network',
      'manage:referrals',
      'view:sales',
      'request:withdraw',
    ],
    master: [
      'read:dashboard',
      'read:network',
      'manage:team',
      'view:team-reports',
      'request:withdraw',
    ],
    lojista: [
      'read:store',
      'manage:products',
      'view:sales',
      'request:withdraw',
    ],
    user: [
      'read:profile',
      'read:wallet',
    ],
  };

  return [...basePermissions, ...(rolePermissions[role] || [])];
}

export default router;
