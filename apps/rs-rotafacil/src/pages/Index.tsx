import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from "@/components/layout/main-layout";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { QuickAccessCards } from "@/components/dashboard/quick-access-cards";
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Bem-vindo ao <span className="text-gold">RotaFácil</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistema completo de gestão de transporte escolar
          </p>
        </div>
        
        <FinancialSummary />
        <QuickAccessCards />
      </div>
    </MainLayout>
  );
};

export default Index;
