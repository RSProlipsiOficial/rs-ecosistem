/**
 * 🔐 MIDDLEWARE DE AUTENTICAÇÃO SUPABASE JWT
 * 
 * Autenticação proper usando JWT do Supabase para o V1
 */

import type { Request, Response, NextFunction } from "express";
// @ts-ignore – no types for jsonwebtoken available
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabaseClient';

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, any>;
  role?: string;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Middleware para autenticação JWT do Supabase
 */
export async function supabaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticação necessário',
        code: 'AUTH_TOKEN_REQUIRED'
      });
    }

    const token = authHeader.slice(7); // Remove 'Bearer '

    // Verifica se o token é um JWT válido
    if (!isValidJwtFormat(token)) {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verifica o token com o Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Erro na verificação do token:', error?.message);
      return res.status(401).json({
        error: 'Token inválido ou expirado',
        code: 'INVALID_OR_EXPIRED_TOKEN'
      });
    }

    // Decodifica o JWT para obter informações adicionais
    const decoded = jwt.decode(token) as SupabaseJwtPayload;

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    // Adiciona informações do usuário à requisição
    // Verifica metadata para role customizada (prioridade sobre role do JWT)
    const customRole = user.user_metadata?.role || user.app_metadata?.role;

    req.user = {
      id: user.id,
      email: user.email || undefined,
      role: customRole || decoded.role || 'user'
    };

    next();

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno na autenticação',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
}

/**
 * Middleware para verificar roles específicos
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
}

/**
 * Middleware para verificar se o usuário é dono do recurso ou admin
 */
export function isOwnerOrAdmin(userIdField = 'userId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária',
        code: 'AUTH_REQUIRED'
      });
    }

    const requestedUserId = req.params[userIdField] || req.body[userIdField];
    const userRole = req.user.role || 'user';

    // Admin tem acesso a tudo
    if (userRole === 'admin' || userRole === 'superadmin') {
      return next();
    }

    // Usuário só pode acessar seus próprios recursos
    if (req.user.id === requestedUserId) {
      return next();
    }

    return res.status(403).json({
      error: 'Acesso não autorizado',
      code: 'UNAUTHORIZED_ACCESS'
    });
  };
}

/**
 * Verifica se o token tem formato JWT válido
 */
function isValidJwtFormat(token: string): boolean {
  // Formato básico: três partes separadas por ponto
  const parts = token.split('.');
  return parts.length === 3;
}

// Roles disponíveis no sistema
export const ROLES = {
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  CONSULTOR: 'consultor',
  MASTER: 'master',
  LOJISTA: 'lojista',
  USER: 'user'
} as const;