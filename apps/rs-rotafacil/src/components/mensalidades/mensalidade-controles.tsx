import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Calendar, Search, Filter, RefreshCw, X, ChevronDown,
    Users, GraduationCap, CreditCard, CheckCircle, Clock, UserX
} from "lucide-react";
import { MensalidadeFiltros } from "@/types/mensalidades";
import { supabase } from "@/integrations/supabase/client";

interface Van {
    id: string;
    nome: string;
}

interface Aluno {
    id: string;
    nome_completo: string;
}

interface MensalidadeControlesProps {
    filtros: MensalidadeFiltros;
    onFiltrosChange: (filtros: MensalidadeFiltros) => void;
    onRefresh?: () => void;
    loading?: boolean;
}

export function MensalidadeControles({
    filtros,
    onFiltrosChange,
    onRefresh,
    loading
}: MensalidadeControlesProps) {
    const [vans, setVans] = useState<Van[]>([]);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [colegiosUnicos, setColegiosUnicos] = useState<string[]>([]);
    const [filtrosAbertos, setFiltrosAbertos] = useState(false);

    useEffect(() => {
        fetchVans();
        fetchAlunos();
        fetchColegios();
    }, []);

    const fetchColegios = async () => {
        const { data } = await supabase.from('alunos').select('nome_colegio').eq('ativo', true);
        if (data) {
            const unique = Array.from(new Set(data.map(a => a.nome_colegio))).filter(Boolean).sort() as string[];
            setColegiosUnicos(unique);
        }
    };

    const fetchVans = async () => {
        const { data } = await supabase.from('vans').select('id, nome').order('nome');
        setVans(data || []);
    };

    const fetchAlunos = async () => {
        const { data } = await supabase.from('alunos').select('id, nome_completo').eq('ativo', true).order('nome_completo');
        setAlunos(data || []);
    };

    const meses = [
        { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
        { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
        { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
        { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
    ];

    const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const temFiltrosAtivos =
        filtros.searchTerm ||
        filtros.van_id ||
        filtros.aluno_id ||
        (filtros.colegios && filtros.colegios.length > 0) ||
        (filtros.turnos && filtros.turnos.length > 0) ||
        (Array.isArray(filtros.status) && filtros.status.length > 0) ||
        (filtros.status !== 'todos' && typeof filtros.status === 'string');

    const limparFiltros = () => {
        onFiltrosChange({
            ...filtros,
            searchTerm: "",
            van_id: undefined,
            status: 'todos',
            aluno_id: undefined,
            colegios: [],
            turnos: [],
            showInactive: false
        });
    };

    const toggleFiltro = (campo: 'colegios' | 'turnos' | 'status', valor: string) => {
        const valoresAtuais = (filtros[campo] as string[]) || [];
        const novosValores = valoresAtuais.includes(valor)
            ? valoresAtuais.filter(v => v !== valor)
            : [...valoresAtuais, valor];

        onFiltrosChange({ ...filtros, [campo]: novosValores });
    };

    const isSelected = (campo: 'colegios' | 'turnos' | 'status', valor: string) => {
        const valoresAtuais = filtros[campo];
        if (Array.isArray(valoresAtuais)) {
            return valoresAtuais.includes(valor);
        }
        return valoresAtuais === valor;
    };

    const FilterCircle = ({ selected }: { selected: boolean }) => (
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${selected ? 'border-gold bg-gold/20' : 'border-gold/30 bg-transparent'}`}>
            {selected && <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />}
        </div>
    );

    return (
        <Card className="bg-black/20 border-white/10 overflow-hidden shadow-elegant">
            <CardHeader className="py-3 px-4 border-b border-sidebar-border/50 bg-black-secondary/30">
                <CardTitle className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider sm:tracking-widest text-gold italic">
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Controles da Lista</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 bg-black/40">
                <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Mês e Ano como "Data" */}
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Período (Mês)</Label>
                            <Select
                                value={filtros.mes.toString()}
                                onValueChange={(v) => onFiltrosChange({ ...filtros, mes: parseInt(v) })}
                            >
                                <SelectTrigger className="h-10 bg-black-secondary border-gold/20 text-gold text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-gold/20">
                                    {meses.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-1 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Ano</Label>
                            <Select
                                value={filtros.ano.toString()}
                                onValueChange={(v) => onFiltrosChange({ ...filtros, ano: parseInt(v) })}
                            >
                                <SelectTrigger className="h-10 bg-black-secondary border-gold/20 text-gold text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-gold/20">
                                    {anos.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-6 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Buscar Aluno ou Colégio</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                                <Input
                                    placeholder="Nome do aluno, colégio ou responsável..."
                                    value={filtros.searchTerm || ""}
                                    onChange={(e) => onFiltrosChange({ ...filtros, searchTerm: e.target.value })}
                                    className="h-10 bg-black-secondary border-gold/20 text-gold placeholder:text-gold/20 text-xs focus:border-gold/50 transition-all pl-9"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-3">
                            <Button
                                onClick={onRefresh}
                                disabled={loading}
                                className="w-full h-10 gap-2 bg-gold hover:bg-gold/90 text-black font-black uppercase text-[10px] tracking-widest shadow-gold-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Atualizar
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                        <div className="flex gap-2">
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest border-gold/20 text-white hover:bg-gold/5 hover:border-gold/40 transition-all">
                                    <Filter className="h-3.5 w-3.5 text-gold" />
                                    Filtros Avançados
                                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${filtrosAbertos ? 'rotate-180' : ''}`} />
                                </Button>
                            </CollapsibleTrigger>

                            {/* Botão Alunos solicitado */}
                            <Select
                                value={filtros.aluno_id || "todos"}
                                onValueChange={(v) => onFiltrosChange({ ...filtros, aluno_id: v === "todos" ? undefined : v })}
                            >
                                <SelectTrigger className="h-9 w-auto min-w-[120px] gap-2 text-[10px] font-black uppercase tracking-widest border-gold/20 text-white hover:bg-gold/5 hover:border-gold/40 transition-all bg-transparent">
                                    <GraduationCap className="h-3.5 w-3.5 text-gold" />
                                    <SelectValue placeholder="Alunos" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-gold/20">
                                    <SelectItem value="todos">Todos os Alunos</SelectItem>
                                    {alunos.map(a => <SelectItem key={a.id} value={a.id}>{a.nome_completo}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={() => onFiltrosChange({ ...filtros, showInactive: !filtros.showInactive })}
                                className={`h-9 gap-2 text-[10px] font-black uppercase tracking-widest border-gold/20 transition-all ${filtros.showInactive ? 'bg-gold text-black hover:bg-gold/80' : 'text-white hover:bg-gold/5'}`}
                            >
                                <UserX className="h-3.5 w-3.5" />
                                {filtros.showInactive ? 'Ocultar Inativos' : 'Mostrar Inativos'}
                            </Button>
                        </div>

                        {temFiltrosAtivos && (
                            <Button variant="outline" size="sm" onClick={limparFiltros} className="h-8 gap-2 text-[10px] uppercase font-bold text-red-500 border-red-500/20 hover:bg-red-500/10 transition-all">
                                <X className="h-3.5 w-3.5" />
                                Limpar Filtros
                            </Button>
                        )}
                    </div>

                    <CollapsibleContent className="space-y-8 pt-6 border-t border-white/5 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Colégios */}
                        <div className="space-y-4">
                            <Label className="text-gray-300 font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                                <div className="w-1 h-3 bg-gold rounded-full" />
                                Colégios
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {colegiosUnicos.map((colegio) => (
                                    <button
                                        key={colegio}
                                        onClick={() => toggleFiltro('colegios', colegio)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${isSelected('colegios', colegio)
                                            ? 'bg-gold/10 border-gold/40 shadow-gold-sm'
                                            : 'bg-black/20 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <FilterCircle selected={isSelected('colegios', colegio)} />
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected('colegios', colegio) ? 'text-gold' : 'text-gray-400'}`}>
                                            {colegio}
                                        </span>
                                    </button>
                                ))}
                                {colegiosUnicos.length === 0 && (
                                    <p className="text-[10px] text-gray-500 italic">Nenhum colégio identificado.</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Turnos */}
                            <div className="space-y-4">
                                <Label className="text-gray-300 font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1 h-3 bg-gold rounded-full" />
                                    Turnos
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Manhã', 'Tarde', 'Integral', 'Noite'].map((turno) => (
                                        <button
                                            key={turno}
                                            onClick={() => toggleFiltro('turnos', turno)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${isSelected('turnos', turno)
                                                ? 'bg-gold/10 border-gold/40 shadow-gold-sm'
                                                : 'bg-black/20 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <FilterCircle selected={isSelected('turnos', turno)} />
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected('turnos', turno) ? 'text-gold' : 'text-gray-400'}`}>
                                                {turno}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status de Pagamento */}
                            <div className="space-y-4">
                                <Label className="text-gray-300 font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1 h-3 bg-gold rounded-full" />
                                    Status de Pagamento
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'pagos', label: '✅ Pagos' },
                                        { id: 'pendentes', label: '⏳ Pendentes' }
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => toggleFiltro('status', s.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${isSelected('status', s.id)
                                                ? 'bg-gold/10 border-gold/40 shadow-gold-sm'
                                                : 'bg-black/20 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <FilterCircle selected={isSelected('status', s.id)} />
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected('status', s.id) ? 'text-gold' : 'text-gray-400'}`}>
                                                {s.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Vans e Outros se necessário */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <Label className="text-gray-300 font-black uppercase text-[10px] tracking-[0.2em]">Filtrar por Van</Label>
                            <Select
                                value={filtros.van_id || "todas"}
                                onValueChange={(v) => onFiltrosChange({ ...filtros, van_id: v === "todas" ? undefined : v })}
                            >
                                <SelectTrigger className="bg-black/20 border-white/5 h-12 text-xs text-gold font-bold">
                                    <SelectValue placeholder="Todas as Vans" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-white/10">
                                    <SelectItem value="todas">Todas as Vans</SelectItem>
                                    {vans.map(v => <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
