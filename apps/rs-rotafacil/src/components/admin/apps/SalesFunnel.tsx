import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Users,
    DollarSign,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Send,
    Ban,
    Skull,
    ShieldAlert,
    TrendingUp,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, isToday, isBefore, parseISO, format } from "date-fns";

interface User {
    id: string;
    email: string;
    created_at?: string;
    user_metadata?: {
        name?: string;
        phone?: string;
    };
    subscription?: {
        status: string;
        plan_name: string;
        plan_price: number;
        expires_at: string;
    };
}

interface FunilProps {
    users: User[];
    onCobrar: (user: User) => void;
    onFeedback: (userId: string) => void;
}

const COLUMNS = [
    { id: 'em_dia', label: 'Em Dia', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
    { id: 'vence_hoje', label: 'Vence Hoje', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
    { id: 'atraso_curto', label: 'Atraso 1-3d', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Zap },
    { id: 'atraso_medio', label: 'Atraso 4-7d', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: AlertTriangle },
    { id: 'atraso_longo', label: 'Atraso 8-15d', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Skull },
    { id: 'atraso_critico', label: 'Atraso 16d+', color: 'bg-red-900/20 text-red-600 border-red-900/30', icon: Ban },
    { id: 'suspenso', label: 'Suspenso', color: 'bg-slate-800 text-slate-400 border-slate-700', icon: ShieldAlert }
];

export function SalesFunnel({ users, onCobrar, onFeedback }: FunilProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    const funnelData = useMemo(() => {
        const categories: Record<string, User[]> = {
            em_dia: [],
            vence_hoje: [],
            atraso_curto: [],
            atraso_medio: [],
            atraso_longo: [],
            atraso_critico: [],
            suspenso: []
        };

        const list = users.filter(user => {
            const expiresAt = user.subscription?.expires_at ? parseISO(user.subscription.expires_at) : null;
            let status = 'em_dia';

            if (user.subscription?.status === 'suspended') {
                status = 'suspenso';
            } else if (expiresAt) {
                const daysDiff = differenceInDays(new Date(), expiresAt);
                if (isToday(expiresAt)) {
                    status = 'vence_hoje';
                } else if (isBefore(new Date(), expiresAt)) {
                    status = 'em_dia';
                } else if (daysDiff <= 3) {
                    status = 'atraso_curto';
                } else if (daysDiff <= 7) {
                    status = 'atraso_medio';
                } else if (daysDiff <= 15) {
                    status = 'atraso_longo';
                } else {
                    status = 'atraso_critico';
                }
            }

            categories[status].push(user);
            return selectedStatus === "all" || status === selectedStatus;
        });

        return { list, categories };
    }, [users, selectedStatus]);

    return (
        <div className="space-y-6 p-4 md:p-6 pb-2">
            {/* Status Filter Cards */}
            <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide px-1">
                <button
                    onClick={() => setSelectedStatus("all")}
                    className={cn(
                        "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-black uppercase tracking-tight italic text-[11px]",
                        selectedStatus === "all"
                            ? "bg-gold border-gold text-black shadow-lg shadow-gold/20"
                            : "bg-black/40 border-gold/10 text-gold/60 hover:border-gold/30"
                    )}
                >
                    TODOS
                    <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                        selectedStatus === "all" ? "bg-black text-gold" : "bg-gold text-black"
                    )}>
                        {users.length}
                    </span>
                </button>

                {COLUMNS.map((col) => (
                    <button
                        key={col.id}
                        onClick={() => setSelectedStatus(col.id)}
                        className={cn(
                            "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-black uppercase tracking-tight italic text-[11px]",
                            selectedStatus === col.id
                                ? col.id === 'em_dia' ? "bg-white border-white text-black" : "bg-gold border-gold text-black"
                                : "bg-black/40 border-gold/10 text-slate-500 hover:border-gold/30"
                        )}
                    >
                        {col.label}
                        <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                            selectedStatus === col.id ? "bg-black text-white" : "bg-white/10 text-white"
                        )}>
                            {funnelData.categories[col.id].length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Grid of User Cards */}
            {funnelData.list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-black/20 rounded-3xl border border-dashed border-gold/10">
                    <Users className="w-12 h-12 mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-widest text-xs">Nenhum cliente nesta categoria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {funnelData.list.map((user) => (
                        <Card key={user.id} className="bg-slate-900/60 border-slate-800 hover:border-gold/30 transition-all group overflow-hidden relative shadow-lg">
                            <CardHeader className="p-3 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gold/10 border border-gold/20 shrink-0">
                                        <span className="text-gold font-black text-[12px]">
                                            {user.user_metadata?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-black text-[11px] truncate uppercase tracking-tight italic">
                                            {user.user_metadata?.name || 'Sem Nome'}
                                        </h4>
                                        <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 border-gold/10 text-slate-500 font-black uppercase mt-0.5">
                                            {user.subscription?.plan_name?.split(' ')[0] || 'Plano'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-3 pt-0 space-y-3">
                                <div className="bg-black/60 px-2 py-2 rounded-lg border border-gold/5 flex justify-between items-center text-[10px]">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-slate-500 font-bold uppercase tracking-tight text-[8px]">Valor</span>
                                        <span className="text-gold font-black text-[11px]">R${user.subscription?.plan_price || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-slate-500 font-bold uppercase tracking-tight text-[8px]">Vencimento</span>
                                        <span className="text-slate-300 font-black text-[11px]">
                                            {user.subscription?.expires_at ? format(parseISO(user.subscription.expires_at), 'dd/MM') : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 h-9 text-[10px] bg-green-600 hover:bg-green-700 text-white font-black uppercase rounded-lg gap-2"
                                        onClick={() => onCobrar(user)}
                                    >
                                        <Zap className="w-3 h-3 text-white/80" />
                                        Cobrar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 h-9 text-[10px] border-slate-700 bg-slate-800/10 text-slate-400 font-black uppercase rounded-lg hover:border-gold/30 hover:text-gold transition-all"
                                        onClick={() => onFeedback(user.id)}
                                    >
                                        Feedback
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
