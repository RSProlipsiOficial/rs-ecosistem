import { TrendingUp, Users, DollarSign, Brain, Headphones, Sparkles } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from "@/components/layout/main-layout";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { QuickAccessCards } from "@/components/dashboard/quick-access-cards";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Check if user is authenticated and redirect to correct portal
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';

      if (!session?.user && !isDemoMode) {
        navigate('/auth');
        return;
      }

      if (isDemoMode) {
        // No modo demo, permanecemos no /app independente de sessão real
        return;
      }

      if (session?.user) {
        const userType = session.user.user_metadata?.user_type || 'usuario';

        if (userType === 'motorista') {
          navigate('/motorista');
          return;
        } else if (userType === 'monitora') {
          navigate('/monitora');
          return;
        }
        // Admins e masters agora podem visualizar o painel operacional (/painel) normalmente
        // sem serem forçados para o /admin.
      }
    };

    checkAuthAndRedirect();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';

        if (!session?.user && !isDemoMode) {
          navigate('/auth');
        } else if (event === 'SIGNED_IN' && session) {
          // Re-check redirection on sign in
          const userType = session.user.user_metadata?.user_type || 'usuario';
          if (!mounted) return;
          if (userType === 'motorista') navigate('/motorista');
          else if (userType === 'monitora') navigate('/monitora');
          else if (userType === 'admin') navigate('/admin');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const [branding, setBranding] = useState<{ company_name: string; logo_url?: string }>(() => {
    const cached = localStorage.getItem('app_branding');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) { }
    }
    return { company_name: "" };
  });

  useEffect(() => {
    const loadBranding = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'branding')
        .maybeSingle();

      if (data?.value) {
        const brandingData = data.value as any;
        setBranding(brandingData);
        localStorage.setItem('app_branding', JSON.stringify(brandingData));
      }
    };
    loadBranding();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in relative">
        {localStorage.getItem('rs_demo_mode') === 'true' && (
          <div className="flex items-center justify-between p-4 bg-gold/10 border border-gold/20 rounded-2xl backdrop-blur-md mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-gold font-black uppercase text-xs tracking-widest">Modo de Demonstração Interativo</p>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">Você está explorando o Escritório Virtual VIP</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('rs_demo_mode');
                navigate('/demonstracao');
              }}
              className="border-gold/20 text-gold hover:bg-gold/10 text-[10px] font-black uppercase tracking-widest"
            >
              Sair da Demo
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/5 border border-gold/10 rounded-full mb-2">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-[10px] text-gold font-black uppercase tracking-widest leading-none">Escritório Virtual VIP</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">
            PORTAL <span className="text-gold">{branding.company_name}</span> <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-lg border border-gold/20 font-bold align-top mt-1 ml-2 not-italic">v4.0</span>
          </h1>
          <p className="text-sm md:text-base text-white/40 font-bold uppercase tracking-[0.4em]">
            Gestão Inteligente de <span className="text-white/60">Transporte Escolar</span>
          </p>
        </div>

        <div className="grid gap-8 relative">
          <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/3 rounded-full blur-[150px] pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <FinancialSummary />
            <QuickAccessCards />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
