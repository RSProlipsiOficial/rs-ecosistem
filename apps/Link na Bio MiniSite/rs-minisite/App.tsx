import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin'; // Fix: Moved to top
import { Editor } from './components/Editor';
import { Renderer } from './components/Renderer';
import { LandingPage } from './components/LandingPage';
import { Signup } from './components/Signup';
import { Login } from './components/Login';
import { INITIAL_SITES, INITIAL_USER, PLANS, RS_THEME_DARK, RS_THEME_LIGHT } from './constants';
import { BioSite, ViewMode, UserProfile, UserPlan, AgencyClient, ClientPayment, SystemLog, Agency, PlanDefinition } from './types';
import { supabase } from './supabaseClient';
import { brandingApi } from './brandingApi';

if (typeof window !== 'undefined') {
  console.log("[App.tsx] Global initialization...");
}

export default function App() {
  // Debug Alert - Remova após confirmação
  useEffect(() => {
    console.log("[App] Component Mounted. Current View:", currentView);
  }, []);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await brandingApi.getBranding();
        if (res.success && res.data) {
          const { favicon } = res.data;
          if (favicon) {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (link) link.href = favicon;
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
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [sites, setSites] = useState<BioSite[]>(INITIAL_SITES);
  const [clients, setClients] = useState<AgencyClient[]>([]); // State for Agency Clients
  const [payments, setPayments] = useState<ClientPayment[]>([]); // State for Payments
  const [logs, setLogs] = useState<SystemLog[]>([]); // State for System Logs

  // -- NEW: Dynamic Ecosystem State --
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanDefinition>>(PLANS);
  const [globalSettings, setGlobalSettings] = useState({
    pixKey: '',
    supportEmail: '',
    platformName: 'RS MiniSite',
    mpPublicKey: '',
    mpAccessToken: ''
  });

  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);

  // Initialize state from localStorage or default to true (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('rs-theme-preference');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Helper for Logging
  const handleAddLog = async (action: string, target: string) => {
    const newLog: any = {
      actor_id: user.id === INITIAL_USER.id ? null : user.id,
      actor_name: user.name,
      actor_email: user.email,
      action: action,
      target: target
    };

    if (user.id !== INITIAL_USER.id) {
      await supabase.from('minisite_system_logs').insert(newLog);
    }

    setLogs(prev => [{ ...newLog, id: Math.random().toString(), timestamp: new Date() }, ...prev]);
  };

  // -- Agency Management Handlers --
  const handleAddAgency = (agencyData: Omit<Agency, 'id' | 'createdAt'>) => {
    const newAgency: Agency = {
      ...agencyData,
      id: Math.random().toString(16).substr(2, 8).toUpperCase(),
      createdAt: new Date()
    };
    setAgencies(prev => [...prev, newAgency]);
    handleAddLog('create_agency', `Criou agência: ${newAgency.name}`);
  };

  const handleUpdateAgency = (updatedAgency: Agency) => {
    setAgencies(prev => prev.map(a => a.id === updatedAgency.id ? updatedAgency : a));
    handleAddLog('update_agency', `Atualizou agência: ${updatedAgency.name}`);
  };

  const handleDeleteAgency = (id: string) => {
    const agency = agencies.find(a => a.id === id);
    if (agency) {
      setAgencies(prev => prev.filter(a => a.id !== id));
      handleAddLog('delete_item', `Removeu agência: ${agency.name}`);
    }
  };


  // Supabase Data Fetching
  useEffect(() => {
    if (user.id && user.id !== INITIAL_USER.id) {
      const isAdmin = user.plan === 'admin_master';

      // Fetch Sites
      const sitesQuery = isAdmin
        ? supabase.from('minisite_biosites').select('*')
        : supabase.from('minisite_biosites').select('*').eq('user_id', user.id);

      sitesQuery.then(({ data, error }) => {
        if (data && !error) {
          setSites(data.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            clientId: s.client_id,
            slug: s.slug,
            name: s.name,
            plan: s.plan,
            sections: s.sections || [],
            theme: s.theme || { primaryColor: '#000000', backgroundColor: '#ffffff', textColor: '#000000', buttonStyle: 'rounded', fontFamily: 'sans' },
            isPublished: s.is_published,
            views: s.views || 0,
            seo: s.seo || { title: '', description: '', image: '' },
            tracking: s.tracking
          })));
        }
      });

      // Fetch Clients
      const clientsQuery = isAdmin
        ? supabase.from('minisite_clients').select('*')
        : supabase.from('minisite_clients').select('*').eq('agency_id', user.id);

      clientsQuery.then(({ data, error }) => {
        if (data && !error) setClients(data as any);
      });

      // Fetch Logs (Admin sees all)
      supabase.from('minisite_system_logs')
        .select('*')
        .limit(50)
        .order('timestamp', { ascending: false })
        .then(({ data, error }) => {
          if (data && !error) setLogs(data as any);
        });

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
          setPlans(mappedPlans);
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
        referralCode: `RS-${session.user.id.substr(0, 8).toUpperCase()}`,
        idNumerico: 1 // Default inicial
      };

      // Fetch Extended Profile
      try {
        const { data: profileData } = await supabase
          .from('minisite_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          mappedUser = {
            ...mappedUser,
            plan: (profileData.plan as any) || 'free',
            cpf: profileData.cpf,
            phone: profileData.phone,
            avatarUrl: profileData.avatar_url,
            consultantId: profileData.consultant_id,
            referralLink: profileData.referral_link,
            mercadoPagoPublicKey: profileData.mercado_pago_public_key,
            mercadoPagoAccessToken: profileData.mercado_pago_access_token,
            address: {
              street: profileData.address_street,
              number: profileData.address_number,
              neighborhood: profileData.address_neighborhood,
              city: profileData.address_city,
              state: profileData.address_state,
              zip: profileData.address_zip
            }
          };
        }
      } catch (err) {
        console.warn("[App] Profile fetch error (might not exist yet):", err);
      }

      setUser(mappedUser);

      // Fetch Sites
      const { data: sitesData } = await supabase.from('minisite_biosites').select('*');
      if (sitesData) {
        setSites(sitesData.map((s: any) => ({
          id: s.id,
          userId: s.user_id,
          clientId: s.client_id,
          slug: s.slug,
          name: s.name,
          plan: s.plan,
          sections: s.sections || [],
          theme: s.theme || { primaryColor: '#000000', backgroundColor: '#ffffff', textColor: '#000000', buttonStyle: 'rounded', fontFamily: 'sans' },
          isPublished: s.is_published,
          views: s.views || 0,
          seo: s.seo || { title: '', description: '', image: '' },
          tracking: s.tracking
        })));
      }

      // Auto-navigation from landing/auth pages
      // Use a small timeout or check mount state to avoid navigation loops during state transitions
      if (['landing', 'login', 'signup', 'admin-login'].includes(currentView)) {
        setCurrentView('dashboard');
      }
    };

    // Single source of truth for Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[App] Auth Event:", event);
      loadUserData(session);
    });

    // Handle initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadUserData(session);
    });

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
        alert(`Limite de clientes do plano ${currentPlanDef.name} atingido (${currentPlanDef.maxClients}).`);
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

    if (user.id !== INITIAL_USER.id) {
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
        console.error('Error adding client:', error);
        return;
      }
    }

    setClients([...clients, newClient]);

    if (user.plan === 'admin_master') {
      handleAddLog('create_client', `Criou cliente: ${newClient.name}`);
    }
  };

  const handleUpdateClient = async (client: AgencyClient) => {
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
      console.error('Error updating client:', error);
      return;
    }

    setClients(prev => prev.map(c => c.id === client.id ? { ...client, updatedAt: new Date() } : c));
    if (user.plan === 'admin_master') {
      handleAddLog('update_client', `Atualizou cliente: ${client.name}`);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      const { error } = await supabase.from('minisite_clients').delete().eq('id', id);
      if (error) {
        console.error('Error deleting client:', error);
        return;
      }
      setClients(prev => prev.filter(c => c.id !== id));
      handleAddLog('delete_item', `Removeu cliente: ${client.name}`);
    }
  };

  const handleAddPayment = async (paymentData: Omit<ClientPayment, 'id'>) => {
    const newPayment: ClientPayment = {
      ...paymentData,
      id: Math.random().toString(16).substr(2, 8).toUpperCase()
    };

    if (user.id !== INITIAL_USER.id) {
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
        console.error('Error adding payment:', error);
        return;
      }
    }

    setPayments(prev => [newPayment, ...prev]);
    if (user.plan === 'admin_master') {
      handleAddLog('add_payment', `Novo pagamento: R$ ${paymentData.amount}`);
    }
  };

  const handleCreateNew = (clientId?: string) => {
    // Check Creation Limits (Total Sites for THIS user >= Plan Limit)
    const currentPlanDef = PLANS[user.plan];
    const userSitesCount = sites.filter(s => s.userId === user.id).length;

    if (userSitesCount >= currentPlanDef.maxPages) {
      alert(`Limite do plano ${currentPlanDef.name} atingido (${currentPlanDef.maxPages} sites). Por favor, faça upgrade.`);
      return;
    }

    const newSite: BioSite = {
      id: Math.random().toString(16).substr(2, 8).toUpperCase(),
      userId: user.id, // Always belongs to the logged in user (Agency Owner)
      clientId: clientId, // Linked to a client if provided
      slug: `site-${Math.random().toString(36).substr(2, 5)}`,
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

    if (user.id !== INITIAL_USER.id) {
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
      });
      if (error) {
        console.error('Error saving site:', error);
        alert('Erro ao salvar no banco de dados.');
      }
    }

    setSites(prev => prev.map(s => s.id === updatedSite.id ? updatedSite : s));
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
      setSites(prev => prev.map(s =>
        s.id === site.id ? { ...s, views: s.views + 1 } : s
      ));

      // Increment views in Supabase
      await supabase.rpc('increment_minisite_views', { site_id: site.id });
      // Fallback for direct update if RPC is missing
      await supabase.from('minisite_biosites').update({ views: site.views + 1 }).eq('id', site.id);

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
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);

    // 2. Persist to Supabase (minisite_profiles)
    if (user.id !== INITIAL_USER.id) {
      const { error } = await supabase.from('minisite_profiles').upsert({
        id: user.id,
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
      });

      if (error) {
        console.error('Error saving profile:', error);
        alert('Erro ao salvar perfil no banco de dados.');
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

  // 5. Admin Dashboard (Exclusive)
  if (currentView === 'admin' && user.plan === 'admin_master') {
    return (
      <AdminDashboard
        user={user}
        sites={sites}
        clients={clients}
        payments={payments}
        logs={logs}
        agencies={agencies}
        plans={plans}
        globalSettings={globalSettings}
        onUpdatePlans={async (updatedPlans: Record<string, PlanDefinition>) => {
          setPlans(updatedPlans);
          const { error } = await supabase.from('minisite_plans').upsert(Object.values(updatedPlans).map((p: PlanDefinition) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            features: p.features,
            max_pages: p.maxPages,
            max_clients: p.maxClients
          })));
          if (error) console.error("Error saving plans:", error);
        }}
        onUpdateSettings={async (updatedSettings) => {
          setGlobalSettings(updatedSettings);
          const { error } = await supabase.from('minisite_setts').upsert({
            id: 'global',
            pix_key: updatedSettings.pixKey,
            support_email: updatedSettings.supportEmail,
            platform_name: updatedSettings.platformName,
            mp_public_key: updatedSettings.mpPublicKey,
            mp_access_token: updatedSettings.mpAccessToken
          });
          if (error) console.error("Error saving settings:", error);
        }}
        onAddAgency={handleAddAgency}
        onUpdateAgency={handleUpdateAgency}
        onDeleteAgency={handleDeleteAgency}
        onAddClient={handleAddClient}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
        onAddPayment={handleAddPayment}
        onLogout={() => {
          supabase.auth.signOut();
          setCurrentView('landing');
        }}
        onBackToApp={() => setCurrentView('dashboard')}
      />
    );
  }

  // 6. Dashboard (Default authenticated view)
  return (
    <Dashboard
      user={user}
      sites={sites}
      clients={clients}
      payments={payments}
      onCreateNew={handleCreateNew}
      onAddClient={handleAddClient}
      onUpdateClient={handleUpdateClient}
      onAddPayment={handleAddPayment}
      onEdit={handleEditSite}
      onView={handleViewSite}
      onUpdatePlan={handleUpdatePlan}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      onNavigateToAdmin={() => setCurrentView('admin')}
      onLog={handleAddLog}
      onUpdateUser={handleUpdateUser}
      platformSettings={globalSettings}
      onSyncProfile={async () => {
        // Sync with Global 'consultores' table (RS Prólipsi Central)
        try {
          // [MASTER-PROFILE-SYNK]
          if (user.email?.toLowerCase().startsWith('rsprolipsioficial@gmail.')) {
            return {
              name: 'RS PRÓLIPSI',
              cpf: consultor?.cpf || '23430313000185', // Padrão real Imagem 2
              phone: consultor?.telefone || '(41) 99286-3922',
              avatarUrl: 'https://i.pravatar.cc/150?u=rsprolipsi',
              consultantId: 'rsprolipsi',
              idNumerico: 1,
              referralLink: 'https://rsprolipsi.com.br/invite/rsprolipsi',
              address: {
                zip: consultor?.cep || '00000-000',
                street: consultor?.endereco || 'Sede RS',
                number: consultor?.numero || '1',
                neighborhood: consultor?.bairro || 'Centro',
                city: consultor?.cidade || 'RS City',
                state: consultor?.estado || 'RS'
              }
            };
          }

          if (consultorError) throw consultorError;
          if (!consultor) return null;

          // 2. Get Avatar from 'user_profiles' if it exists
          let avatarUrl = null;
          if (consultor.user_id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('avatar_url')
              .eq('user_id', consultor.user_id)
              .maybeSingle();
            if (profile) avatarUrl = profile.avatar_url;
          }

          // 3. Map to UserProfile
          return {
            name: consultor.nome,
            cpf: consultor.cpf,
            phone: consultor.telefone || consultor.whatsapp,
            avatarUrl: avatarUrl,
            consultantId: consultor.mmn_id || consultor.username || 'RS-PRO-001',
            idNumerico: consultor.id_numerico || 1,
            referralLink: `https://rsprolipsi.com.br/invite/${consultor.username}`,
            address: {
              zip: consultor.cep,
              street: consultor.endereco,
              number: consultor.numero,
              neighborhood: consultor.bairro,
              city: consultor.cidade,
              state: consultor.estado
            }
          };
        } catch (err) {
          console.error("Sync Error:", err);
          return null;
        }
      }}
    />
  );
}