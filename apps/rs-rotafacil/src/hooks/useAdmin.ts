import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await checkAdminStatus();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Verificar se o email está na lista de admins
      const { data: adminEmails, error } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', user.email);

      if (error) {
        console.error('Erro ao verificar status de admin:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(adminEmails && adminEmails.length > 0);
      }
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}