
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import MotoristaIndex from "@/pages/motorista/Index";
import MonitoraIndex from "@/pages/monitora/Index";
import { supabase } from "@/integrations/supabase/client";

export default function VisualizarUsuario() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [userType, setUserType] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Check if type was passed in state or needs fetching
    const typeFromState = location.state?.type;

    useEffect(() => {
        async function fetchUser() {
            if (typeFromState) {
                setUserType(typeFromState);
                setLoading(false);
                return;
            }

            try {
                // Since we are frontend, we use functions.invoke if RLS blocks profile select
                const { data, error } = await supabase.functions.invoke('admin-users-v3', {
                    method: 'GET'
                });

                if (error) throw error;

                const user = data?.users?.find((u: any) => u.id === id);
                if (user) {
                    setUserType(user.tipo_usuario);
                    setUserName(user.nome);
                }
            } catch (err) {
                console.error("Erro ao carregar tipo de usuário para visualização:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [id, typeFromState]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground animate-pulse text-lg">Carregando painel de supervisão...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-20">
            {/* Supervised Header Overlay */}
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center justify-between sticky top-0 z-[60] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/usuarios')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para Usuários
                    </Button>
                    <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">
                            Supervisionando: <span className="font-bold underline">{userName || 'Usuário'}</span> ({userType})
                        </span>
                    </div>
                </div>
                <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50 font-bold animate-pulse">
                    MODO ADMIN
                </Badge>
            </div>

            <div className="mt-4">
                {userType === 'motorista' ? (
                    <MotoristaIndex customUserId={id} />
                ) : userType === 'monitora' ? (
                    <MonitoraIndex customUserId={id} />
                ) : (
                    <div className="p-20 text-center space-y-4">
                        <h2 className="text-2xl font-bold">Tipo de usuário não suportado para visualização</h2>
                        <p className="text-muted-foreground">Apenas painéis de Motorista e Monitora podem ser supervisionados desta forma.</p>
                        <Button onClick={() => navigate('/admin/usuarios')}>Voltar</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Badge } from "@/components/ui/badge";
