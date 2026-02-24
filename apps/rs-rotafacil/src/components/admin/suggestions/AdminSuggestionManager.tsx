import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    Hammer,
    Filter,
    User,
    ArrowRight,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SuggestionChat } from "@/components/suporte/SuggestionChat";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Suggestion {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_ANALYSIS' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    created_at: string;
    tenant: {
        nome_completo: string;
    };
}

const statusMap = {
    OPEN: { label: 'Aberta', icon: Clock, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    IN_ANALYSIS: { label: 'Em Análise', icon: Search, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    APPROVED: { label: 'Aprovada', icon: CheckCircle2, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
    REJECTED: { label: 'Rejeitada', icon: XCircle, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    IMPLEMENTED: { label: 'Implementada', icon: Hammer, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

export function AdminSuggestionManager() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchGlobalSuggestions();
    }, []);

    const fetchGlobalSuggestions = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as any)
                .from('app_suggestions')
                .select(`
          *,
          tenant:user_profiles (nome_completo)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuggestions(data as any || []);
        } catch (error) {
            console.error('Error fetching global suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await (supabase as any)
                .from('app_suggestions')
                .update({ status: newStatus as any, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filtered = suggestions.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.tenant?.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (selectedId) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-black-secondary p-4 rounded-xl border border-gold/20">
                    <div className="flex flex-wrap gap-2 text-gold">
                        {(Object.keys(statusMap) as Array<keyof typeof statusMap>).map((status) => (
                            <Button
                                key={status}
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(selectedId, status)}
                                className={cn(
                                    "text-[9px] h-7 md:text-xs md:h-8 uppercase font-black border-gold/20",
                                    suggestions.find(s => s.id === selectedId)?.status === status && "bg-gold text-black border-gold"
                                )}
                            >
                                {statusMap[status].label}
                            </Button>
                        ))}
                    </div>
                </div>
                <SuggestionChat suggestionId={selectedId} onBack={() => setSelectedId(null)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40" />
                    <Input
                        placeholder="Buscar por título ou dono..."
                        className="pl-10 bg-black-lighter border-gold/20 text-white rounded-xl h-12 focus:border-gold/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[200px] bg-black-lighter border-gold/20 text-white rounded-xl h-12 outline-none focus:ring-0 focus:ring-offset-0 focus:border-gold/50">
                        <SelectValue placeholder="Filtrar por Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gold/20 text-white">
                        <SelectItem value="all">Todos os Status</SelectItem>
                        {Object.keys(statusMap).map(s => (
                            <SelectItem key={s} value={s}>{statusMap[s as keyof typeof statusMap].label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-3">
                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center p-10 text-slate-500 italic">Nenhuma sugestão para processar.</div>
                ) : (
                    filtered.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => setSelectedId(s.id)}
                            className="group bg-black-secondary border border-gold/10 hover:border-gold/40 hover:bg-black/40 p-4 md:p-5 rounded-2xl transition-all cursor-pointer flex items-center justify-between"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className={cn("text-xs uppercase font-black", statusMap[s.status].color)}>
                                        {statusMap[s.status].label}
                                    </Badge>
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {s.tenant?.nome_completo || 'Dono Desconhecido'}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold group-hover:text-gold transition-colors">{s.title}</h4>
                                <p className="text-slate-400 text-xs line-clamp-1">{s.description}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
