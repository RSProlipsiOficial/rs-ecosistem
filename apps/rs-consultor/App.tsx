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

  const markMessageAsRead = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const checkSessionAndFetchUser = React.useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

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

        // Busca dados legado em consultores (para garantir nome/whatsapp se faltar no profile)
        let consultData = null;
        // Se perfil não existe OU se o nome está vazio/default
        if (!profile || !profile.name || profile.name === 'Carregando...') {
          const { data: c } = await supabase
            .from('consultores')
            .select('*')
            .eq('email', currentUserEmail)
            .maybeSingle();
          consultData = c;
        }

        if (profile || consultData) {
          console.log('[App] Merging User Data:', { profileId: profile?.id, consultorId: consultData?.id });

          setUser(prev => {
            // [RS-UNIFY-LOGIC] - Forçar Identidade Mestre RS Prólipsi
            const isMasterAccount =
              currentUserEmail?.toLowerCase().includes('rsprolipsi') ||
              profile?.slug?.toLowerCase().includes('rsprolipsi') ||
              consultData?.username?.toLowerCase().includes('rsprolipsi');

            const baseName = isMasterAccount ? 'RS PRÓLIPSI' : (profile?.full_name || profile?.name || consultData?.nome || prev.name);
            const baseSlug = isMasterAccount ? 'rsprolipsi' : (profile?.id_consultor || profile?.consultant_id || consultData?.username || consultData?.mmn_id || prev.idConsultor);
            const baseWhatsapp = profile?.phone || profile?.whatsapp || consultData?.whatsapp || consultData?.telefone || prev.whatsapp;
            const baseCover = profile?.cover_url || '';

            // ... (avatar logic kept identical)
            let rawAvatar = profile?.avatar_url || consultData?.foto || prev.avatarUrl;
            if (!rawAvatar || BANNED_PATTERNS.some(p => rawAvatar?.includes(p))) rawAvatar = branding.logo;
            let baseAvatar = isMasterAccount ? branding.logo : rawAvatar;

            // [RS-SYNC-LINKS] - Portas: 3002 (Cadastro), 3003 (Loja)
            const currentOrigin = window.location.origin;
            const isLocal = currentOrigin.includes('localhost');
            const marketplaceDomain = isLocal ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';
            const rotaFacilDomain = isLocal ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

            const linkLoja = marketplaceDomain;
            const linkIndicacao = `${rotaFacilDomain}/indicacao/${baseSlug}`;
            const linkCadastro = `${rotaFacilDomain}/indicacao/${baseSlug}`;

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
              avatarUrl: baseAvatar,
              coverUrl: baseCover,
              linkLoja,
              linkIndicacao,

              // Mapeamento Correto de CPF e Data
              cpfCnpj: profile?.cpf || consultData?.cpf || prev.cpfCnpj,
              birthDate: profile?.birth_date || consultData?.data_nascimento || prev.birthDate,

              // Mapeamento Correto do Objeto Address
              address: {
                zipCode: profile?.address_zip || consultData?.cep || prev.address.zipCode,
                street: profile?.address_street || consultData?.endereco || prev.address.street,
                number: profile?.endereco_numero || prev.address.number, // Mantém prev.address.number se não vier do banco para evitar crash
                neighborhood: profile?.address_neighborhood || consultData?.bairro || prev.address.neighborhood,
                city: profile?.address_city || consultData?.cidade || prev.address.city,
                state: profile?.address_state || consultData?.estado || prev.address.state,
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
  }, []);

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
        let finalAvatar = isMasterAccount ? branding.logo : rawAvatar;

        // Sempre usar minúsculas para o slug de links
        finalSlug = finalSlug.toLowerCase();

        // Fallback global para qualquer usuário sem foto ou foto proibida
        if (!finalAvatar || finalAvatar === '' || BANNED_PATTERNS.some(p => finalAvatar?.includes(p))) {
          finalAvatar = branding.logo;
        }

        // Forçar para master accounts
        if (isMasterAccount) {
          finalAvatar = branding.logo;
        }

        // [RS-SYNC-LINKS] - Geração de links dinâmicos (Environment Aware)
        const currentOrigin = window.location.origin;
        const isLocal = currentOrigin.includes('localhost');
        const marketplaceDomain = isLocal ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';
        const rotaFacilDomain = isLocal ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

        const linkLoja = marketplaceDomain;
        const linkIndicacao = `${rotaFacilDomain}/indicacao/${finalSlug}`;
        const linkCadastro = `${rotaFacilDomain}/indicacao/${finalSlug}`;

        // [FIX] Atualizar estado local imediatamente
        const updatedData = {
          name: finalName,
          cpfCnpj: formatCpfCnpj(profile.cpf) || user.cpfCnpj,
          whatsapp: profile.telefone || user.whatsapp,
          avatarUrl: finalAvatar,
          coverUrl: profile.cover_url || '',
          idConsultor: finalSlug,
          idNumerico: profile.id_numerico || 1,
          linkIndicacao,
          linkLoja,
          linkCadastro,
          address: {
            zipCode: profile.endereco_cep || user.address.zipCode,
            street: profile.endereco_rua || user.address.street,
            number: profile.endereco_numero || user.address.number,
            neighborhood: profile.endereco_bairro || user.address.neighborhood,
            city: profile.endereco_cidade || user.address.city,
            state: profile.endereco_estado || user.address.state,
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
    checkSessionAndFetchUser();
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