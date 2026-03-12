import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AdminLogin } from './components/AdminLogin'; // Fix: Moved to top
import { Editor } from './components/Editor';
import { Renderer } from './components/Renderer';
import { LandingPage } from './components/LandingPage';
import { Signup } from './components/Signup';
import { Login } from './components/Login';
import { INITIAL_SITES, INITIAL_USER, PLANS, RS_THEME_DARK, RS_THEME_LIGHT } from './constants';
import { BioSite, ViewMode, UserProfile, UserPlan, AgencyClient, ClientPayment, SystemLog, Agency, PlanDefinition, MiniSiteTemplate } from './types';
import { supabase } from './supabaseClient';
import { brandingApi } from './brandingApi';
import { MINISITE_TEMPLATE_LIBRARY, cloneTemplateSections } from './data/templates';

if (typeof window !== 'undefined') {
  console.log("[App.tsx] Global initialization...");
}

const DEFAULT_BRANDING = {
  logo: '/logo-rs.png',
  favicon: '/logo-rs.png',
  companyName: 'RS Prólipsi'
};

const normalizeBranding = (data: any) => ({
  logo: data?.logo || data?.avatar || DEFAULT_BRANDING.logo,
  favicon: data?.favicon || data?.logo || data?.avatar || DEFAULT_BRANDING.favicon,
  companyName: data?.companyName || data?.platformName || DEFAULT_BRANDING.companyName
});

const formatCpfCnpj = (value?: string | null) => {
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

const buildConsultorReferralLink = (consultantSlug?: string | null) => {
  if (!consultantSlug) return '';

  const normalizedSlug = String(consultantSlug).trim().toLowerCase();
  if (!normalizedSlug) return '';

  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    return `http://localhost:3002/indicacao/${normalizedSlug}`;
  }

  return `https://rotafacil.rsprolipsi.com.br/indicacao/${normalizedSlug}`;
};

const normalizeConsultantSlug = (value?: string | null) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');

const deriveConsultantSlug = (preferredValue?: string | null, email?: string | null, userId?: string | null) => {
  const preferredSlug = normalizeConsultantSlug(preferredValue);
  if (preferredSlug) return preferredSlug;

  const emailSlug = normalizeConsultantSlug(String(email || '').split('@')[0]);
  if (emailSlug) return emailSlug;

  return normalizeConsultantSlug(String(userId || '').slice(0, 8)) || 'consultor-rs';
};

const slugifyMiniSiteValue = (value?: string | null) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

const MINISITE_SSO_TOKEN_KEY = 'rs-minisite-sso-token';
const DEFAULT_MINISITE_SPONSOR_REF = 'rsprolipsi';
const MINISITE_CACHE_PREFIX = 'rs-minisite-cache';

const buildMiniSiteCacheKey = (scope: string, userId?: string | null) =>
  `${MINISITE_CACHE_PREFIX}:${scope}:${String(userId || 'anonymous')}`;

const readMiniSiteCache = <T,>(scope: string, userId: string | null | undefined, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(buildMiniSiteCacheKey(scope, userId));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`[App] Failed to read MiniSite cache for ${scope}:`, error);
    return fallback;
  }
};

const writeMiniSiteCache = (scope: string, userId: string | null | undefined, value: unknown) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(buildMiniSiteCacheKey(scope, userId), JSON.stringify(value));
  } catch (error) {
    console.warn(`[App] Failed to persist MiniSite cache for ${scope}:`, error);
  }
};

const isMissingMiniSiteTableError = (error: any, table: string) => {
  const message = String(error?.message || '');
  const details = String(error?.details || '');

  return (
    message.includes(`public.${table}`) ||
    details.includes(`public.${table}`) ||
    message.includes(`table '${table}'`) ||
    error?.code === 'PGRST205'
  );
};

const mapSiteRecordToBioSite = (site: any): BioSite => ({
  id: site.id,
  userId: site.user_id || site.userId,
  clientId: site.client_id || site.clientId,
  slug: site.slug,
  name: site.name,
  plan: site.plan || 'free',
  sections: Array.isArray(site.sections) ? site.sections : [],
  theme: site.theme || RS_THEME_DARK,
  isPublished: Boolean(site.is_published ?? site.isPublished),
  views: Number(site.views || 0),
  seo: site.seo || { title: '', description: '', image: '' },
  tracking: site.tracking
});

const mapClientRecord = (client: any): AgencyClient => ({
  id: client.id,
  agencyId: client.agency_id || client.agencyId || '',
  name: client.name || '',
  email: client.email || '',
  createdAt: new Date(client.created_at || client.createdAt || Date.now()),
  updatedAt: client.updated_at || client.updatedAt
    ? new Date(client.updated_at || client.updatedAt)
    : undefined,
  cpf: client.cpf || '',
  phone: client.phone || '',
  birthDate: client.birth_date || client.birthDate || '',
  address: {
    line: client.address?.line || client.address_line || '',
    number: client.address?.number || client.address_number || '',
    city: client.address?.city || client.address_city || '',
    state: client.address?.state || client.address_state || '',
    zip: client.address?.zip || client.address_zip || ''
  },
  notes: client.notes || '',
  status: client.status || 'active',
  monthlyFee: Number(client.monthly_fee ?? client.monthlyFee ?? 0)
});

const mapPaymentRecord = (payment: any): ClientPayment => ({
  id: payment.id,
  clientId: payment.client_id || payment.clientId || '',
  amount: Number(payment.amount || 0),
  date: new Date(payment.date || payment.created_at || Date.now()),
  dueDate: new Date(payment.due_date || payment.dueDate || payment.date || Date.now()),
  status: payment.status || 'paid',
  method: payment.method || 'pix',
  notes: payment.notes || ''
});

const mapLogRecord = (log: any): SystemLog => ({
  id: log.id || Math.random().toString(36).slice(2),
  actorName: log.actor_name || log.actorName || '',
  actorEmail: log.actor_email || log.actorEmail || '',
  action: log.action || '',
  target: log.target || '',
  timestamp: new Date(log.timestamp || Date.now())
});

const mapTemplateRecord = (template: any): MiniSiteTemplate => ({
  id: template.id,
  name: template.name,
  niche: template.niche || 'Template RS',
  category: template.category || 'Biblioteca',
  description: template.description || '',
  sections: Array.isArray(template.sections) ? template.sections : [],
  theme: template.theme || RS_THEME_DARK,
  seo: template.seo || { title: template.name || 'Template RS', description: '', image: '' },
  plan: template.plan || 'free',
  previewText: template.preview_text || '',
  previewAccent: template.preview_accent || template.theme?.primaryColor || '#D4AF37',
  ownerUserId: template.owner_user_id || null,
  isPublic: Boolean(template.is_public),
  isCompanyLibrary: Boolean(template.is_company_library),
  source: 'community',
  createdAt: template.created_at || undefined
});

