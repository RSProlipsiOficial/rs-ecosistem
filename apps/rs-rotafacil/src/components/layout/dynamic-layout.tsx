import { ReactNode, useEffect, useState } from 'react';
import { MainLayout } from './main-layout';
import { MotoristaLayout } from './motorista-layout';
import { MonitoraLayout } from './monitora-layout';
import { ResponsavelLayout } from './responsavel-layout';
import { supabase } from '@/integrations/supabase/client';

interface DynamicLayoutProps {
    children: ReactNode;
}

/**
 * Componente que seleciona automaticamente o layout correto
 * baseado no papel (role) do usuário logado.
 *
 * IMPORTANTE: AdminLayout NÃO é usado aqui.
 * Ele só deve ser usado em rotas /admin/* explícitas.
 */
export function DynamicLayout({ children }: DynamicLayoutProps) {
    const [userRole, setUserRole] = useState<string>(() => {
        // Tentar obter role de forma síncrona do localStorage/cache primeiro
        const cachedSession = localStorage.getItem('supabase.auth.token');
        if (cachedSession) {
            try {
                const parsed = JSON.parse(cachedSession);
                const tipo = parsed?.currentSession?.user?.user_metadata?.tipo_usuario;
                const type = parsed?.currentSession?.user?.user_metadata?.user_type;
                return (tipo || type || 'dono').toLowerCase();
            } catch { }
        }
        return 'dono'; // Default
    });

    useEffect(() => {
        // Atualizar de forma assíncrona se necessário
        const getUserRole = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const tipo = session.user.user_metadata?.tipo_usuario;
                    const type = session.user.user_metadata?.user_type;
                    const role = (tipo || type || 'dono').toLowerCase();

                    console.log('[DynamicLayout] Role detectado:', {
                        role,
                        tipo,
                        type,
                        metadata: session.user.user_metadata
                    });

                    setUserRole(role);
                }
            } catch (error) {
                console.error('[DynamicLayout] Erro ao obter role:', error);
            }
        };

        getUserRole();
    }, []);

    console.log('[DynamicLayout] Escolhendo layout para role:', userRole);

    // Escolher layout baseado no papel
    // APENAS equipe (motorista, monitora, responsavel) tem layouts específicos
    // TODOS os outros (admin, owner, consultor, dono, master) usam MainLayout
    switch (userRole) {
        case 'motorista':
            console.log('[DynamicLayout] → MotoristaLayout');
            return <MotoristaLayout>{children}</MotoristaLayout>;

        case 'monitora':
            console.log('[DynamicLayout] → MonitoraLayout');
            return <MonitoraLayout>{children}</MonitoraLayout>;

        case 'responsavel':
            console.log('[DynamicLayout] → ResponsavelLayout');
            return <ResponsavelLayout>{children}</ResponsavelLayout>;

        default:
            // TODOS os outros: dono, consultor, admin, owner, master
            // Usam o painel principal (MainLayout)
            console.log('[DynamicLayout] → MainLayout (dono/consultor/admin)');
            return <MainLayout>{children}</MainLayout>;
    }
}
