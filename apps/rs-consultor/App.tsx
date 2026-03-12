import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ConsultantLayout, { UserContext, DashboardConfigContext, type DashboardConfig } from './consultant/ConsultantLayout';
import Dashboard from './consultant/Dashboard';
import CicloGlobal from './consultant/sigme/CicloGlobal';
import MatrizSigma, { ArvoreInterativaPage } from './consultant/sigme/MatrizSigma';
import Comunicacao from './consultant/Comunicacao';
import Configuracoes from './consultant/Configuracoes';
import Studio from './consultant/RsShop'; // The Studio is now in its own dedicated file

// SIGME Panel Pages
import PlanoCarreira from './consultant/sigme/PlanoCarreira';
import TopSigme from './consultant/sigme/TopSigme';
import RelatoriosRede from './consultant/Relatorios'; // Repurposed for network reports
import BonusProfundidade from './consultant/sigme/BonusProfundidade';
import BonusFidelidade from './consultant/sigme/BonusFidelidade';
import PlanoCarreiraDigital from './consultant/sigme/PlanoCarreiraDigital';

// RS Shop Pages
import ShopLayout from './consultant/shop/ShopLayout';
import Marketplace from './consultant/shop/Marketplace';
import CentroDistribuicao from './consultant/shop/CentroDistribuicao';
import Dropshipping from './consultant/shop/Dropshipping';
import LinksAfiliado from './consultant/shop/LinksAfiliado';
import PixelsMarketing from './consultant/shop/PixelsMarketing';
import EncurtadorLink from './consultant/shop/EncurtadorLink';
import MeusDados from './consultant/shop/MeusDados';
// import PlanosCarreira from './consultant/shop/PlanosCarreira';

// Auth Page
import Login from './auth/Login';
import Signup from './auth/Signup';


// Wallet Pages
import WalletLayout from './consultant/wallet/WalletLayout';
import SaldoExtrato from './consultant/wallet/SaldoExtrato';
import Cobrancas from './consultant/wallet/Cobrancas';
import Assinaturas from './consultant/wallet/Assinaturas';
import Transferir from './consultant/wallet/Transferir';
import Saque from './consultant/wallet/Saque';
import RelatoriosFinanceiros from './consultant/wallet/RelatoriosFinanceiros';
import ConfiguracoesFinanceiras from './consultant/wallet/ConfiguracoesFinanceiras';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminPersonalData from './admin/PersonalData';
import DashboardEditor from './admin/DashboardEditor';

