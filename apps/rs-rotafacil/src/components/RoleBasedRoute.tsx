import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getUserRole } from '@/hooks/useRoleBasedRedirect';

interface RoleBasedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

/**
 * Componente que protege rotas baseado em roles permitidos
 * Redireciona usuários não autorizados para seus dashboards corretos
 */
export const RoleBasedRoute = ({
    children,
    allowedRoles,
    redirectTo
}: RoleBasedRouteProps) => {
    const [session, setSession] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);

            if (!currentSession?.user) {
                setChecking(false);
                return;
            }

            const role = await getUserRole(currentSession.user.id);
            setUserRole(role);
            setChecking(false);
        };

        checkRole();
    }, []);

    // Aguardar verificação
    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    // Não autenticado - redirecionar para login
    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    // Verificar se o role está permitido
    if (userRole && !allowedRoles.includes(userRole)) {
        // Redirecionar para dashboard correto do usuário
        const redirectPath = redirectTo || getRoleDefaultPath(userRole);
        return <Navigate to={redirectPath} replace />;
    }

    // Autorizado - renderizar conteúdo
    return <>{children}</>;
};

/**
 * Retorna o caminho padrão para cada role
 */
function getRoleDefaultPath(role: string): string {
    switch (role) {
        case 'consultor':
            return '/consultor/indicacao';
        case 'owner':
            return '/painel';
        case 'admin':
            return '/admin';
        case 'motorista':
            return '/motorista';
        case 'monitora':
            return '/monitora';
        case 'responsavel':
            return '/responsavel';
        default:
            return '/';
    }
}