type MiniSiteBridgePayload = {
  token?: string;
  accessToken?: string;
  userId?: string;
  uid?: string;
  userEmail?: string;
  email?: string;
  source?: string;
  autoLogin?: boolean;
};

const parseMiniSiteBridgePayload = (value: string): MiniSiteBridgePayload | null => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as MiniSiteBridgePayload : null;
  } catch {
    try {
      const decoded = decodeURIComponent(escape(atob(value)));
      const parsed = JSON.parse(decoded);
      return parsed && typeof parsed === 'object' ? parsed as MiniSiteBridgePayload : null;
    } catch {
      return null;
    }
  }
};

const extractMiniSiteBridgeToken = () => {
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

const normalizeMiniSiteAccessToken = (rawToken: string) => {
  const payload = parseMiniSiteBridgePayload(rawToken);
  const accessToken = String(payload?.accessToken || payload?.token || rawToken || '').trim();
  return { payload, accessToken };
};

type MiniSiteSignupContext = {
  sponsorRef: string;
  sponsorSource: 'default' | 'referral';
  initialView: ViewMode;
};

const readMiniSiteHashRoute = () => {
  if (typeof window === 'undefined') {
    return {
      hashPath: '',
      hashParams: new URLSearchParams()
    };
  }

  const rawHash = window.location.hash || '';
  const normalizedHash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
  const [hashPath = '', hashQuery = ''] = normalizedHash.split('?');

  return {
    hashPath,
    hashParams: new URLSearchParams(hashQuery)
  };
};

const extractRouteSponsorRef = (path?: string | null) => {
  const match = String(path || '').match(/\/indicacao\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : '';
};

const resolveMiniSiteSignupContext = (): MiniSiteSignupContext => {
  if (typeof window === 'undefined') {
    return {
      sponsorRef: DEFAULT_MINISITE_SPONSOR_REF,
      sponsorSource: 'default',
      initialView: 'landing'
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const { hashPath, hashParams } = readMiniSiteHashRoute();

  const routeSponsorRef =
    extractRouteSponsorRef(window.location.pathname) ||
    extractRouteSponsorRef(hashPath);

  const querySponsorRef =
    searchParams.get('ref') ||
    searchParams.get('sponsor') ||
    searchParams.get('indicacao') ||
    hashParams.get('ref') ||
    hashParams.get('sponsor') ||
    hashParams.get('indicacao') ||
    '';

  const normalizedSponsorRef =
    normalizeConsultantSlug(routeSponsorRef || querySponsorRef || DEFAULT_MINISITE_SPONSOR_REF) ||
    DEFAULT_MINISITE_SPONSOR_REF;

  const shouldOpenSignup =
    searchParams.get('signup') === '1' ||
    hashParams.get('signup') === '1' ||
    /\/(signup|cadastro)(\/|$)/i.test(window.location.pathname) ||
    /\/(signup|cadastro)(\/|$)/i.test(hashPath) ||
    Boolean(routeSponsorRef || querySponsorRef);

  return {
    sponsorRef: normalizedSponsorRef,
    sponsorSource: routeSponsorRef || querySponsorRef ? 'referral' : 'default',
    initialView: shouldOpenSignup ? 'signup' : 'landing'
  };
};

export default function App() {
  // Debug Alert - Remova após confirmação
  useEffect(() => {
    console.log("[App] Component Mounted. Current View:", currentView);
  }, []);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await brandingApi.getBranding();
        if (res.data) {
          const normalizedBranding = normalizeBranding(res.data);
          setBranding(normalizedBranding);
          if (normalizedBranding.favicon) {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (link) link.href = normalizedBranding.favicon;
          }
        }
      } catch (error) {
        console.error("[App] Failed to fetch branding:", error);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rs-branding-update') fetchBranding();
    };
    window.addEventListener('storage', handleStorageChange);
    fetchBranding();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const signupContext = React.useMemo(() => resolveMiniSiteSignupContext(), []);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [sites, setSites] = useState<BioSite[]>(INITIAL_SITES);
  const [clients, setClients] = useState<AgencyClient[]>([]); // State for Agency Clients
  const [payments, setPayments] = useState<ClientPayment[]>([]); // State for Payments
  const [logs, setLogs] = useState<SystemLog[]>([]); // State for System Logs
  const [sharedTemplates, setSharedTemplates] = useState<MiniSiteTemplate[]>([]);
  const storageFallbackRef = React.useRef({
    sites: false,
    clients: false,
    payments: false,
    logs: false
  });

  // -- NEW: Dynamic Ecosystem State --
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [plans, setPlans] = useState<Record<string, PlanDefinition>>(PLANS);
  const [globalSettings, setGlobalSettings] = useState({
    pixKey: '',
    supportEmail: '',
    platformName: 'RS MiniSite',
    mpPublicKey: '',
    mpAccessToken: ''
  });

  const [currentView, setCurrentView] = useState<ViewMode>(signupContext.initialView);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);

  const readCachedSites = () => readMiniSiteCache<any[]>('sites', user.id, []).map(mapSiteRecordToBioSite);
  const writeCachedSites = (nextSites: BioSite[]) => writeMiniSiteCache('sites', user.id, nextSites);
  const readCachedClients = () => readMiniSiteCache<any[]>('clients', user.id, []).map(mapClientRecord);
  const writeCachedClients = (nextClients: AgencyClient[]) => writeMiniSiteCache('clients', user.id, nextClients);
  const readCachedPayments = () => readMiniSiteCache<any[]>('payments', user.id, []).map(mapPaymentRecord);
  const writeCachedPayments = (nextPayments: ClientPayment[]) => writeMiniSiteCache('payments', user.id, nextPayments);
  const readCachedLogs = () => readMiniSiteCache<any[]>('logs', user.id, []).map(mapLogRecord);
  const writeCachedLogs = (nextLogs: SystemLog[]) => writeMiniSiteCache('logs', user.id, nextLogs);

  // Initialize state from localStorage or default to true (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('rs-theme-preference');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const resolveConsultorSyncData = async (authUser: { id: string; email?: string | null }, fallbackUser?: Partial<UserProfile>) => {
    const safeFallback = fallbackUser || {};

    const { data: minisiteProfile } = await supabase
      .from('minisite_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    let consultor: any = null;
    const consultorLookups = [
      authUser.id ? { column: 'user_id', value: authUser.id } : null,
      authUser.id ? { column: 'id', value: authUser.id } : null,
      authUser.email ? { column: 'email', value: authUser.email } : null,
      userProfile?.slug ? { column: 'username', value: userProfile.slug } : null,
      userProfile?.id_consultor ? { column: 'mmn_id', value: userProfile.id_consultor } : null,
      minisiteProfile?.consultant_id ? { column: 'username', value: minisiteProfile.consultant_id } : null
    ].filter(Boolean) as Array<{ column: string; value: string }>;

    for (const lookup of consultorLookups) {
      const { data } = await supabase
        .from('consultores')
        .select('*')
        .eq(lookup.column, lookup.value)
        .limit(1)
        .maybeSingle();

      if (data) {
        consultor = data;
        break;
      }
    }

    const consultantSlugRaw =
      userProfile?.slug ||
      userProfile?.id_consultor ||
      userProfile?.consultant_id ||
      minisiteProfile?.consultant_id ||
      consultor?.username ||
      consultor?.mmn_id ||
      safeFallback.consultantId ||
      '';

    const consultantSlug = String(consultantSlugRaw || '').trim().toLowerCase();
    const referralLink =
      buildConsultorReferralLink(consultantSlug) ||
      minisiteProfile?.referral_link ||
      safeFallback.referralLink ||
      '';

    return {
      name:
        minisiteProfile?.name ||
        userProfile?.nome_completo ||
        consultor?.nome ||
        safeFallback.name ||
        'Usuário',
      cpf: formatCpfCnpj(
        minisiteProfile?.cpf ||
        userProfile?.cpf ||
        userProfile?.cpf_cnpj ||
        consultor?.cpf ||
        safeFallback.cpf
      ),
      phone:
        minisiteProfile?.phone ||
        userProfile?.telefone ||
        userProfile?.phone ||
        consultor?.telefone ||
        consultor?.whatsapp ||
        safeFallback.phone ||
        '',
      avatarUrl:
        minisiteProfile?.avatar_url ||
        userProfile?.avatar_url ||
        safeFallback.avatarUrl ||
        '',
      consultantId: consultantSlug || safeFallback.consultantId || '',
      idNumerico:
        userProfile?.id_numerico ||
        consultor?.id_numerico ||
        consultor?.codigo_consultor ||
        safeFallback.idNumerico ||
        1,
      referralLink,
      address: {
        street:
          minisiteProfile?.address_street ||
          userProfile?.endereco_rua ||
          userProfile?.address_street ||
          consultor?.endereco ||
          safeFallback.address?.street ||
          '',
        number:
          minisiteProfile?.address_number ||
          userProfile?.endereco_numero ||
          consultor?.numero ||
          safeFallback.address?.number ||
          '',
        neighborhood:
          minisiteProfile?.address_neighborhood ||
          userProfile?.endereco_bairro ||
          userProfile?.address_neighborhood ||
          consultor?.bairro ||
          safeFallback.address?.neighborhood ||
          '',
        city:
          minisiteProfile?.address_city ||
          userProfile?.endereco_cidade ||
          userProfile?.address_city ||
          consultor?.cidade ||
          safeFallback.address?.city ||
          '',
        state:
          minisiteProfile?.address_state ||
          userProfile?.endereco_estado ||
          userProfile?.address_state ||
          consultor?.estado ||
          safeFallback.address?.state ||
          '',
        zip:
          minisiteProfile?.address_zip ||
          userProfile?.endereco_cep ||
          userProfile?.address_zip ||
          consultor?.cep ||
          safeFallback.address?.zip ||
          ''
      }
    } satisfies Partial<UserProfile>;
  };

  const ensureUnifiedAccessRecords = async (
    authUser: { id: string; email?: string | null },
    profile: Partial<UserProfile>
  ) => {
    const consultantSlug = deriveConsultantSlug(profile.consultantId, authUser.email, authUser.id);
    const referralLink = profile.referralLink || buildConsultorReferralLink(consultantSlug);
    const now = new Date().toISOString();
    const { data: existingMiniSiteProfile } = await supabase
      .from('minisite_profiles')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle();

    const minisitePayload: Record<string, any> = {
      id: authUser.id,
      updated_at: now,
    };

    if (profile.name) minisitePayload.name = profile.name;
    if (authUser.email) minisitePayload.email = authUser.email;
    if (profile.cpf) minisitePayload.cpf = profile.cpf;
    if (profile.phone) minisitePayload.phone = profile.phone;
    if (profile.avatarUrl) minisitePayload.avatar_url = profile.avatarUrl;
    if (consultantSlug) minisitePayload.consultant_id = consultantSlug;
    if (referralLink) minisitePayload.referral_link = referralLink;
    if (profile.address?.street) minisitePayload.address_street = profile.address.street;
    if (profile.address?.number) minisitePayload.address_number = profile.address.number;
    if (profile.address?.neighborhood) minisitePayload.address_neighborhood = profile.address.neighborhood;
    if (profile.address?.city) minisitePayload.address_city = profile.address.city;
    if (profile.address?.state) minisitePayload.address_state = profile.address.state;
    if (profile.address?.zip) minisitePayload.address_zip = profile.address.zip;
    if (!existingMiniSiteProfile) minisitePayload.plan = 'free';

    const { error: minisiteProfileError } = await supabase
      .from('minisite_profiles')
      .upsert(minisitePayload, { onConflict: 'id' });

    if (minisiteProfileError) {
      console.warn('[App] Falha ao garantir minisite_profiles:', minisiteProfileError);
    }

    const userProfilePayload: Record<string, any> = {
      user_id: authUser.id,
      updated_at: now,
    };

    if (profile.name) userProfilePayload.nome_completo = profile.name;
    if (authUser.email) userProfilePayload.email = authUser.email;
    if (profile.cpf) userProfilePayload.cpf = profile.cpf;
    if (profile.phone) userProfilePayload.telefone = profile.phone;
    if (profile.avatarUrl) userProfilePayload.avatar_url = profile.avatarUrl;
    if (profile.address?.street) userProfilePayload.endereco_rua = profile.address.street;
    if (profile.address?.number) userProfilePayload.endereco_numero = profile.address.number;
    if (profile.address?.neighborhood) userProfilePayload.endereco_bairro = profile.address.neighborhood;
    if (profile.address?.city) userProfilePayload.endereco_cidade = profile.address.city;
    if (profile.address?.state) userProfilePayload.endereco_estado = profile.address.state;
    if (profile.address?.zip) userProfilePayload.endereco_cep = profile.address.zip;

    const { error: userProfileError } = await supabase
      .from('user_profiles')
      .upsert(userProfilePayload, { onConflict: 'user_id' });

    if (userProfileError) {
      console.warn('[App] Falha ao garantir user_profiles:', userProfileError);
    }

    const consultorLookups = [
      authUser.id ? { column: 'user_id', value: authUser.id } : null,
      authUser.id ? { column: 'id', value: authUser.id } : null,
      authUser.email ? { column: 'email', value: authUser.email } : null,
      consultantSlug ? { column: 'username', value: consultantSlug } : null
    ].filter(Boolean) as Array<{ column: string; value: string }>;

    let consultor: any = null;
    for (const lookup of consultorLookups) {
      const { data } = await supabase
        .from('consultores')
        .select('id')
        .eq(lookup.column, lookup.value)
        .limit(1)
        .maybeSingle();

      if (data) {
        consultor = data;
        break;
      }
    }

    const consultorPayload: Record<string, any> = {};
    if (profile.name) consultorPayload.nome = profile.name;
    if (authUser.email) consultorPayload.email = authUser.email;
    if (profile.cpf) consultorPayload.cpf = profile.cpf;
    if (profile.phone) {
      consultorPayload.telefone = profile.phone;
      consultorPayload.whatsapp = profile.phone;
    }
    if (profile.address?.zip) consultorPayload.cep = profile.address.zip;
    if (profile.address?.street) consultorPayload.endereco = profile.address.street;
    if (profile.address?.number) consultorPayload.numero = profile.address.number;
    if (profile.address?.neighborhood) consultorPayload.bairro = profile.address.neighborhood;
    if (profile.address?.city) consultorPayload.cidade = profile.address.city;
    if (profile.address?.state) consultorPayload.estado = profile.address.state;
    if (consultantSlug) consultorPayload.username = consultantSlug;

    if (consultor?.id) {
      const { error: consultorUpdateError } = await supabase
        .from('consultores')
        .update(consultorPayload)
        .eq('id', consultor.id);

      if (consultorUpdateError) {
        console.warn('[App] Falha ao atualizar consultores:', consultorUpdateError);
      }
    } else {
      const { error: consultorInsertError } = await supabase
        .from('consultores')
        .insert({
          id: authUser.id,
          user_id: authUser.id,
          status: 'ativo',
          pin_atual: 'Iniciante',
          ...consultorPayload
        });

      if (consultorInsertError) {
        console.warn('[App] Falha ao criar consultores:', consultorInsertError);
      }
    }
  };

  // Helper for Logging
  const handleAddLog = async (action: string, target: string) => {
    const newLog: any = {
      actor_id: user.id === INITIAL_USER.id ? null : user.id,
      actor_name: user.name,
      actor_email: user.email,
      action: action,
      target: target
    };

    if (user.id !== INITIAL_USER.id && !storageFallbackRef.current.logs) {
      const { error } = await supabase.from('minisite_system_logs').insert(newLog);
      if (error && isMissingMiniSiteTableError(error, 'minisite_system_logs')) {
        storageFallbackRef.current.logs = true;
      } else if (error) {
        console.warn('[App] Failed to persist minisite_system_logs:', error);
      }
    }

    setLogs(prev => {
      const nextLogs = [{ ...newLog, id: Math.random().toString(), timestamp: new Date() }, ...prev];
      writeCachedLogs(nextLogs);
      return nextLogs;
    });
  };

  // -- Agency Management Handlers --
  const handleAddAgency = (agencyData: Omit<Agency, 'id' | 'createdAt'>) => {
    const newAgency: Agency = {
      ...agencyData,
      id: Math.random().toString(16).substr(2, 8).toUpperCase(),
      createdAt: new Date()
    };
    setAgencies(prev => [...prev, newAgency]);
    handleAddLog('create_agency', `Criou agência: ${newAgency.name} `);
  };

  const handleUpdateAgency = (updatedAgency: Agency) => {
    setAgencies(prev => prev.map(a => a.id === updatedAgency.id ? updatedAgency : a));
    handleAddLog('update_agency', `Atualizou agência: ${updatedAgency.name} `);
  };

  const handleDeleteAgency = (id: string) => {
    const agency = agencies.find(a => a.id === id);
    if (agency) {
      setAgencies(prev => prev.filter(a => a.id !== id));
      handleAddLog('delete_item', `Removeu agência: ${agency.name} `);
    }
  };


  // Supabase Data Fetching
  useEffect(() => {
    if (user.id && user.id !== INITIAL_USER.id) {
      const isAdmin = user.plan === 'admin_master';
      const loadSites = async () => {
        if (!storageFallbackRef.current.sites) {
          const sitesQuery = isAdmin
            ? supabase.from('minisite_biosites').select('*')
            : supabase.from('minisite_biosites').select('*').eq('user_id', user.id);
          const { data, error } = await sitesQuery;

          if (data && !error) {
            const mappedSites = data.map(mapSiteRecordToBioSite);
            if (mappedSites.length > 0) {
              setSites(mappedSites);
              writeCachedSites(mappedSites);
            } else {
              const cachedSites = readCachedSites();
              setSites(cachedSites);
            }
            return;
          }

          if (error && isMissingMiniSiteTableError(error, 'minisite_biosites')) {
            storageFallbackRef.current.sites = true;
          } else if (error) {
            console.warn('[App] Failed to fetch minisite_biosites:', error);
          }
        }

        setSites(readCachedSites());
      };

      const loadClients = async () => {
        if (!storageFallbackRef.current.clients) {
          const clientsQuery = isAdmin
            ? supabase.from('minisite_clients').select('*')
            : supabase.from('minisite_clients').select('*').eq('agency_id', user.id);
          const { data, error } = await clientsQuery;

          if (data && !error) {
            const mappedClients = data.map(mapClientRecord);
            if (mappedClients.length > 0) {
              setClients(mappedClients);
              writeCachedClients(mappedClients);
            } else {
              setClients(readCachedClients());
            }
            return;
          }

          if (error && isMissingMiniSiteTableError(error, 'minisite_clients')) {
            storageFallbackRef.current.clients = true;
          } else if (error) {
            console.warn('[App] Failed to fetch minisite_clients:', error);
          }
        }

        setClients(readCachedClients());
      };

      const loadLogs = async () => {
        if (!storageFallbackRef.current.logs) {
          const { data, error } = await supabase.from('minisite_system_logs')
            .select('*')
            .limit(50)
            .order('timestamp', { ascending: false });

          if (data && !error) {
            const mappedLogs = data.map(mapLogRecord);
            if (mappedLogs.length > 0) {
              setLogs(mappedLogs);
              writeCachedLogs(mappedLogs);
            } else {
              setLogs(readCachedLogs());
            }
            return;
          }

          if (error && isMissingMiniSiteTableError(error, 'minisite_system_logs')) {
            storageFallbackRef.current.logs = true;
          } else if (error) {
            console.warn('[App] Failed to fetch minisite_system_logs:', error);
          }
        }

        setLogs(readCachedLogs());
      };

      const loadTemplates = async () => {
        const templateLibrary = [...MINISITE_TEMPLATE_LIBRARY];

        try {
          const { data, error } = await supabase
            .from('minisite_templates')
            .select('*')
            .order('created_at', { ascending: false });

          if (data && !error) {
            const mappedTemplates = data.map(mapTemplateRecord);
            setSharedTemplates([...templateLibrary, ...mappedTemplates]);
            return;
          }

          if (error && isMissingMiniSiteTableError(error, 'minisite_templates')) {
            setSharedTemplates(templateLibrary);
            return;
          }

          if (error) {
            console.warn('[App] Failed to fetch minisite_templates:', error);
          }
        } catch (error) {
          console.warn('[App] Failed to load template library:', error);
        }

        setSharedTemplates(templateLibrary);
      };

      setPayments(readCachedPayments());
      void loadSites();
      void loadClients();
      void loadLogs();
      void loadTemplates();

      // NEW: Fetch Global Settings & Plans
      supabase.from('minisite_plans').select('*').then(({ data, error }) => {
        if (data && !error && data.length > 0) {
          const mappedPlans: any = {};
          data.forEach(p => {
            mappedPlans[p.id] = {
              id: p.id,
              name: p.name,
              price: p.price,
              features: p.features || [],
              maxPages: p.max_pages,
              maxClients: p.max_clients
            };
          });
          setPlans(prev => ({ ...prev, ...mappedPlans }));
        }
      });

      supabase.from('minisite_setts').select('*').then(({ data, error }) => {
        if (data && data.length > 0 && !error) {
          const settings = data[0];
          setGlobalSettings({
            pixKey: settings.pix_key || '',
            supportEmail: settings.support_email || '',
            platformName: settings.platform_name || 'RS MiniSite',
            mpPublicKey: settings.mp_public_key || '',
            mpAccessToken: settings.mp_access_token || ''
          });
        }
      });

      // NEW: Fetch all profiles if Admin to populate agencies list
      if (isAdmin) {
        supabase.from('minisite_profiles').select('*')
          .then(({ data, error }) => {
            if (data && !error) {
              setAgencies(data.map((p: any) => ({
                id: p.id,
                name: p.name || 'Sem Nome',
                email: p.email || '',
                plan: p.plan || 'free',
                clientsCount: 0, // Calculated dynamically in some views
                revenue: 0,
                status: 'active',
                createdAt: new Date(p.created_at || Date.now())
              })));
            }
          });
      }
    }
  }, [user.id, user.plan]);

  // Supabase Auth Integration
  useEffect(() => {
    let isInitialMount = true;

    const loadUserData = async (session: any) => {
      if (!session?.user) {
        setUser(INITIAL_USER);
        if (currentView !== 'landing' && currentView !== 'login' && currentView !== 'signup' && currentView !== 'admin-login') {
          setCurrentView('landing');
        }
        return;
      }

      if (session?.access_token) {
        localStorage.setItem(MINISITE_SSO_TOKEN_KEY, session.access_token);
      }

      localStorage.setItem('rs-minisite-profile-id', session.user.id);

      console.log("[App] Loading user data for:", session.user.email);

      // [AUTO-PURGE-MOCK-IDS] - Limpa caches antigos de IDs de teste (tipo C000...)
      const savedProfileId = localStorage.getItem('rs-minisite-profile-id');
      if (savedProfileId?.startsWith('C000')) {
        console.warn("[Purge] Mock ID identificado. Limpando cache...");
        localStorage.removeItem('rs-minisite-profile-id');
      }

      let mappedUser: UserProfile = {
        id: session.user.id,
        name: session.user.user_metadata.full_name || 'Usuário',
        email: session.user.email || '',
        plan: 'free',
        referralCode: `RS - ${session.user.id.substr(0, 8).toUpperCase()} `,
        idNumerico: 1 // Default inicial
      };

      try {
        const syncData = await resolveConsultorSyncData({
          id: session.user.id,
          email: session.user.email || ''
        }, mappedUser);

        mappedUser = {
          ...mappedUser,
          ...syncData,
          address: {
            ...mappedUser.address,
            ...syncData.address
          }
        };

        const { data: profileData } = await supabase
          .from('minisite_profiles')
          .select('plan, mercado_pago_public_key, mercado_pago_access_token')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileData) {
          mappedUser = {
            ...mappedUser,
            plan: (profileData.plan as any) || mappedUser.plan,
            mercadoPagoPublicKey: profileData.mercado_pago_public_key || mappedUser.mercadoPagoPublicKey,
            mercadoPagoAccessToken: profileData.mercado_pago_access_token || mappedUser.mercadoPagoAccessToken
          };
        }

        await ensureUnifiedAccessRecords({
          id: session.user.id,
          email: session.user.email || ''
        }, mappedUser);
      } catch (err) {
        console.warn("[App] Profile fetch error (might not exist yet):", err);
      }

      setUser(mappedUser);

      // Auto-navigation from landing/auth pages
      // Use a small timeout or check mount state to avoid navigation loops during state transitions
      if (['landing', 'login', 'signup', 'admin-login'].includes(currentView)) {
        setCurrentView('dashboard');
      }
    };

    const hydrateUserFromBridgeToken = async (rawToken: string) => {
      const { accessToken } = normalizeMiniSiteAccessToken(rawToken);
      if (!accessToken) return false;

      try {
        const authApi = supabase.auth as any;
        const response = await authApi.getUser(accessToken);
        const bridgeUser = response?.data?.user;

        if (!bridgeUser) {
          return false;
        }

        localStorage.setItem(MINISITE_SSO_TOKEN_KEY, accessToken);
        await loadUserData({
          user: bridgeUser,
          access_token: accessToken
        });

        if (typeof window !== 'undefined' && window.location.hash.includes('/sso')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        return true;
      } catch (error) {
        console.error('[App] SSO hydration failed:', error);
        localStorage.removeItem(MINISITE_SSO_TOKEN_KEY);
        return false;
      }
    };

    // Single source of truth for Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[App] Auth Event:", event);
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(MINISITE_SSO_TOKEN_KEY);
      } else if (session?.access_token) {
        localStorage.setItem(MINISITE_SSO_TOKEN_KEY, session.access_token);
      }
      loadUserData(session);
    });

    // Handle initial session check
    const initializeAuth = async () => {
      const bridgeToken = extractMiniSiteBridgeToken();
      if (bridgeToken) {
        const hydrated = await hydrateUserFromBridgeToken(bridgeToken);
        if (hydrated) {
          return;
        }
      }

      const storedToken = localStorage.getItem(MINISITE_SSO_TOKEN_KEY);
      if (storedToken) {
        const hydrated = await hydrateUserFromBridgeToken(storedToken);
        if (hydrated) {
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadUserData(session);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Effect to apply the 'dark' class to the html/body and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rs-theme-preference', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rs-theme-preference', 'false');
    }
  }, [isDarkMode]);

  // -- Plan Management --

  const handleUpdatePlan = (newPlan: UserPlan) => {
    setUser(prev => ({ ...prev, plan: newPlan }));
    // Update all existing sites to reflect the new plan (removes/adds watermark immediately)
    setSites(prev => prev.map(site => ({ ...site, plan: newPlan })));
  };

  // -- Navigation Handlers --

  const toggleTheme = () => {
    setIsDarkMode((prev: boolean) => !prev);

    // If we are editing a site, we also want to toggle the site's theme 
    // to match the user's preference immediately for a better UX.
    if (activeSiteId) {
      const site = sites.find(s => s.id === activeSiteId);
      if (site) {
        const newTheme = !isDarkMode ? RS_THEME_DARK : RS_THEME_LIGHT; // Logic inverted because state hasn't updated yet in closure
        handleSaveSite({ ...site, theme: newTheme });
      }
    }
  };

  const handleAddClient = async (clientData: Omit<AgencyClient, 'id' | 'agencyId' | 'createdAt' | 'updatedAt'> & { agencyId?: string }) => {
    // Check Client Limits if not Admin
    if (user.plan !== 'admin_master') {
      const currentPlanDef = PLANS[user.plan];
      if (clients.length >= currentPlanDef.maxClients) {
        alert(`Limite de clientes do plano ${currentPlanDef.name} atingido(${currentPlanDef.maxClients}).`);
        return;
      }
    }

    const newClient: AgencyClient = {
      ...clientData,
      id: Math.random().toString(16).substr(2, 8).toUpperCase(),
      agencyId: clientData.agencyId || user.id, // Use passed agencyId (for Admin) or logged user
      createdAt: new Date(),
      updatedAt: new Date(),
      status: clientData.status || 'active'
    };

    if (user.id !== INITIAL_USER.id && !storageFallbackRef.current.clients) {
      const { error } = await supabase.from('minisite_clients').insert({
        id: newClient.id,
        agency_id: newClient.agencyId,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        status: newClient.status,
        notes: newClient.notes,
        monthly_fee: newClient.monthlyFee
      });
      if (error) {
        if (isMissingMiniSiteTableError(error, 'minisite_clients')) {
          storageFallbackRef.current.clients = true;
        } else {
          console.error('Error adding client:', error);
        }
      }
    }

    const nextClients = [...clients, newClient];
    setClients(nextClients);
    writeCachedClients(nextClients);

    if (user.plan === 'admin_master') {
      handleAddLog('create_client', `Criou cliente: ${newClient.name} `);
    }
  };

  const handleUpdateClient = async (client: AgencyClient) => {
    if (!storageFallbackRef.current.clients) {
      const { error } = await supabase.from('minisite_clients').update({
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        notes: client.notes,
        monthly_fee: client.monthlyFee,
        updated_at: new Date().toISOString()
      }).eq('id', client.id);

      if (error) {
        if (isMissingMiniSiteTableError(error, 'minisite_clients')) {
          storageFallbackRef.current.clients = true;
        } else {
          console.error('Error updating client:', error);
        }
      }
    }

    setClients(prev => {
      const nextClients = prev.map(c => c.id === client.id ? { ...client, updatedAt: new Date() } : c);
      writeCachedClients(nextClients);
      return nextClients;
    });
    if (user.plan === 'admin_master') {
      handleAddLog('update_client', `Atualizou cliente: ${client.name} `);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      if (!storageFallbackRef.current.clients) {
        const { error } = await supabase.from('minisite_clients').delete().eq('id', id);
        if (error) {
          if (isMissingMiniSiteTableError(error, 'minisite_clients')) {
            storageFallbackRef.current.clients = true;
          } else {
            console.error('Error deleting client:', error);
          }
        }
      }
      setClients(prev => {
        const nextClients = prev.filter(c => c.id !== id);
        writeCachedClients(nextClients);
        return nextClients;
      });
      handleAddLog('delete_item', `Removeu cliente: ${client.name} `);
    }
  };

  const handleAddPayment = async (paymentData: Omit<ClientPayment, 'id'>) => {
    const newPayment: ClientPayment = {
      ...paymentData,
      id: Math.random().toString(16).substr(2, 8).toUpperCase()
    };

    if (user.id !== INITIAL_USER.id && !storageFallbackRef.current.payments) {
      const { error } = await supabase.from('minisite_payments').insert({
        id: newPayment.id,
        client_id: newPayment.clientId,
        amount: newPayment.amount,
        status: newPayment.status,
        method: newPayment.method,
        due_date: newPayment.dueDate?.toISOString(),
        notes: newPayment.notes
      });
      if (error) {
        if (isMissingMiniSiteTableError(error, 'minisite_payments')) {
          storageFallbackRef.current.payments = true;
        } else {
          console.error('Error adding payment:', error);
        }
      }
    }

    setPayments(prev => {
      const nextPayments = [newPayment, ...prev];
      writeCachedPayments(nextPayments);
      return nextPayments;
    });
    if (user.plan === 'admin_master') {
      handleAddLog('add_payment', `Novo pagamento: R$ ${paymentData.amount} `);
    }
  };

  const buildMiniSiteSlug = (baseLabel: string) => {
    const consultantBase = deriveConsultantSlug(user.consultantId, user.email, user.id);
    const labelBase = slugifyMiniSiteValue(baseLabel) || 'template';
    return `${consultantBase}-${labelBase}-${Math.random().toString(36).slice(2, 6)}`;
  };

  const handleCreateNew = (clientId?: string) => {
    // Check Creation Limits (Total Sites for THIS user >= Plan Limit)
    const currentPlanDef = PLANS[user.plan];
    const userSitesCount = sites.filter(s => s.userId === user.id).length;

    if (userSitesCount >= currentPlanDef.maxPages) {
      alert(`Limite do plano ${currentPlanDef.name} atingido(${currentPlanDef.maxPages} sites).Por favor, faça upgrade.`);
      return;
    }

    const newSite: BioSite = {
      id: Math.random().toString(16).substr(2, 8).toUpperCase(),
      userId: user.id, // Always belongs to the logged in user (Agency Owner)
      clientId: clientId, // Linked to a client if provided
      slug: `site - ${Math.random().toString(36).substr(2, 5)} `,
      name: 'Novo MiniSite',
      isPublished: false,
      plan: user.plan,
      views: 0,
      theme: isDarkMode ? RS_THEME_DARK : RS_THEME_LIGHT,
      seo: {
        title: 'Meu Novo Site',
        description: '',
        image: ''
      },
      sections: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Olá, Mundo!',
            subtitle: 'Bem-vindo ao meu novo MiniSite RS.'
          },
          style: { textAlign: 'center' }
        }
      ]
    };

    setSites([...sites, newSite]);
    setActiveSiteId(newSite.id);
    setCurrentView('editor');
  };

  const handleCreateFromTemplate = async (template: MiniSiteTemplate, clientId?: string) => {
    const currentPlanDef = PLANS[user.plan];
    const userSitesCount = sites.filter(s => s.userId === user.id).length;

    if (userSitesCount >= currentPlanDef.maxPages) {
      alert(`Limite do plano ${currentPlanDef.name} atingido(${currentPlanDef.maxPages} sites).Por favor, faca upgrade.`);
      return false;
    }

    const newSite: BioSite = {
      id: Math.random().toString(16).substr(2, 8).toUpperCase(),
      userId: user.id,
      clientId,
      slug: buildMiniSiteSlug(template.name),
      name: template.name,
      isPublished: false,
      plan: user.plan,
      views: 0,
      theme: { ...template.theme },
      seo: {
        ...template.seo,
        title: template.name
      },
      sections: cloneTemplateSections(template.sections)
    };

    const saved = await handleSaveSite(newSite);
    if (saved === false) {
      return false;
    }

    setActiveSiteId(newSite.id);
    setCurrentView('editor');
    return true;
  };

  const handleSaveTemplate = async (siteId: string, templateData: {
    name: string;
    niche: string;
    category: string;
    description: string;
    makePublic: boolean;
  }) => {
    const sourceSite = sites.find(site => site.id === siteId);
    if (!sourceSite) {
      alert('MiniSite nao encontrado para virar template.');
      return false;
    }

    const payload = {
      owner_user_id: user.id,
      name: templateData.name,
      niche: templateData.niche,
      category: templateData.category,
      description: templateData.description,
      sections: sourceSite.sections,
      theme: sourceSite.theme,
      seo: sourceSite.seo,
      plan: sourceSite.plan || user.plan,
      preview_text: `${sourceSite.sections.length} blocos`,
      preview_accent: sourceSite.theme.primaryColor,
      is_public: templateData.makePublic,
      is_company_library: templateData.makePublic
    };

    try {
      const { data, error } = await supabase
        .from('minisite_templates')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        console.error('[App] Failed to save minisite template:', error);
        if (isMissingMiniSiteTableError(error, 'minisite_templates')) {
          alert('A tabela de templates ainda nao existe neste ambiente. A migration do MiniSite precisa ser aplicada.');
        } else {
          alert('Nao foi possivel salvar o template no banco de dados.');
        }
        return false;
      }

      if (data) {
        setSharedTemplates(prev => [mapTemplateRecord(data), ...prev]);
      }

      handleAddLog('save_template', `Salvou template: ${templateData.name}`);
      return true;
    } catch (error) {
      console.error('[App] Failed to save template:', error);
      alert('Nao foi possivel salvar o template.');
      return false;
    }
  };

  const handleEditSite = (site: BioSite) => {
    setActiveSiteId(site.id);
    setCurrentView('editor');
  };

  const handleSaveSite = async (updatedSite: BioSite) => {
    // Logic to detect if site was just published
    const oldSite = sites.find(s => s.id === updatedSite.id);
    if (oldSite && !oldSite.isPublished && updatedSite.isPublished) {
      handleAddLog('publish_site', updatedSite.name);
    }

    setSites(prev => {
      const nextSites = prev.some(site => site.id === updatedSite.id)
        ? prev.map(site => site.id === updatedSite.id ? updatedSite : site)
        : [...prev, updatedSite];
      writeCachedSites(nextSites);
      return nextSites;
    });

    if (user.id !== INITIAL_USER.id && !storageFallbackRef.current.sites) {
      const { error } = await supabase.from('minisite_biosites').upsert({
        id: updatedSite.id,
        user_id: updatedSite.userId,
        client_id: updatedSite.clientId,
        slug: updatedSite.slug,
        name: updatedSite.name,
        plan: updatedSite.plan,
        sections: updatedSite.sections,
        theme: updatedSite.theme,
        is_published: updatedSite.isPublished,
        views: updatedSite.views,
        seo: updatedSite.seo,
        tracking: updatedSite.tracking,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) {
        if (isMissingMiniSiteTableError(error, 'minisite_biosites')) {
          storageFallbackRef.current.sites = true;
          console.warn('[App] minisite_biosites ausente. Salvando em cache local.');
        } else {
          console.error('Error saving site:', error);
          alert('Erro ao salvar no banco de dados. O conteúdo foi mantido localmente neste navegador.');
          return false;
        }
      }
    }

    return true;
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!storageFallbackRef.current.sites) {
      const { error } = await supabase.from('minisite_biosites').delete().eq('id', siteId);

      if (error) {
        if (isMissingMiniSiteTableError(error, 'minisite_biosites')) {
          storageFallbackRef.current.sites = true;
        } else {
          console.error('Error deleting site:', error);
          alert('Nao foi possivel excluir o MiniSite no banco de dados.');
          return false;
        }
      }
    }

    setSites(prev => {
      const nextSites = prev.filter(site => site.id !== siteId);
      writeCachedSites(nextSites);
      return nextSites;
    });

    if (activeSiteId === siteId) {
      setActiveSiteId(null);
      setCurrentView('dashboard');
    }

    handleAddLog('delete_site', `Removeu MiniSite: ${siteId}`);
    return true;
  };

  const handleTrackClick = (sectionId: string) => {
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        sections: s.sections.map(sec =>
          sec.id === sectionId
            ? { ...sec, clicks: (sec.clicks || 0) + 1 }
            : sec
        )
      };
    }));
  };

  const handleViewSite = async (slug: string) => {
    // In a real app this would go to a route. 
    // Here we simulate the public view by changing state and finding the site.
    const site = sites.find(s => s.slug === slug);
    if (site) {
      // Increment views in state
      setSites(prev => {
        const nextSites = prev.map(s =>
          s.id === site.id ? { ...s, views: s.views + 1 } : s
        );
        writeCachedSites(nextSites);
        return nextSites;
      });

      // Increment views in Supabase
      if (!storageFallbackRef.current.sites) {
        const rpcResponse = await supabase.rpc('increment_minisite_views', { site_id: site.id });
        if (rpcResponse.error && isMissingMiniSiteTableError(rpcResponse.error, 'minisite_biosites')) {
          storageFallbackRef.current.sites = true;
        }

        if (!storageFallbackRef.current.sites) {
          const { error } = await supabase.from('minisite_biosites').update({ views: site.views + 1 }).eq('id', site.id);
          if (error && isMissingMiniSiteTableError(error, 'minisite_biosites')) {
            storageFallbackRef.current.sites = true;
          }
        }
      }

      setActiveSiteId(site.id);
      setCurrentView('preview');
    }
  };

  const handleBackToDashboard = () => {
    setActiveSiteId(null);
    setCurrentView('dashboard');
  };

  const handleBackToEditor = () => {
    setCurrentView('editor');
  };

  // -- Profile Management --
  const handleUpdateUser = async (updatedData: Partial<UserProfile>) => {
    // 1. Update Local State
    const updatedUser = {
      ...user,
      ...updatedData,
      address: {
        ...user.address,
        ...updatedData.address
      }
    };
    setUser(updatedUser);

    // 2. Persist to Supabase (minisite_profiles)
    if (user.id !== INITIAL_USER.id) {
      const { error } = await supabase.from('minisite_profiles').upsert({
        id: user.id,
        email: updatedUser.email || user.email,
        name: updatedUser.name,
        cpf: updatedUser.cpf,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatarUrl,
        consultant_id: updatedUser.consultantId,
        referral_link: updatedUser.referralLink,
        mercado_pago_public_key: updatedUser.mercadoPagoPublicKey,
        mercado_pago_access_token: updatedUser.mercadoPagoAccessToken,
        address_street: updatedUser.address?.street,
        address_number: updatedUser.address?.number,
        address_neighborhood: updatedUser.address?.neighborhood,
        address_city: updatedUser.address?.city,
        address_state: updatedUser.address?.state,
        address_zip: updatedUser.address?.zip,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) {
        console.error('Error saving profile:', error);
        alert('Erro ao salvar perfil no banco de dados.');
        return false;
      }

      await ensureUnifiedAccessRecords({
        id: user.id,
        email: updatedUser.email || user.email || ''
      }, updatedUser);
    }

    return true;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[App] Logout failed:', error);
    } finally {
      localStorage.removeItem('rs-minisite-profile-id');
      localStorage.removeItem(MINISITE_SSO_TOKEN_KEY);
      setActiveSiteId(null);
      setUser(INITIAL_USER);
      setCurrentView('landing');

      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
      }
    }
  };

  // -- Render Logic --

  // 1. Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onLogin={() => setCurrentView('login')}
        onGetStarted={() => setCurrentView('signup')}
        plans={plans}
        branding={branding}
      />
    );
  }

  // 1.5 Admin Login Page (New)
  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onBack={() => setCurrentView('login')}
        onSuccess={(adminUser) => {
          setUser(adminUser);
          // Admin Master always goes to Dashboard with full privileges
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // 2. Auth Pages
  if (currentView === 'login') {
    return (
      <Login
        onBack={() => setCurrentView('landing')}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setSites(prev => prev.map(s => s.userId === INITIAL_USER.id ? { ...s, userId: loggedUser.id } : s));
          setCurrentView('dashboard');
        }}
        onNavigateToSignup={() => setCurrentView('signup')}
        onNavigateToAdmin={() => setCurrentView('admin-login')}
        branding={branding}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <Signup
        onBack={() => setCurrentView('landing')}
        onSuccess={(newUser) => {
          setUser(newUser);
          setSites(prev => prev.map(s => s.userId === INITIAL_USER.id ? { ...s, userId: newUser.id } : s));
          setCurrentView('dashboard');
        }}
        onNavigateToLogin={() => setCurrentView('login')}
        sponsorRef={signupContext.sponsorRef}
        sponsorSource={signupContext.sponsorSource}
        branding={branding}
      />
    );
  }

  // 3. Editor Mode
  if (currentView === 'editor' && activeSiteId) {
    const activeSite = sites.find(s => s.id === activeSiteId);
    if (activeSite) {
      return (
        <Editor
          site={activeSite}
          onSave={handleSaveSite}
          onBack={handleBackToDashboard}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      );
    }
  }

  // 4. Public Preview Mode (The "Live" Site)
  if (currentView === 'preview' && activeSiteId) {
    const activeSite = sites.find(s => s.id === activeSiteId);
    if (activeSite) {
      return (
        <div className="w-full h-screen relative">
          <Renderer
            sections={activeSite.sections}
            theme={activeSite.theme}
            plan={activeSite.plan}
            tracking={activeSite.tracking}
          />
          <button
            onClick={handleBackToDashboard}
            className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold z-50 opacity-50 hover:opacity-100"
          >
            Voltar ao App
          </button>
        </div>
      );
    }
  }

  // 6. Dashboard (Default authenticated view)
  return (
    <Dashboard
      user={user}
      sites={sites}
      clients={clients}
      payments={payments}
      templates={sharedTemplates}
      onCreateNew={handleCreateNew}
      onCreateFromTemplate={handleCreateFromTemplate}
      onDeleteSite={handleDeleteSite}
      onAddClient={handleAddClient}
      onUpdateClient={handleUpdateClient}
      onAddPayment={handleAddPayment}
      onSaveSiteAsTemplate={handleSaveTemplate}
      onEdit={handleEditSite}
      onView={handleViewSite}
      onUpdatePlan={handleUpdatePlan}
      plans={plans}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      onNavigateToAdmin={() => setCurrentView('admin')}
      onLog={handleAddLog}
      onUpdateUser={handleUpdateUser}
      platformSettings={globalSettings}
      branding={branding}
      onLogout={handleLogout}
      onSyncProfile={async () => {
        try {
          const { data: authData } = await supabase.auth.getUser();
          const authUser = authData?.user;
          if (!authUser) return null;

          return await resolveConsultorSyncData({
            id: authUser.id,
            email: authUser.email || ''
          }, user);
        } catch (err) {
          console.error("Sync Error:", err);
          return null;
        }
      }}
    />
  );
}