// Data and Types
import { mockUser, mockMessages, mockPromoBanners, mockIncentives, mockDirects, generateMatrixNetwork, mockMatrixMembers } from './consultant/data';
import type { User, SystemMessage } from './types';
import { supabase } from './consultant/services/supabaseClient';
import { sigmaApi } from './consultant/services/sigmaApi';
import { dashboardApi } from './consultant/services/dashboardApi';
import { syncService } from './consultant/services/syncService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const resolveConsultantNumericCode = async (params: { slug?: string | null; email?: string | null; name?: string | null; }): Promise<string> => {
  const candidates = [params.slug, params.email, params.name]
    .map(value => String(value || '').trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/consultor/search?q=${encodeURIComponent(candidate)}`);
      const payload = await response.json();
      const results = Array.isArray(payload?.results) ? payload.results : [];
      const match = results.find((item: any) => {
        const sameEmail = params.email && item?.email && String(item.email).trim().toLowerCase() === String(params.email).trim().toLowerCase();
        const sameName = params.name && item?.nome && String(item.nome).trim().toLowerCase() === String(params.name).trim().toLowerCase();
        return sameEmail || sameName || candidate.toLowerCase() === String(item?.username || '').trim().toLowerCase();
      }) || results[0];

      if (match?.numericId) {
        return String(match.numericId);
      }
    } catch {
      // noop
    }
  }

  return '';
};

const inferPixKeyType = (value?: string | null): 'email' | 'cpf' | 'phone' | 'random' => {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');

  if (!raw) return 'random';
  if (raw.includes('@')) return 'email';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) return 'random';
  if (raw.startsWith('+') || raw.includes('(') || raw.includes(')') || raw.includes('-') || digits.length >= 12) return 'phone';
  if (digits.length === 11) return 'cpf';
  return 'random';
};


// [RS-BRANDING] - Constantes Globais de Identidade
const DEFAULT_LOGO_RS = '/logo-rs.png';
const BANNED_PATTERNS = ['0aa67016', 'user-attachments/assets', 'google', 'ai-studio'];
const OFFICIAL_BANNER_RS = 'https://github.com/user-attachments/assets/bf61e389-9e8c-4f9e-a0e1-7e81084d59de';

// Branding Context
interface BrandingType {
  logo: string;
  favicon: string;
  companyName: string;
}
export const BrandingContext = createContext<BrandingType>({
  logo: DEFAULT_LOGO_RS,
  favicon: '/favicon.ico',
  companyName: 'RSPrólipsi'
});

export const useBranding = () => useContext(BrandingContext);

// New Layout Context for full-screen focus mode
type LayoutMode = 'default' | 'focus';
interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
}
export const LayoutContext = createContext<LayoutContextType | null>(null);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useContext(UserContext)!;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

const defaultDashboardConfig: DashboardConfig = {
  userInfo: [
    { id: 'userInfo-1', label: 'Graduação', source: 'graduacao' },
    { id: 'userInfo-2', label: 'Status da Conta', source: 'status' },
    { id: 'userInfo-3', label: 'Atividade Mensal', source: 'status' }, // Reusing status for demo
    { id: 'userInfo-4', label: 'Categoria', source: 'categoria' },
  ],
  links: [
    { id: 'link-1', label: 'Link de Indicação (ID Único)', source: 'linkIndicacao' },
    { id: 'link-2', label: 'Link da Loja (Marketplace)', source: 'linkLoja' },
    { id: 'link-3', label: 'Link de Cadastro (MMN)', source: 'linkCadastro' },
  ],
  promoBanners: mockPromoBanners.map(b => ({
    ...b,
    imageDataUrl: undefined,
    price: (b as any).price || 0,
    imageUrl: b.imageUrl || ''
  })) as any,
  bonusCards: [
    { id: 'bonus-1', source: 'bonusCicloGlobal' },
    { id: 'bonus-2', source: 'bonusTopSigme' },
    { id: 'bonus-3', source: 'bonusPlanoCarreira' },
    { id: 'bonus-4', source: 'bonusProfundidade' },
  ],
  progressBars: {
    // 'qualificacaoAtual' removed as requested by the user ("I think we can remove the qualification for the month.")
    alcanceCategorias: {
      id: 'alcanceCategorias',
      title: 'Próximo PIN',
      startIcon: 'IconAward',
      endIcon: 'IconAward',
      calculationMode: 'auto',
      targetPin: null,
    },
  },
  pinLogos: {
    'Bronze': 'https://api.sigma.rsprolipsi.com.br/assets/pins/bronze.png',
    'Prata': 'https://api.sigma.rsprolipsi.com.br/assets/pins/prata.png',
    'Ouro': 'https://api.sigma.rsprolipsi.com.br/assets/pins/ouro.png',
    'Safira': 'https://api.sigma.rsprolipsi.com.br/assets/pins/safira.png',
    'Rubi': 'https://api.sigma.rsprolipsi.com.br/assets/pins/rubi.png',
    'Esmeralda': 'https://api.sigma.rsprolipsi.com.br/assets/pins/esmeralda.png',
    'Diamante': 'https://api.sigma.rsprolipsi.com.br/assets/pins/diamante.png',
    'Diamante Blue': 'https://api.sigma.rsprolipsi.com.br/assets/pins/diamante-blue.png',
    'Diamante Red': 'https://api.sigma.rsprolipsi.com.br/assets/pins/diamante-red.png',
    'Diamante Black': 'https://api.sigma.rsprolipsi.com.br/assets/pins/diamante-black.png',
    'Imperial': 'https://api.sigma.rsprolipsi.com.br/assets/pins/imperial.png',
    'Royal': 'https://api.sigma.rsprolipsi.com.br/assets/pins/royal.png',
    'Embaixador': 'https://api.sigma.rsprolipsi.com.br/assets/pins/embaixador.png',
  },
  networkSummary: { source: 'top-sigme' },
  incentives: mockIncentives,
};

const getInitialConfig = (): DashboardConfig => {
  try {
    const savedConfig = localStorage.getItem('dashboardConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Basic validation to ensure the loaded object is a valid config
      if (parsed && parsed.userInfo) {
        // Merge with default to ensure new fields are present if not in saved config
        return { ...defaultDashboardConfig, ...parsed };
      }
    }
  } catch (error) {
    console.error("Failed to load or parse dashboard config from localStorage:", error);
    localStorage.removeItem('dashboardConfig'); // Clear invalid data
  }
  return defaultDashboardConfig;
};

const formatCpfCnpj = (value?: string | null): string => {
  if (!value) return '';
  const clean = String(value).replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return String(value);
};

type ConsultorBridgePayload = {
  token?: string;
  accessToken?: string;
  userId?: string;
  uid?: string;
  userEmail?: string;
  email?: string;
  source?: string;
  autoLogin?: boolean;
};

const parseConsultorBridgePayload = (value: string): ConsultorBridgePayload | null => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as ConsultorBridgePayload : null;
  } catch {
    try {
      const decoded = decodeURIComponent(escape(atob(value)));
      const parsed = JSON.parse(decoded);
      return parsed && typeof parsed === 'object' ? parsed as ConsultorBridgePayload : null;
    } catch {
      return null;
    }
  }
};

const extractConsultorBridgeToken = () => {
  if (typeof window === 'undefined') return null;

  const fromSearch = new URLSearchParams(window.location.search).get('token');
  if (fromSearch) return fromSearch;

  const hash = window.location.hash || '';
  const queryIndex = hash.indexOf('?');
  if (queryIndex >= 0) {
    const params = new URLSearchParams(hash.slice(queryIndex + 1));
    return params.get('token');
  }

  return null;
};

const normalizeConsultorAccessToken = (rawToken: string) => {
  const payload = parseConsultorBridgePayload(rawToken);
  const accessToken = String(payload?.accessToken || payload?.token || rawToken || '').trim();
  return { payload, accessToken };
};


const ContextProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // [RS-ENCARREGADO-SYNC] - FORÇANDO DADOS DO ROBERTO NO ESTADO INICIAL
  const [user, setUser] = useState<User>(mockUser);
  const [messages, setMessages] = useState<SystemMessage[]>(mockMessages);
  const [credits, setCredits] = useState(100);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(getInitialConfig());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [branding, setBranding] = useState<BrandingType>({
    logo: DEFAULT_LOGO_RS,
    favicon: '/favicon.ico',
    companyName: 'RSPrólipsi'
  });

  // Handlers moved from ConsultantLayout
  const updateUser = (newUserData: Partial<User>) => {
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
  };

  const fetchConsultorRecord = React.useCallback(async (authUserId?: string | null, email?: string | null) => {
    if (!authUserId && !email) {
      return null;
    }

    let query = supabase.from('consultores').select('*');
    if (authUserId && email) {
      query = query.or(`user_id.eq."${authUserId}",email.eq."${email}"`);
    } else if (authUserId) {
      query = query.eq('user_id', authUserId);
    } else {
      query = query.eq('email', email as string);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('[App] Fallback consultores indisponivel:', error.message);
      return null;
    }

    return data;
  }, []);

  const markMessageAsRead = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const checkSessionAndFetchUser = React.useCallback(async (sessionOverride?: any) => {
    try {
      const session = sessionOverride || (await supabase.auth.getSession()).data.session;

      if (session) {
        localStorage.setItem('consultorToken', session.access_token);
        setIsAuthenticated(true);

        const currentUserEmail = session.user.email;
        console.log(`[App] Session found. Fetching user ${currentUserEmail}...`);

        // [FIX] Estratégia de Merge Híbrida (Profile + Consultores)
        // Busca perfil no user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*, cover_url')
          .eq('user_id', session.user.id)
          .maybeSingle();

        // Sempre busca o legado em consultores tambem.
        // Isso garante patrocinador_id, username e outros vinculos operacionais
        // mesmo quando user_profiles vier "completo" mas sem os campos de rede.
        let consultData = await fetchConsultorRecord(session.user.id, currentUserEmail);
        // Se perfil não existe OU se o nome está vazio/default
        if (false && (!profile || !profile.name || profile.name === 'Carregando...')) {
          const { data: c } = await supabase
            .from('consultores')
            .select('*')
            .eq('email', currentUserEmail)
            .maybeSingle();
          consultData = c;
        }

        if (profile || consultData) {
          console.log('[App] Merging User Data:', { profileId: profile?.id, consultorId: consultData?.id });

          const isMasterAccount =
            currentUserEmail?.toLowerCase().includes('rsprolipsi') ||
            profile?.slug?.toLowerCase().includes('rsprolipsi') ||
            consultData?.username?.toLowerCase().includes('rsprolipsi');

          const resolvedName = isMasterAccount ? 'RS PRÓLIPSI' : (profile?.nome_completo || profile?.full_name || profile?.name || consultData?.nome || user.name);
          const resolvedSlug = isMasterAccount ? 'rsprolipsi' : (profile?.slug || profile?.id_consultor || profile?.consultant_id || consultData?.username || consultData?.mmn_id || user.idConsultor);
          const fallbackCode = await resolveConsultantNumericCode({
            slug: resolvedSlug,
            email: currentUserEmail || profile?.email || consultData?.email,
            name: resolvedName,
          });

          setUser(prev => {
            // [RS-UNIFY-LOGIC] - Forçar Identidade Mestre RS Prólipsi
            const baseName = isMasterAccount ? 'RS PRÓLIPSI' : (profile?.nome_completo || profile?.full_name || profile?.name || consultData?.nome || prev.name);
            const baseSlug = isMasterAccount ? 'rsprolipsi' : (profile?.slug || profile?.id_consultor || profile?.consultant_id || consultData?.username || consultData?.mmn_id || prev.idConsultor);
            const numericId = profile?.id_numerico || consultData?.id_numerico || consultData?.codigo_consultor || fallbackCode || prev.idNumerico;
            const accountCode = numericId || consultData?.codigo_consultor || fallbackCode || prev.code;
            const loginId = baseSlug || consultData?.username || consultData?.mmn_id || prev.loginId;
            const baseWhatsapp = profile?.telefone || profile?.phone || profile?.whatsapp || consultData?.whatsapp || consultData?.telefone || prev.whatsapp;
            const baseCover = profile?.cover_url || '';

            // ... (avatar logic kept identical)
            let rawAvatar = profile?.avatar_url || consultData?.foto || prev.avatarUrl;
            if (!rawAvatar || BANNED_PATTERNS.some(p => rawAvatar?.includes(p))) rawAvatar = branding.logo;
            let baseAvatar = rawAvatar;

            // [RS-SYNC-LINKS] - Portas: 3002 (Cadastro), 3003 (Loja)
            const currentOrigin = window.location.origin;
            const isLocal = currentOrigin.includes('localhost');
            const marketplaceDomain = isLocal ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';
            const rotaFacilDomain = isLocal ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

            const linkLoja = `${marketplaceDomain}/loja/${baseSlug}`;
            const linkIndicacao = `${rotaFacilDomain}/indicacao/${baseSlug}#/login`;
            const linkCadastro = `${rotaFacilDomain}/indicacao/${baseSlug}#/signup`;

            return {
              ...prev,
              // Base do Profile (se existir)
              ...profile,
              // Base do Consultor (se existir e profile não tiver sobrescrito)
              ...consultData,

              // Garantias Críticas e Blindagem
              id: session.user.id,
              name: baseName,
              whatsapp: baseWhatsapp,
              email: currentUserEmail,
              idConsultor: baseSlug,
              idNumerico: numericId,
              code: accountCode ? String(accountCode) : prev.code,
              loginId: loginId || prev.loginId,
              patrocinador_id: consultData?.patrocinador_id || (profile as any)?.sponsor_id || (profile as any)?.patrocinador_id || prev.patrocinador_id,
              avatarUrl: baseAvatar,
              coverUrl: baseCover,
              linkLoja,
              linkIndicacao,

              // Mapeamento Correto de CPF e Data
              cpfCnpj: formatCpfCnpj(profile?.cpf || (profile as any)?.cpf_cnpj || consultData?.cpf || consultData?.cpf_cnpj || prev.cpfCnpj),
              birthDate: profile?.data_nascimento || profile?.birth_date || consultData?.data_nascimento || prev.birthDate,

              // Mapeamento Correto do Objeto Address
              address: {
                zipCode: profile?.endereco_cep || profile?.address_zip || consultData?.cep || prev.address.zipCode,
                street: profile?.endereco_rua || profile?.address_street || consultData?.endereco || prev.address.street,
                number: profile?.endereco_numero || consultData?.numero || prev.address.number,
                neighborhood: profile?.endereco_bairro || profile?.address_neighborhood || consultData?.bairro || prev.address.neighborhood,
                city: profile?.endereco_cidade || profile?.address_city || consultData?.cidade || prev.address.city,
                state: profile?.endereco_estado || profile?.address_state || consultData?.estado || prev.address.state,
              },
              bankAccount: {
                bank: (profile as any)?.banco_nome || prev.bankAccount.bank,
                agency: (profile as any)?.banco_agencia || prev.bankAccount.agency,
                accountNumber: (profile as any)?.banco_conta || prev.bankAccount.accountNumber,
                accountType: ((profile as any)?.banco_tipo as 'checking' | 'savings') || prev.bankAccount.accountType,
                pixKey: (profile as any)?.banco_pix || prev.bankAccount.pixKey,
                pixKeyType: inferPixKeyType((profile as any)?.banco_pix || prev.bankAccount.pixKey),
              }
            };
          });
        }
      } else {
        console.log('[App] No session found.');
        // Para fins de desenvolvimento, se não houver sessão mas o usuário foi setado manualmente (ex: login fake)
        // Mas agora o login é real, então limpamos.
        // setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('[App] Detailed fetch error:', err);
    }
  }, [branding.logo, fetchConsultorRecord]);

  const login = async (email: string, pass: string, callback: () => void): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        console.error('[Auth] Login error:', error.message);
        return false;
      }

      if (data.session) {
        localStorage.setItem('consultorToken', data.session.access_token);
        setIsAuthenticated(true);
        // [FIX] Update user state immediately after login
        await checkSessionAndFetchUser();
        callback();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Auth] Unexpected error:', err);
      return false;
    }
  };

  const onSyncProfile = async (): Promise<Partial<User> | null> => {
    try {
      console.log("[Sync] Iniciando sincronização...");
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        console.warn("[Sync] Usuário não autenticado no Supabase Auth.");
        return null;
      }

        console.log("[Sync] Buscando user_profiles para:", authUser.id);
        const consultData = await fetchConsultorRecord(authUser.id, authUser.email || null);

      // [RS-SYNC-FIX] - user_profiles (Source of Truth)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("[Sync] Erro ao buscar user_profiles:", profileError);
        throw profileError;
      }

      const OFFICIAL_LOGO_GOLD = 'https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6';
      const isMaster = profile?.slug === 'rsprolipsi' || authUser.email?.includes('rsprolipsioficial');

      // [RS-FORMAT-HELPER] - Formatação de CPF/CNPJ
      const formatCpfCnpj = (value: string | null): string => {
        if (!value) return '';
        const clean = value.replace(/\D/g, '');
        if (clean.length === 11) {
          return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (clean.length === 14) {
          return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return value;
      };

      if (profile) {
        console.log("[Sync Consultor] ✅ Perfil encontrado em user_profiles!", profile);

        // [RS-MASTER-FORCE] - Blindagem da Identidade Mestre
        // Se for a conta da Sede, força os dados oficiais
        // [RS-UNIFY-LOGIC] - Forçar Identidade Mestre RS Prólipsi
        const isMasterAccount =
          profile.slug?.toLowerCase().includes('rsprolipsi') ||
          profile.email?.toLowerCase().includes('rsprolipsi') ||
          authUser.email?.toLowerCase().includes('rsprolipsi');

        let finalSlug = isMasterAccount ? 'rsprolipsi' : (profile.slug || profile.id_consultor || profile.username || profile.consultant_id || 'rsprolipsi');
        let finalName = isMasterAccount ? 'RS PRÓLIPSI' : (profile.nome_completo || user.name);

        let rawAvatar = profile.avatar_url || user.avatarUrl;
        if (!rawAvatar || BANNED_PATTERNS.some(p => rawAvatar?.includes(p))) rawAvatar = branding.logo;
        let finalAvatar = rawAvatar;

        // Sempre usar minúsculas para o slug de links
        finalSlug = finalSlug.toLowerCase();

        // Fallback global para qualquer usuário sem foto ou foto proibida
        if (!finalAvatar || finalAvatar === '' || BANNED_PATTERNS.some(p => finalAvatar?.includes(p))) {
          finalAvatar = branding.logo;
        }

        // [RS-SYNC-LINKS] - Geração de links dinâmicos (Environment Aware)
        const currentOrigin = window.location.origin;
        const isLocal = currentOrigin.includes('localhost');
        const marketplaceDomain = isLocal ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';
        const rotaFacilDomain = isLocal ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

        const linkLoja = `${marketplaceDomain}/loja/${finalSlug}`;
        const linkIndicacao = `${rotaFacilDomain}/indicacao/${finalSlug}#/login`;
        const linkCadastro = `${rotaFacilDomain}/indicacao/${finalSlug}#/signup`;

        // [FIX] Atualizar estado local imediatamente
        const fallbackCode = await resolveConsultantNumericCode({
          slug: finalSlug,
          email: profile.email || consultData?.email || user.email,
          name: finalName,
        });
        const numericId = profile.id_numerico || consultData?.id_numerico || consultData?.codigo_consultor || fallbackCode || user.idNumerico;
        const finalLoginId = finalSlug || consultData?.username || consultData?.mmn_id || user.loginId;
        const updatedData = {
          name: finalName,
          cpfCnpj: formatCpfCnpj(profile.cpf || (profile as any).cpf_cnpj || consultData?.cpf || consultData?.cpf_cnpj) || user.cpfCnpj,
          whatsapp: profile.telefone || consultData?.whatsapp || consultData?.telefone || user.whatsapp,
          avatarUrl: finalAvatar,
          coverUrl: profile.cover_url || '',
          idConsultor: finalSlug,
          idNumerico: numericId,
          code: numericId ? String(numericId) : (fallbackCode || user.code),
          loginId: finalLoginId,
          patrocinador_id: consultData?.patrocinador_id || (profile as any).sponsor_id || (profile as any).patrocinador_id || user.patrocinador_id,
          linkIndicacao,
          linkLoja,
          linkCadastro,
          address: {
            zipCode: profile.endereco_cep || consultData?.cep || user.address.zipCode,
            street: profile.endereco_rua || consultData?.endereco || user.address.street,
            number: profile.endereco_numero || consultData?.numero || user.address.number,
            neighborhood: profile.endereco_bairro || consultData?.bairro || user.address.neighborhood,
            city: profile.endereco_cidade || consultData?.cidade || user.address.city,
            state: profile.endereco_estado || consultData?.estado || user.address.state,
          },
          bankAccount: {
            bank: (profile as any).banco_nome || user.bankAccount.bank,
            agency: (profile as any).banco_agencia || user.bankAccount.agency,
            accountNumber: (profile as any).banco_conta || user.bankAccount.accountNumber,
            accountType: ((profile as any).banco_tipo as 'checking' | 'savings') || user.bankAccount.accountType,
            pixKey: (profile as any).banco_pix || user.bankAccount.pixKey,
            pixKeyType: inferPixKeyType((profile as any).banco_pix || user.bankAccount.pixKey),
          }
        };

        updateUser(updatedData); // Atualiza contexto visual
        return updatedData;
      }

      console.warn("[Sync] Perfil não encontrado em user_profiles.");
      return null;
    } catch (err) {
      console.error("[Sync] Erro na sincronia:", err);
      return null;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Logout] Error signing out from Supabase:', err);
    } finally {
      localStorage.removeItem('consultorToken');
      setIsAuthenticated(false);
    }
  };

  // Fetch user from Supabase and handle session
  React.useEffect(() => {
    const hydrateUserFromBridgeToken = async (rawToken: string) => {
      const { accessToken } = normalizeConsultorAccessToken(rawToken);
      if (!accessToken) return false;

      try {
        const authApi = supabase.auth as any;
        const response = await authApi.getUser(accessToken);
        const bridgeUser = response?.data?.user;

        if (!bridgeUser) {
          return false;
        }

        localStorage.setItem('consultorToken', accessToken);
        setIsAuthenticated(true);
        await checkSessionAndFetchUser({
          user: bridgeUser,
          access_token: accessToken
        });

        if (typeof window !== 'undefined' && window.location.hash.includes('/sso')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        return true;
      } catch (error) {
        console.error('[App] Consultor SSO failed:', error);
        localStorage.removeItem('consultorToken');
        return false;
      }
    };

    const initializeAuth = async () => {
      const bridgeToken = extractConsultorBridgeToken();
      if (bridgeToken) {
        const hydrated = await hydrateUserFromBridgeToken(bridgeToken);
        if (hydrated) {
          return;
        }
      }

      await checkSessionAndFetchUser();
    };

    initializeAuth();
  }, [checkSessionAndFetchUser]);

  // Fetch dynamic SIGME config to populate PIN logos
  React.useEffect(() => {
    const fetchSigmaConfig = async () => {
      const response = await sigmaApi.getConfig();
      if (response.success && response.data) {
        const pins = response.data.career.pins;
        const newLogos: Record<string, string> = {};
        pins.forEach(p => {
          if (p.imageUrl) {
            newLogos[p.name] = p.imageUrl;
          }
        });

        setDashboardConfig(prev => ({
          ...prev,
          pinLogos: { ...prev.pinLogos, ...newLogos }
        }));
      }
    };

    fetchSigmaConfig();
  }, []);

  // [SÊNIOR] Fetch Dynamic Dashboard Layout from API
  React.useEffect(() => {
    const fetchLayoutConfig = async () => {
      try {
        const response = await dashboardApi.getConsultantLayout();
        if (response.success && response.data?.config) {
          const cfg = response.data.config;
          setDashboardConfig(prev => ({
            ...prev,
            userInfo: Array.isArray(cfg.userInfo) ? cfg.userInfo : prev.userInfo,
            links: Array.isArray(cfg.links) ? cfg.links : prev.links,
            promoBanners: Array.isArray(cfg.promoBanners) ? cfg.promoBanners : prev.promoBanners,
            bonusCards: Array.isArray(cfg.bonusCards) ? cfg.bonusCards : prev.bonusCards,
          }));
        }
      } catch (error) {
        console.error("[App] Failed to fetch remote dashboard layout:", error);
      }
    };

    if (isAuthenticated) {
      fetchLayoutConfig();
    }
  }, [isAuthenticated]);

  // [RS-BRANDING] - Fetch Global Branding Configs
  React.useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await dashboardApi.getGeneralSettings();
        if (response.success && response.data) {
          const { logo, favicon, companyName } = response.data;
          setBranding({
            logo: logo || DEFAULT_LOGO_RS,
            favicon: favicon || '/favicon.ico',
            companyName: companyName || 'RSPrólipsi'
          });

          // Update favicon dynamically
          if (favicon) {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (link) link.href = favicon;
          }
        }
      } catch (error) {
        console.error("[App] Failed to fetch branding settings:", error);
      }
    };
    // Listen for cross-tab branding updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rs-branding-update') fetchBranding();
    };
    window.addEventListener('storage', handleStorageChange);

    fetchBranding();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser, messages, markMessageAsRead, onSyncProfile, credits, setCredits, isAuthenticated, login, logout }}>
      <DashboardConfigContext.Provider value={{ config: dashboardConfig, setConfig: setDashboardConfig }}>
        <LayoutContext.Provider value={{ layoutMode, setLayoutMode }}>
          <BrandingContext.Provider value={branding}>
            {children}
          </BrandingContext.Provider>
        </LayoutContext.Provider>
      </DashboardConfigContext.Provider>
    </UserContext.Provider>
  );
};


