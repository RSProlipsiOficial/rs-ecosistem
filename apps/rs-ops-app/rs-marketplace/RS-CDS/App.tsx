import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Inventory from './components/Inventory';
import GeminiAdvisor from './components/GeminiAdvisor';
import Financial from './components/Financial';
import Settings from './components/Settings';
import SalesHistory from './components/SalesHistory';
import ReplenishmentOrders from './components/ReplenishmentOrders';
import { ViewState, SettingsData, CDProfile, Order, Product, Transaction } from './types';
import { dataService } from './services/dataService';
import { Bell, User, Menu, ArrowLeft, Home, RefreshCw } from 'lucide-react';

interface RSCDAppProps {
  cdId?: string;
  userId?: string;
  onBackToAdmin?: () => void;
  onLogout?: () => void;
}

const CD_CACHE_KEY = 'rs-cds-last-profile';
const CD_SETTINGS_CACHE_KEY = 'rs-cds-last-settings';
const HARDCODED_PRIMARY_CD_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

const readCachedJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
};

const writeCachedJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignora falha de storage
  }
};

const computeWithdrawableBalance = (transactions: Transaction[]): number => {
  return Math.max(0, (transactions || []).reduce((acc, transaction) => {
    const status = String(transaction.status || '').trim().toUpperCase();
    if (status === 'CANCELADO' || status === 'REJEITADO') return acc;

    const amount = Number(transaction.amount || 0);
    const type = String(transaction.type || '').trim().toUpperCase();
    const category = String(transaction.category || '').trim().toUpperCase();

    if (type === 'IN') return acc + amount;
    if (category.includes('SAQUE')) return acc - amount;
    return acc;
  }, 0));
};

function resolveBrandingUrl() {
  const rawBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
  const normalizedBaseUrl = String(rawBaseUrl).replace(/\/+$/, '');

  if (normalizedBaseUrl.endsWith('/api')) {
    return `${normalizedBaseUrl.slice(0, -4)}/v1/admin/settings/general`;
  }

  if (normalizedBaseUrl.endsWith('/v1')) {
    return `${normalizedBaseUrl}/admin/settings/general`;
  }

  return `${normalizedBaseUrl}/v1/admin/settings/general`;
}

