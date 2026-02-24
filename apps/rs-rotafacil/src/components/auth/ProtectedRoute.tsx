import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    onlyAdmin?: boolean;
}

const ProtectedRoute = ({ onlyAdmin = false }: ProtectedRouteProps) => {
    const { loading, isAuthenticated, user } = useAuth({ requireAuth: false });
    const location = useLocation();

    const isDemoMode = localStorage.getItem('rs_demo_mode') === 'true';
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Se estiver tentando acessar o admin, limpamos o modo demo para evitar conflitos
    if (isAdminRoute && isDemoMode) {
        localStorage.removeItem('rs_demo_mode');
    }

    if (loading && !isDemoMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d0e12]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#fbbf24] mx-auto mb-4" />
                    <p className="text-[#94a3b8] font-medium animate-pulse">Verificando credenciais...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && !isDemoMode) {
        // Redirect to auth page but save the attempt location
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Admin and Master roles can access admin routes
    const userType = (user?.user_metadata?.user_type || '').toLowerCase();
    const isAdmin = userType === 'admin' || userType === 'master';

    // JAIL LOGIC: Consultor strict redirect
    // Se for consultor, SÓ PODE acessar /consultor, /perfil e /suporte
    const role = user?.user_metadata?.tipo_usuario || user?.user_metadata?.user_type;

    console.log("ProtectedRoute Debug:", {
        role,
        path: location.pathname,
        metadata: user?.user_metadata,
        email: user?.email
    });

    if (role === 'consultor') {
        const allowedPaths = ['/consultor', '/perfil', '/suporte'];
        const isAllowed = allowedPaths.some(path => location.pathname.startsWith(path));

        if (!isAllowed) {
            console.warn("BLOCKED! Consultor tried to access:", location.pathname);
            return <Navigate to="/consultor/indicacao" replace />;
        }
    }

    if (role === 'responsavel') {
        const allowedPaths = ['/responsavel', '/familia', '/perfil', '/suporte'];
        const isAllowed = allowedPaths.some(path => location.pathname.startsWith(path));

        if (!isAllowed) {
            console.warn("BLOCKED! Responsavel tried to access:", location.pathname);
            return <Navigate to="/responsavel" replace />;
        }
    }

    if (onlyAdmin) {
        // Modo demo NUNCA acessa admin
        if (isDemoMode && !isAuthenticated) {
            return <Navigate to="/admin/login" replace />;
        }

        if (!isAdmin) {
            console.warn("Access denied: User is not an admin", user?.user_metadata?.user_type);
            return <Navigate to="/app" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