const App: React.FC = () => {
  return (
    <ContextProviders>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/consultant" element={<ProtectedRoute><ConsultantLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="studio" element={<Studio />} />

          {/* SIGME Routes */}
          <Route path="sigme/ciclo-global" element={<CicloGlobal />} />
          <Route path="sigme/matriz-sigma" element={<MatrizSigma />} />
          <Route path="sigme/bonus-profundidade" element={<BonusProfundidade />} />
          <Route path="sigme/bonus-fidelidade" element={<BonusFidelidade />} />
          <Route path="sigme/arvore-interativa/:type" element={<ArvoreInterativaPage />} />
          <Route path="sigme/arvore-interativa/:type/:matrixId" element={<ArvoreInterativaPage />} />
          <Route path="sigme/arvore-interativa/directs" element={<ArvoreInterativaPage />} />
          <Route path="sigme/plano-carreira" element={<PlanoCarreira />} />
          <Route path="sigme/plano-carreira-digital" element={<PlanoCarreiraDigital />} />
          <Route path="sigme/top-sigme" element={<TopSigme />} />
          <Route path="sigme/relatorios-rede" element={<RelatoriosRede />} />

          {/* RS Shop Routes */}
          <Route path="shop" element={<ShopLayout />}>
            <Route index element={<Navigate to="marketplace" replace />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="centro-distribuicao" element={<CentroDistribuicao />} />
            <Route path="dropshipping" element={<Dropshipping />} />
            <Route path="links-afiliado" element={<LinksAfiliado />} />
            <Route path="pixels-marketing" element={<PixelsMarketing />} />
            <Route path="encurtador-link" element={<EncurtadorLink />} />
            <Route path="meus-dados" element={<MeusDados />} />
          </Route>

          {/* Wallet Routes */}
          <Route path="wallet" element={<WalletLayout />}>
            <Route index element={<Navigate to="saldo-extrato" replace />} />
            <Route path="saldo-extrato" element={<SaldoExtrato />} />
            <Route path="cobrancas" element={<Cobrancas />} />
            <Route path="assinaturas" element={<Assinaturas />} />
            <Route path="transferir" element={<Transferir />} />
            <Route path="saque" element={<Saque />} />
            <Route path="relatorios" element={<RelatoriosFinanceiros />} />
            <Route path="configuracoes" element={<ConfiguracoesFinanceiras />} />
          </Route>

          <Route path="comunicacao" element={<Comunicacao />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard-editor" replace />} />
          <Route path="personal-data" element={<AdminPersonalData />} />
          <Route path="dashboard-editor" element={<DashboardEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/consultant/dashboard" replace />} />
      </Routes>
    </ContextProviders>
  );
};

export default App;
