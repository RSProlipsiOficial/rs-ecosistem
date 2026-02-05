import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Hammer,
    Filter
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
}

interface SuggestionListProps {
    onSelect: (id: string) => void;
    onNew: () => void;
}

const statusMap = {
    OPEN: { label: 'Aberta', icon: Clock, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    IN_ANALYSIS: { label: 'Em Análise', icon: Search, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    APPROVED: { label: 'Aprovada', icon: CheckCircle2, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
    REJECTED: { label: 'Rejeitada', icon: XCircle, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    IMPLEMENTED: { label: 'Implementada', icon: Hammer, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

const priorityMap = {
    LOW: { label: 'Baixa', color: 'text-gray-400' },
    MEDIUM: { label: 'Média', color: 'text-amber-400' },
    HIGH: { label: 'Alta', color: 'text-red-400 font-bold' },
};

export function SuggestionList({ onSelect, onNew }: SuggestionListProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_suggestions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuggestions(data || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSuggestions = suggestions.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar sugestões..."
                        className="pl-10 bg-black/40 border-white/10 text-white rounded-xl h-12 focus:border-gold/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-[180px] bg-black/40 border-white/10 text-white rounded-xl h-12 outline-none focus:ring-0 focus:ring-offset-0 focus:border-gold/50">
                            <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="OPEN">Abertas</SelectItem>
                            <SelectItem value="IN_ANALYSIS">Em Análise</SelectItem>
                            <SelectItem value="APPROVED">Aprovadas</SelectItem>
                            <SelectItem value="IMPLEMENTED">Implementadas</SelectItem>
                            <SelectItem value="REJECTED">Rejeitadas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={onNew}
                        className="bg-gradient-gold text-black font-bold h-12 rounded-xl px-6 gap-2 flex-1 md:flex-none transform hover:scale-105 transition-all shadow-lg shadow-gold/20"
                    >
                        <Plus className="h-5 w-5" />
                        Nova Sugestão
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
                    ))
                ) : filteredSuggestions.length === 0 ? (
                    <Card className="bg-black/40 border-dashed border-white/10 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg">Nenhuma sugestão encontrada</h3>
                        <p className="text-gray-400 text-sm mt-1">Seja o primeiro a sugerir uma melhoria!</p>
                    </Card>
                ) : (
                    filteredSuggestions.map((suggestion) => {
                        const StatusIcon = statusMap[suggestion.status].icon;
                        const statusStyle = statusMap[suggestion.status];

                        return (
                            <Card
                                key={suggestion.id}
                                onClick={() => onSelect(suggestion.id)}
                                className="bg-[#121212] border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all cursor-pointer rounded-2xl group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn("text-xs uppercase font-black tracking-tighter", statusStyle.color)}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusStyle.label}
                                                </Badge>
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                                    {suggestion.category}
                                                </span>
                                            </div>
                                            <CardTitle className="text-white text-lg group-hover:text-gold transition-colors italic">
                                                {suggestion.title}
                                            </CardTitle>
                                            <p className="text-gray-400 text-sm line-clamp-1">
                                                {suggestion.description}
                                            </p>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className={cn("text-xs font-black uppercase tracking-widest", priorityMap[suggestion.priority].color)}>
                                                Prioridade {priorityMap[suggestion.priority].label}
                                            </span>
                                            <div className="flex items-center text-xs text-gray-500 gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(suggestion.created_at), "dd 'de' MMM", { locale: ptBR })}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