const App: React.FC<RSCDAppProps> = ({ cdId: propCdId, userId: propUserId, onBackToAdmin, onLogout }) => {
  const [viewHistory, setViewHistory] = useState<ViewState[]>(['DASHBOARD']);
  const currentView = viewHistory[viewHistory.length - 1];

  const [userProfile, setUserProfile] = useState<CDProfile>({
    id: '',
    name: 'Carregando...',
    type: 'PROPRIO',
    managerName: '',
    avatarUrl: undefined,
    region: '',
    walletBalance: 0,
    activeCustomers: 0,
    monthlyCycles: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appSettings, setAppSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cdRecordId, setCdRecordId] = useState<string>('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // === DYNAMIC FAVICON & TITLE ===
  // Applies the CD's favicon_url and name to the browser tab dynamically
  const [cdBranding, setCdBranding] = useState<{ faviconUrl?: string; logoUrl?: string }>({});

  useEffect(() => {
    const loadCentralBranding = async () => {
      try {
        const response = await fetch(resolveBrandingUrl());
        const payload = await response.json();

        if (!response.ok || !(payload?.success ?? payload?.ok)) {
          return;
        }

        const branding = payload?.data || {};
        const fallbackLogo = branding.logo || branding.avatar || branding.logoUrl || branding.logo_url;
        const fallbackFavicon = branding.favicon || fallbackLogo;

        setCdBranding((prev) => ({
          faviconUrl: prev.faviconUrl || fallbackFavicon || prev.faviconUrl,
          logoUrl: prev.logoUrl || fallbackLogo || prev.logoUrl,
        }));
      } catch {
        // Mantem branding ja carregado do CD quando a API central falhar.
      }
    };

    loadCentralBranding();
  }, []);

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (cdBranding.faviconUrl) {
      link.href = cdBranding.faviconUrl;
    }
  }, [cdBranding.faviconUrl]);

  useEffect(() => {
    if (userProfile.name && userProfile.name !== 'Carregando...') {
      document.title = `${userProfile.name} – RS Prólipsi`;
    }
  }, [userProfile.name]);

  // === LOAD CD DATA AUTOMATICALLY ===
  // Priority: 1) URL param ?cdId=xxx  2) prop cdId  3) First CD from minisite_profiles
  useEffect(() => {
    const cachedProfile = readCachedJson<CDProfile & { address?: any }>(CD_CACHE_KEY);
    const cachedSettings = readCachedJson<SettingsData>(CD_SETTINGS_CACHE_KEY);

    if (cachedProfile?.id) {
      setUserProfile((prev) => ({
        ...prev,
        ...cachedProfile,
      }));
      setCdRecordId(cachedProfile.id);
      setCdBranding({
        faviconUrl: cachedProfile.faviconUrl || undefined,
        logoUrl: cachedProfile.logoUrl || undefined,
      });
    }

    if (cachedSettings) {
      setAppSettings(cachedSettings);
    }
  }, []);

  useEffect(() => {
    const loadCDData = async () => {
      setLoading(true);
      try {
        // 1. Check URL param
        const urlParams = new URLSearchParams(window.location.search);
        const urlCdId = urlParams.get('cdId');
        let targetCdId = urlCdId || propCdId || '';

        // 2. If a logged user exists and no explicit CD was forced, load the CD linked to that user
        if (!targetCdId && propUserId) {
          console.log(`[RS-CDS] Loading CD linked to authenticated user: ${propUserId}`);
          const linkedProfile = await dataService.getCDProfile(propUserId);

          if (linkedProfile) {
            targetCdId = linkedProfile.id;
            setUserProfile(linkedProfile);
            writeCachedJson(CD_CACHE_KEY, linkedProfile);

            if (linkedProfile.faviconUrl || linkedProfile.logoUrl) {
              setCdBranding({
                faviconUrl: linkedProfile.faviconUrl || undefined,
                logoUrl: linkedProfile.logoUrl || undefined,
              });
            }

            const linkedSettings = await dataService.getCDSettingsExt(targetCdId) || {};

            setAppSettings({
              profile: {
                fantasyName: linkedProfile.name || '',
                companyName: linkedProfile.managerName || linkedProfile.name || '',
                document: linkedProfile.document || '',
                email: linkedProfile.email || '',
                phone: linkedProfile.phone || '',
                avatarUrl: linkedProfile.avatarUrl || '',
                faviconUrl: linkedProfile.faviconUrl || '',
                logoUrl: linkedProfile.logoUrl || '',
                address: {
                  cep: linkedProfile.address?.cep || '',
                  street: linkedProfile.address?.street || '',
                  number: linkedProfile.address?.number || '',
                  complement: linkedProfile.address?.complement || '',
                  neighborhood: linkedProfile.address?.neighborhood || '',
                  city: linkedProfile.address?.city || '',
                  state: linkedProfile.address?.state || '',
                }
              },
              bank: linkedSettings.bank || { bankName: '', accountType: 'CORRENTE', agency: '', accountNumber: '', pixKey: '', pixKeyType: 'CPF' },
              paymentGateway: linkedSettings.paymentGateway || { provider: 'MERCADO_PAGO', enabled: false, apiKey: '', apiToken: '', environment: 'SANDBOX' },
              shippingGateway: linkedSettings.shippingGateway || { provider: 'MELHOR_ENVIO', enabled: false, apiToken: '', environment: 'SANDBOX' }
            });
            writeCachedJson(CD_SETTINGS_CACHE_KEY, {
              profile: {
                fantasyName: linkedProfile.name || '',
                companyName: linkedProfile.managerName || linkedProfile.name || '',
                document: linkedProfile.document || '',
                email: linkedProfile.email || '',
                phone: linkedProfile.phone || '',
                avatarUrl: linkedProfile.avatarUrl || '',
                faviconUrl: linkedProfile.faviconUrl || '',
                logoUrl: linkedProfile.logoUrl || '',
                address: {
                  cep: linkedProfile.address?.cep || '',
                  street: linkedProfile.address?.street || '',
                  number: linkedProfile.address?.number || '',
                  complement: linkedProfile.address?.complement || '',
                  neighborhood: linkedProfile.address?.neighborhood || '',
                  city: linkedProfile.address?.city || '',
                  state: linkedProfile.address?.state || '',
                }
              },
              bank: linkedSettings.bank || { bankName: '', accountType: 'CORRENTE', agency: '', accountNumber: '', pixKey: '', pixKeyType: 'CPF' },
              paymentGateway: linkedSettings.paymentGateway || { provider: 'MERCADO_PAGO', enabled: false, apiKey: '', apiToken: '', environment: 'SANDBOX' },
              shippingGateway: linkedSettings.shippingGateway || { provider: 'MELHOR_ENVIO', enabled: false, apiToken: '', environment: 'SANDBOX' }
            });
          }
        }

        // 3. If no specific ID, load the first/primary CD from the database
        if (!targetCdId) {
          console.log('[RS-CDS] No cdId provided, loading primary CD from database...');
          const cd = await dataService.getPrimaryCD();

          if (cd) {
            targetCdId = cd.id;
            console.log(`[RS-CDS] ✅ Primary CD found: ${cd.name} (${cd.id})`);

            // Map directly from minisite_profiles data
            setUserProfile({
              id: cd.id,
              name: cd.name || 'CD Em Configuração',
              type: (cd.type === 'cd' ? 'PROPRIO' : cd.type?.toUpperCase()) || 'PROPRIO',
              managerName: cd.manager_name || cd.name || '',
              avatarUrl: cd.avatar_url || undefined,
              region: cd.address_city ? `${cd.address_city} - ${cd.address_state}` : '',
              walletBalance: parseFloat(cd.wallet_balance || '0'),
              activeCustomers: 0,
              monthlyCycles: 0,
            });
            writeCachedJson(CD_CACHE_KEY, {
              id: cd.id,
              name: cd.name || 'CD Em Configuração',
              type: (cd.type === 'cd' ? 'PROPRIO' : cd.type?.toUpperCase()) || 'PROPRIO',
              managerName: cd.manager_name || cd.name || '',
              avatarUrl: cd.avatar_url || undefined,
              faviconUrl: cd.favicon_url || undefined,
              logoUrl: cd.logo_url || undefined,
              region: cd.address_city ? `${cd.address_city} - ${cd.address_state}` : '',
              walletBalance: parseFloat(cd.wallet_balance || '0'),
              activeCustomers: 0,
              monthlyCycles: 0,
              document: cd.cpf || cd.cnpj || '',
              email: cd.email || '',
              phone: cd.phone || '',
              address: {
                cep: cd.address_zip || '',
                street: cd.address_street || '',
                number: cd.address_number || '',
                complement: cd.address_complement || '',
                neighborhood: cd.address_neighborhood || '',
                city: cd.address_city || '',
                state: cd.address_state || ''
              }
            });

            // Apply dynamic branding (favicon and logo from DB)
            if (cd.favicon_url || cd.logo_url) {
              setCdBranding({ faviconUrl: cd.favicon_url || undefined, logoUrl: cd.logo_url || undefined });
            }

            const cdSettingsExt = await dataService.getCDSettingsExt(targetCdId) || {};

            // Populate Settings form with real CD data (including avatar)
            setAppSettings({
              profile: {
                fantasyName: cd.name || '',
                companyName: cd.manager_name || cd.name || '',
                document: cd.cpf || cd.cnpj || '',
                email: cd.email || '',
                phone: cd.phone || '',
                avatarUrl: cd.avatar_url || '',
                faviconUrl: cd.favicon_url || '',
                logoUrl: cd.logo_url || '',
                address: {
                  cep: cd.address_zip || '',
                  street: cd.address_street || '',
                  number: cd.address_number || '',
                  complement: cd.address_complement || '',
                  neighborhood: cd.address_neighborhood || '',
                  city: cd.address_city || '',
                  state: cd.address_state || ''
                }
              },
              bank: cdSettingsExt.bank || { bankName: '', accountType: 'CORRENTE', agency: '', accountNumber: '', pixKey: cd.pix_key || '', pixKeyType: 'CPF' },
              paymentGateway: cdSettingsExt.paymentGateway || { provider: 'MERCADO_PAGO', enabled: false, apiKey: '', apiToken: '', environment: 'SANDBOX' },
              shippingGateway: cdSettingsExt.shippingGateway || { provider: 'MELHOR_ENVIO', enabled: false, apiToken: '', environment: 'SANDBOX' }
            });
            writeCachedJson(CD_SETTINGS_CACHE_KEY, {
              profile: {
                fantasyName: cd.name || '',
                companyName: cd.manager_name || cd.name || '',
                document: cd.cpf || cd.cnpj || '',
                email: cd.email || '',
                phone: cd.phone || '',
                avatarUrl: cd.avatar_url || '',
                faviconUrl: cd.favicon_url || '',
                logoUrl: cd.logo_url || '',
                address: {
                  cep: cd.address_zip || '',
                  street: cd.address_street || '',
                  number: cd.address_number || '',
                  complement: cd.address_complement || '',
                  neighborhood: cd.address_neighborhood || '',
                  city: cd.address_city || '',
                  state: cd.address_state || ''
                }
              },
              bank: cdSettingsExt.bank || { bankName: '', accountType: 'CORRENTE', agency: '', accountNumber: '', pixKey: cd.pix_key || '', pixKeyType: 'CPF' },
              paymentGateway: cdSettingsExt.paymentGateway || { provider: 'MERCADO_PAGO', enabled: false, apiKey: '', apiToken: '', environment: 'SANDBOX' },
              shippingGateway: cdSettingsExt.shippingGateway || { provider: 'MELHOR_ENVIO', enabled: false, apiToken: '', environment: 'SANDBOX' }
            });
          } else {
            console.warn('[RS-CDS] No CDs registered in the database');
            const cachedProfile = readCachedJson<CDProfile>(CD_CACHE_KEY);
            const cachedSettings = readCachedJson<SettingsData>(CD_SETTINGS_CACHE_KEY);
            if (cachedProfile?.id) {
              targetCdId = cachedProfile.id;
              setUserProfile(cachedProfile);
              setCdRecordId(cachedProfile.id);
              setCdBranding({
                faviconUrl: cachedProfile.faviconUrl || undefined,
                logoUrl: cachedProfile.logoUrl || undefined
              });
              if (cachedSettings) {
                setAppSettings(cachedSettings);
              }
            } else {
              const fallbackProfile = await dataService.getCDProfile(HARDCODED_PRIMARY_CD_ID);
              if (fallbackProfile) {
                targetCdId = fallbackProfile.id;
                setUserProfile(fallbackProfile);
                setCdRecordId(fallbackProfile.id);
                writeCachedJson(CD_CACHE_KEY, fallbackProfile);
                setCdBranding({
                  faviconUrl: fallbackProfile.faviconUrl || undefined,
                  logoUrl: fallbackProfile.logoUrl || undefined
                });

                const fallbackSettings = await dataService.getCDSettingsExt(fallbackProfile.id) || {};
                const normalizedFallbackSettings: SettingsData = {
                  profile: {
                    fantasyName: fallbackProfile.name || '',
                    companyName: fallbackProfile.managerName || fallbackProfile.name || '',
                    document: fallbackProfile.document || '',
                    email: fallbackProfile.email || '',
                    phone: fallbackProfile.phone || '',
                    avatarUrl: fallbackProfile.avatarUrl || '',
                    faviconUrl: fallbackProfile.faviconUrl || '',
                    logoUrl: fallbackProfile.logoUrl || '',
                    address: {
                      cep: fallbackProfile.address?.cep || '',
                      street: fallbackProfile.address?.street || '',
                      number: fallbackProfile.address?.number || '',
                      complement: fallbackProfile.address?.complement || '',
                      neighborhood: fallbackProfile.address?.neighborhood || '',
                      city: fallbackProfile.address?.city || '',
                      state: fallbackProfile.address?.state || '',
                    }
                  },
                  bank: fallbackSettings.bank || { bankName: '', accountType: 'CORRENTE', agency: '', accountNumber: '', pixKey: '', pixKeyType: 'CPF' },
                  paymentGateway: fallbackSettings.paymentGateway || { provider: 'MERCADO_PAGO', enabled: false, apiKey: '', apiToken: '', environment: 'SANDBOX' },
                  shippingGateway: fallbackSettings.shippingGateway || { provider: 'MELHOR_ENVIO', enabled: false, apiToken: '', environment: 'SANDBOX' }
                };
                setAppSettings(normalizedFallbackSettings);
                writeCachedJson(CD_SETTINGS_CACHE_KEY, normalizedFallbackSettings);
              } else {
                setUserProfile(prev => ({
                  ...prev,
                  name: 'Nenhum CD cadastrado',
                  managerName: 'Cadastre um CD no Admin'
                }));
                setLoading(false);
                return;
              }
            }
          }
        } else {
          // Load specific CD by ID
          const cdSpecific = await dataService.getCDProfileFromAPI(targetCdId);

          if (cdSpecific) {
            const profile = await dataService.getCDProfile(targetCdId);
            if (profile) {
              setUserProfile(profile);
              writeCachedJson(CD_CACHE_KEY, profile);
            }

            const cdSettingsExt = await dataService.getCDSettingsExt(targetCdId) || {};

            // Also populate Settings with this CD's data
            setAppSettings({
              profile: {
                fantasyName: cdSpecific.name || '',
                companyName: cdSpecific.manager_name || cdSpecific.name || '',
                document: cdSpecific.cpf || cdSpecific.cnpj || '',
                email: cdSpecific.email || '',
                phone: cdSpecific.phone || '',
                avatarUrl: cdSpecific.avatar_url || '',
                faviconUrl: cdSpecific.favicon_url || '',
                logoUrl: cdSpecific.logo_url || '',
                address: {
                  cep: cdSpecific.address_zip || '',
                  street: cdSpecific.address_street || '',
                  number: cdSpecific.address_number || '',
                  complement: cdSpecific.address_complement || '',
                  neighborhood: cdSpecific.address_neighborhood || '',
                  city: cdSpecific.address_city || '',
                  state: cdSpecific.address_state || ''
                }
              },
              bank: cdSettingsExt.bank || { bankName: '', accountType: 'CORRENTE', agency: '', accountNumber: '', pixKey: cdSpecific.pix_key || '', pixKeyType: 'CPF' },
              paymentGateway: cdSettingsExt.paymentGateway || { provider: 'MERCADO_PAGO', enabled: false, apiKey: '', apiToken: '', environment: 'SANDBOX' },
              shippingGateway: cdSettingsExt.shippingGateway || { provider: 'MELHOR_ENVIO', enabled: false, apiToken: '', environment: 'SANDBOX' }
            });
            writeCachedJson(CD_SETTINGS_CACHE_KEY, {
              profile: {
                fantasyName: cdSpecific.name || '',
                companyName: cdSpecific.manager_name || cdSpecific.name || '',
                document: cdSpecific.cpf || cdSpecific.cnpj || '',
                email: cdSpecific.email || '',
                phone: cdSpecific.phone || '',
                avatarUrl: cdSpecific.avatar_url || '',
                faviconUrl: cdSpecific.favicon_url || '',
                logoUrl: cdSpecific.logo_url || '',
                address: {
                  cep: cdSpecific.address_zip || '',
                  street: cdSpecific.address_street || '',
                  number: cdSpecific.address_number || '',
                  complement: cdSpecific.address_complement || '',
                  neighborhood: cdSpecific.address_neighborhood || '',
                  city: cdSpecific.address_city || '',
                  state: cdSpecific.address_state || ''
                }
              },
              bank: cdSettingsExt.bank || { bankName: '', accountType: 'CORRENTE', agency: '', accountNumber: '', pixKey: cdSpecific.pix_key || '', pixKeyType: 'CPF' },
              paymentGateway: cdSettingsExt.paymentGateway || { provider: 'MERCADO_PAGO', enabled: false, apiKey: '', apiToken: '', environment: 'SANDBOX' },
              shippingGateway: cdSettingsExt.shippingGateway || { provider: 'MELHOR_ENVIO', enabled: false, apiToken: '', environment: 'SANDBOX' }
            });

            // Apply dynamic branding (favicon and logo from DB)
            if (cdSpecific.favicon_url || cdSpecific.logo_url) {
              setCdBranding({ faviconUrl: cdSpecific.favicon_url || undefined, logoUrl: cdSpecific.logo_url || undefined });
            }
          }
        }

        setCdRecordId(targetCdId);

        // 4. Load orders, products, transactions in parallel
        const [ordersData, productsData, transactionsData, financialData] = await Promise.all([
          dataService.getOrders(targetCdId),
          dataService.getProducts(targetCdId),
          dataService.getTransactions(targetCdId),
          dataService.getFinancialData(targetCdId)
        ]);

        setOrders(ordersData);
        setProducts(productsData);
        setTransactions(transactionsData);
        if (financialData) {
          const nextWalletBalance = Number(
            financialData.withdrawableBalance
            ?? financialData.availableBalance
            ?? financialData.storedBalance
            ?? computeWithdrawableBalance(transactionsData)
          );
          setUserProfile(prev => ({
            ...prev,
            walletBalance: nextWalletBalance
          }));
          const cachedProfile = readCachedJson<CDProfile & { address?: any }>(CD_CACHE_KEY);
          if (cachedProfile?.id === targetCdId) {
            writeCachedJson(CD_CACHE_KEY, {
              ...cachedProfile,
              walletBalance: nextWalletBalance
            });
          }
        }

      } catch (err) {
        console.error('[RS-CDS] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCDData();
  }, [propCdId, propUserId]);

  const pendingNotifications = orders.filter(o => o.status === 'PENDENTE').length;

  const handleNavigate = (view: ViewState) => {
    const shouldKeepOpen = typeof window !== 'undefined' && window.innerWidth >= 768;
    if (view === currentView) {
      setIsSidebarOpen(shouldKeepOpen);
      return;
    }
    if (view === 'DASHBOARD') {
      setViewHistory(['DASHBOARD']);
    } else {
      setViewHistory(prev => [...prev, view]);
    }
    setIsSidebarOpen(shouldKeepOpen);
  };

  const handleBack = () => {
    if (viewHistory.length > 1) {
      setViewHistory(prev => prev.slice(0, -1));
      setIsSidebarOpen(true);
    }
  };

  const handleUpdateProfile = (newProfileData: SettingsData['profile']) => {
    setAppSettings(prev => prev ? { ...prev, profile: newProfileData } : null);
    setUserProfile(prev => ({
      ...prev,
      name: newProfileData.fantasyName || prev.name,
      managerName: newProfileData.companyName || prev.managerName,
      avatarUrl: newProfileData.avatarUrl
    }));
  };

  const refreshData = async () => {
    if (!cdRecordId) return;
    const [ordersData, productsData, transactionsData, financialData] = await Promise.all([
      dataService.getOrders(cdRecordId),
      dataService.getProducts(cdRecordId),
      dataService.getTransactions(cdRecordId),
      dataService.getFinancialData(cdRecordId)
    ]);
    setOrders(ordersData);
    setProducts(productsData);
    setTransactions(transactionsData);
    if (financialData) {
      const nextWalletBalance = Number(
        financialData.withdrawableBalance
        ?? financialData.availableBalance
        ?? financialData.storedBalance
        ?? computeWithdrawableBalance(transactionsData)
      );
      setUserProfile(prev => ({
        ...prev,
        walletBalance: nextWalletBalance
      }));
      const cachedProfile = readCachedJson<CDProfile & { address?: any }>(CD_CACHE_KEY);
      if (cachedProfile?.id === cdRecordId) {
        writeCachedJson(CD_CACHE_KEY, {
          ...cachedProfile,
          walletBalance: nextWalletBalance
        });
      }
    }
  };

  useEffect(() => {
    const handleRefresh = () => refreshData();
    window.addEventListener('refresh-cd-data', handleRefresh);
    return () => window.removeEventListener('refresh-cd-data', handleRefresh);
  }, [cdRecordId]);

  if (loading) {
    return (
      <div className="bg-dark-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={40} className="text-gold-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando dados do CD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-950 min-h-screen text-gray-200 font-sans selection:bg-gold-500 selection:text-black">
      <Sidebar
        currentView={currentView}
        setView={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        logoUrl={cdBranding.logoUrl}
        onLogout={onLogout}
      />

      <main className={`ml-0 p-4 md:p-8 min-h-screen bg-black/40 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-dark-800 sticky top-0 bg-dark-950/90 backdrop-blur z-30 pt-2">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg" aria-label="Abrir menu lateral">
              <Menu size={24} />
            </button>
            {viewHistory.length > 1 && (
              <button onClick={handleBack} className="p-2 text-gold-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors flex items-center gap-2 animate-fade-in" title="Voltar">
                <ArrowLeft size={24} />
                <span className="hidden sm:inline text-sm font-medium">Voltar</span>
              </button>
            )}
            <div className="md:hidden text-sm font-bold text-gold-400 uppercase tracking-wider ml-2">
              {cdBranding.logoUrl ? (
                <img src={cdBranding.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
              ) : (
                "RS Prólipsi"
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {onBackToAdmin && (
              <button onClick={onBackToAdmin} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border border-gold-400/40 text-xs font-semibold text-gold-400 hover:bg-gold-400/10" title="Voltar ao painel">
                <Home size={16} /> Voltar ao Painel
              </button>
            )}
            <button onClick={refreshData} className="p-2 text-gray-400 hover:text-gold-400 hover:bg-dark-800 rounded-full transition-colors" title="Atualizar dados">
              <RefreshCw size={18} />
            </button>
            <div className="relative cursor-pointer hover:bg-dark-800 p-2 rounded-full transition-colors" onClick={() => pendingNotifications > 0 && handleNavigate('PEDIDOS')} title={pendingNotifications > 0 ? `${pendingNotifications} novos pedidos` : "Sem novos pedidos"}>
              <Bell size={20} className={pendingNotifications > 0 ? "text-gray-200" : "text-gray-500"} />
              {pendingNotifications > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-dark-950 animate-pulse">{pendingNotifications}</span>
              )}
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-dark-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{userProfile.managerName || 'Administrador'}</p>
                <p className="text-xs text-gray-500">{userProfile.name !== 'Carregando...' ? userProfile.name : 'Configurar Perfil'}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-800 border border-gold-400/50 flex items-center justify-center text-gold-400 overflow-hidden">
                {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <User size={20} />}
              </div>
            </div>
          </div>
        </header>

        <div className="animate-fade-in-up pb-10 flex-1">
          {currentView === 'DASHBOARD' && <Dashboard profile={userProfile} orders={orders} transactions={transactions} onNavigate={handleNavigate} />}
          {currentView === 'PEDIDOS' && <Orders orders={orders} onNavigate={handleNavigate} cdId={cdRecordId} />}
          {currentView === 'ESTOQUE' && <Inventory products={products} walletBalance={userProfile.walletBalance} cdId={cdRecordId} profile={userProfile} />}
          {currentView === 'FINANCEIRO' && <Financial profile={userProfile} transactions={transactions} cdId={cdRecordId} />}
          {currentView === 'IA_ADVISOR' && <GeminiAdvisor profile={userProfile} orders={orders} products={products} />}
          {currentView === 'CONFIGURACOES' && <Settings initialData={appSettings || undefined} onSaveProfile={handleUpdateProfile} cdId={cdRecordId} />}
          {currentView === 'HISTORICO' && <SalesHistory orders={orders} />}
          {currentView === 'ABASTECIMENTOS' && <ReplenishmentOrders cdId={cdRecordId} />}
        </div>

        <footer className="mt-auto pt-6 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2025 RS Prólipsi - Sistema de Gestão</p>
          <p className="mt-2 md:mt-0 opacity-70">A RS-IA pode cometer erros. Verifique informações críticas.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
