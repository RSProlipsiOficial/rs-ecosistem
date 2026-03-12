import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/services/supabase';
import { AdminDashboard } from './MinisiteAdmin';
import { BioSite, UserProfile, AgencyClient, ClientPayment, SystemLog, Agency, PlanDefinition } from './types';
import { PLANS, INITIAL_USER } from './constants';

interface MinisiteAdminWrapperProps {
  setActiveView: (view: string) => void;
}

export const MinisiteAdminWrapper: React.FC<MinisiteAdminWrapperProps> = ({ setActiveView }) => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [sites, setSites] = useState<BioSite[]>([]);
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanDefinition>>(PLANS);
  const [globalSettings, setGlobalSettings] = useState({
    pixKey: '',
    supportEmail: '',
    platformName: 'RS MiniSite',
    mpPublicKey: '',
    mpAccessToken: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Admin User from current session or localStorage
  useEffect(() => {
    const fetchAdminUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Admin',
          email: session.user.email || '',
          plan: 'admin_master',
          referralCode: `RS-ADMIN`,
          idNumerico: 1
        });
      }
    };
    fetchAdminUser();
  }, []);

  // Fetch all Minisite Ecosystem Data
  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // Fetch Clients
        const { data: clientsData } = await supabase.from('minisite_clients').select('*');
        if (clientsData) {
          setClients(clientsData.map((c: any) => ({
            id: c.id,
            agencyId: c.agency_id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            status: c.status,
            notes: c.notes,
            monthlyFee: c.monthly_fee,
            createdAt: new Date(c.created_at || Date.now()),
            updatedAt: new Date(c.updated_at || Date.now())
          })));
        }

        // Fetch Logs
        const { data: logsData } = await supabase.from('minisite_system_logs').select('*').limit(50).order('timestamp', { ascending: false });
        if (logsData) {
          setLogs(logsData.map((l: any) => ({
            id: l.id,
            actorName: l.actor_name,
            actorEmail: l.actor_email,
            action: l.action,
            target: l.target,
            timestamp: new Date(l.timestamp || Date.now())
          })));
        }

        // Fetch Plans
        const { data: plansData } = await supabase.from('minisite_plans').select('*');
        if (plansData && plansData.length > 0) {
          const mappedPlans: Record<string, PlanDefinition> = {};
          plansData.forEach(p => {
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

        // Fetch Settings
        const { data: settsData } = await supabase.from('minisite_setts').select('*');
        if (settsData && settsData.length > 0) {
          const settings = settsData[0];
          setGlobalSettings({
            pixKey: settings.pix_key || '',
            supportEmail: settings.support_email || '',
            platformName: settings.platform_name || 'RS MiniSite',
            mpPublicKey: settings.mp_public_key || '',
            mpAccessToken: settings.mp_access_token || ''
          });
        }

        // Fetch Profiles (Agencies)
        const { data: profilesData } = await supabase.from('minisite_profiles').select('*');
        if (profilesData) {
          setAgencies(profilesData.map((p: any) => ({
            id: p.id,
            name: p.name || 'Sem Nome',
            email: p.email || '',
            plan: p.plan || 'free',
            clientsCount: 0,
            revenue: 0,
            status: 'active',
            createdAt: new Date(p.created_at || Date.now())
          })));
        }
      } catch (err) {
        console.error("Error fetching Minisite data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddLog = async (action: string, target: string) => {
    const newLog: any = {
      actor_id: user.id === INITIAL_USER.id ? null : user.id,
      actor_name: user.name,
      actor_email: user.email,
      action: action,
      target: target
    };
    await supabase.from('minisite_system_logs').insert(newLog);
    setLogs(prev => [{ ...newLog, id: Math.random().toString(), timestamp: new Date() }, ...prev]);
  };

  const handleAddAgency = async (agencyData: Omit<Agency, 'id' | 'createdAt'>) => {
    // In a real app this creates an auth user, but for now we mimic state
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

  const handleAddClient = async (clientData: any) => {
    const newClient = {
      ...clientData,
      id: Math.random().toString(16).substr(2, 8).toUpperCase(),
      agencyId: clientData.agencyId || user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: clientData.status || 'active'
    };

    // Fire and forget insert
    supabase.from('minisite_clients').insert({
      id: newClient.id,
      agency_id: newClient.agencyId,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      status: newClient.status,
      notes: newClient.notes,
      monthly_fee: newClient.monthlyFee
    }).then();

    setClients(prev => [...prev, newClient]);
    handleAddLog('create_client', `Criou cliente: ${newClient.name}`);
  };

  const handleUpdateClient = async (client: AgencyClient) => {
    supabase.from('minisite_clients').update({
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
      notes: client.notes,
      monthly_fee: client.monthlyFee,
      updated_at: new Date().toISOString()
    }).eq('id', client.id).then();

    setClients(prev => prev.map(c => c.id === client.id ? { ...client, updatedAt: new Date() } : c));
    handleAddLog('update_client', `Atualizou cliente: ${client.name}`);
  };

  const handleDeleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      supabase.from('minisite_clients').delete().eq('id', id).then();
      setClients(prev => prev.filter(c => c.id !== id));
      handleAddLog('delete_item', `Removeu cliente: ${client.name}`);
    }
  };

  const handleAddPayment = async (paymentData: any) => {
    const newPayment = {
      ...paymentData,
      id: Math.random().toString(16).substr(2, 8).toUpperCase()
    };

    supabase.from('minisite_payments').insert({
      id: newPayment.id,
      client_id: newPayment.clientId,
      amount: newPayment.amount,
      status: newPayment.status,
      method: newPayment.method,
      notes: newPayment.notes
    }).then();

    setPayments(prev => [newPayment, ...prev]);
    handleAddLog('add_payment', `Novo pagamento: R$ ${paymentData.amount}`);
  };

  const handleUpdatePlans = async (updatedPlans: Record<string, PlanDefinition>) => {
    setPlans(updatedPlans);
    const payload = Object.values(updatedPlans).map((p: PlanDefinition) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      features: p.features,
      max_pages: p.maxPages,
      max_clients: p.maxClients
    }));
    supabase.from('minisite_plans').upsert(payload).then();
    handleAddLog('update_plans', 'Atualizou planos do Minisite');
  };

  const handleUpdateSettings = async (updatedSettings: any) => {
    setGlobalSettings(updatedSettings);
    supabase.from('minisite_setts').upsert({
      id: 'global',
      pix_key: updatedSettings.pixKey,
      support_email: updatedSettings.supportEmail,
      platform_name: updatedSettings.platformName,
      mp_public_key: updatedSettings.mpPublicKey,
      mp_access_token: updatedSettings.mpAccessToken
    }).then();
    handleAddLog('update_settings', 'Atualizou configurações globais');
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center min-h-[500px] text-rs-gold">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rs-gold"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <AdminDashboard
        user={user}
        sites={sites}
        clients={clients}
        payments={payments}
        agencies={agencies}
        logs={logs}
        plans={plans}
        globalSettings={globalSettings}
        onAddAgency={handleAddAgency}
        onUpdateAgency={handleUpdateAgency}
        onDeleteAgency={handleDeleteAgency}
        onAddClient={handleAddClient}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
        onAddPayment={handleAddPayment}
        onUpdatePlans={handleUpdatePlans}
        onUpdateSettings={handleUpdateSettings}
        onLogout={() => setActiveView('Dashboard')}
        onBackToApp={() => setActiveView('Dashboard')}
      />
    </div>
  );
};

export default MinisiteAdminWrapper;
