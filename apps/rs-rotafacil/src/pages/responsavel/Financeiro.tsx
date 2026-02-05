import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsavelLayout } from "@/components/layout/responsavel-layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
    CreditCard,
    QrCode,
    CheckCircle,
    XCircle,
    Calendar,
    MessageSquare,
    DollarSign,
    Receipt
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pagamento {
    id: string;
    aluno_id: string;
    valor: number;
    data_vencimento: string;
    status: 'pago' | 'nao_pago' | 'pendente';
    data_pagamento: string | null;
    mes: number;
    ano: number;
    aluno: {
        nome_completo: string;
        dia_vencimento: number;
    };
}

export default function ResponsavelFinanceiro() {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [pixOpen, setPixOpen] = useState(false);
    const [pixData, setPixData] = useState<any>(null);
    const [loadingPix, setLoadingPix] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadFinanceiro = async () => {
            try {
                setLoading(true);
                // 1. Buscar alunos vinculados ao responsável
                const { data: students, error: studentsError } = await supabase
                    .rpc('get_my_students' as any);

                if (studentsError) throw studentsError;

                if (!students || students.length === 0) {
                    setPagamentos([]);
                    return;
                }

                const studentIds = students.map((s: any) => s.id);

                // 2. Buscar pagamentos desses alunos (Filtro 2026+)
                const { data: payments, error: paymentsError } = await supabase
                    .from('pagamentos_mensais')
                    .select(`
                        *,
                        aluno:aluno_id (
                            nome_completo,
                            dia_vencimento
                        )
                    `)
                    .in('aluno_id', studentIds)
                    .gte('ano', 2026)
                    .order('ano', { ascending: false })
                    .order('mes', { ascending: false });

                if (paymentsError) throw paymentsError;

                setPagamentos((payments as any) || []);
            } catch (err) {
                console.error("Erro ao carregar financeiro:", err);
                toast({
                    title: "Erro",
                    description: "Não foi possível carregar seus pagamentos.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadFinanceiro();
    }, []);

    const handleGerarPix = async (pagamentoId: string) => {
        try {
            setLoadingPix(true);
            const { data, error } = await supabase.functions.invoke('mercado-pago-pix', {
                body: { pagamentoId }
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.error);

            setPixData(data);
            setPixOpen(true);
        } catch (err: any) {
            console.error("Erro ao gerar PIX:", err);
            toast({
                title: "Erro",
                description: err.message || "Não foi possível gerar o código PIX.",
                variant: "destructive"
            });
        } finally {
            setLoadingPix(false);
        }
    };

    const isVencido = (dataVenc: string) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return new Date(dataVenc) < hoje;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getMesNome = (mes: number) => {
        const date = new Date(2026, mes - 1, 1);
        return format(date, 'MMMM', { locale: ptBR });
    };

    // Lógica para garantir que o próximo mês apareça mesmo que não esteja no DB
    const [pagamentosProcessados, setPagamentosProcessados] = useState<any[]>([]);

    useEffect(() => {
        if (loading || pagamentos.length === 0) return;

        const processarPagamentos = async () => {
            const list = [...pagamentos];
            const hoje = new Date();
            const mesAtual = hoje.getMonth() + 1;
            const anoAtual = hoje.getFullYear();

            const proximoMes = (mesAtual + 1) > 12 ? 1 : mesAtual + 1;
            const proximoAno = proximoMes === 1 ? anoAtual + 1 : anoAtual;

            // Buscar alunos para garantir que tenham card do mês atual e próximo
            const { data: students } = await supabase.rpc('get_my_students' as any);

            if (students) {
                (students as any[]).forEach(student => {
                    // 1. Verificar Mês Atual
                    const existeAtual = pagamentos.some(p => p.aluno_id === student.id && p.mes === mesAtual && p.ano === anoAtual);
                    if (!existeAtual) {
                        list.push({
                            id: `curr-${student.id}-${mesAtual}`,
                            aluno_id: student.id,
                            valor: student.valor_mensalidade || 0,
                            data_vencimento: new Date(anoAtual, mesAtual - 1, student.dia_vencimento || 10).toISOString(),
                            status: 'nao_pago',
                            data_pagamento: null,
                            mes: mesAtual,
                            ano: anoAtual,
                            isPrevisao: true,
                            aluno: {
                                nome_completo: student.nome_completo,
                                dia_vencimento: student.dia_vencimento
                            }
                        } as any);
                    }

                    // 2. Verificar Próximo Mês
                    const existeProximo = pagamentos.some(p => p.aluno_id === student.id && p.mes === proximoMes && p.ano === proximoAno);
                    if (!existeProximo) {
                        list.push({
                            id: `prev-${student.id}-${proximoMes}`,
                            aluno_id: student.id,
                            valor: student.valor_mensalidade || 0,
                            data_vencimento: new Date(proximoAno, proximoMes - 1, student.dia_vencimento || 10).toISOString(),
                            status: 'nao_pago',
                            data_pagamento: null,
                            mes: proximoMes,
                            ano: proximoAno,
                            isPrevisao: true,
                            aluno: {
                                nome_completo: student.nome_completo,
                                dia_vencimento: student.dia_vencimento
                            }
                        } as any);
                    }
                });
            }

            setPagamentosProcessados(list);
        };

        processarPagamentos();
    }, [loading, pagamentos]);

    const handleAcaoFinanceira = async (pagamento: any, tipo: 'pix' | 'cartao' | 'whatsapp') => {
        let pagId = pagamento.id;

        // Se for previsão, precisamos criar no DB primeiro
        if (pagamento.isPrevisao) {
            try {
                setLoadingPix(true);
                const { data: novoPag, error } = await supabase
                    .from('pagamentos_mensais')
                    .insert({
                        aluno_id: pagamento.aluno_id,
                        mes: pagamento.mes,
                        ano: pagamento.ano,
                        valor: pagamento.valor,
                        data_vencimento: pagamento.data_vencimento,
                        status: 'nao_pago'
                    })
                    .select()
                    .single();

                if (error) throw error;
                pagId = novoPag.id;

                // Atualizar lista local para não ser mais previsão
                setPagamentos(prev => [novoPag, ...prev]);
            } catch (err) {
                console.error("Erro ao criar mensalidade:", err);
                toast({ title: "Erro", description: "Não foi possível preparar a cobrança.", variant: "destructive" });
                setLoadingPix(false);
                return;
            }
        }

        if (tipo === 'pix') {
            handleGerarPix(pagId);
        } else if (tipo === 'cartao') {
            try {
                setLoadingPix(true);
                const { data, error } = await supabase.functions.invoke('mercado-pago-checkout', {
                    body: { pagamentoId: pagId }
                });
                if (error) throw error;
                if (data?.init_point) {
                    window.open(data.init_point, '_blank');
                }
            } catch (err) {
                toast({ title: "Erro", description: "Falha ao gerar link de cartão." });
            } finally {
                setLoadingPix(false);
            }
        } else if (tipo === 'whatsapp') {
            const msg = `Olá! Gostaria de falar sobre a mensalidade de ${pagamento.aluno.nome_completo} referente a ${getMesNome(pagamento.mes)}/${pagamento.ano}.`;
            window.open(`https://wa.me/55?text=${encodeURIComponent(msg)}`, '_blank');
        }
    };

    const pagPendentes = pagamentosProcessados
        .filter(p => p.status !== 'pago')
        .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

    const historico = pagamentosProcessados.filter(p => p.status === 'pago');

    return (
        <ResponsavelLayout>
            <div className="space-y-8 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic">FINANCEIRO</h1>
                        <p className="text-muted-foreground font-medium">Controle suas mensalidades e realize pagamentos.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-2xl border border-gold/20">
                        <DollarSign className="w-5 h-5 text-gold" />
                        <span className="text-gold font-black italic">SISTEMA PIX ATIVO</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => <Card key={i} className="bg-black-secondary border-gold/10 h-64 animate-pulse rounded-3xl" />)}
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest italic">
                                <span className="w-8 h-1 bg-gold rounded-full" />
                                Mensalidades em Aberto
                            </h2>

                            {pagPendentes.length === 0 ? (
                                <Card className="bg-black-secondary border-gold/10 border-dashed border-2 rounded-3xl">
                                    <CardContent className="p-12 text-center">
                                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h3 className="text-white text-xl font-black uppercase italic">Tudo em dia!</h3>
                                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Não encontramos mensalidades pendentes para seus filhos no momento.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {pagPendentes.map((p) => {
                                        const vencido = isVencido(p.data_vencimento);
                                        return (
                                            <Card key={p.id} className={cn(
                                                "bg-black-secondary border-2 overflow-hidden shadow-2xl relative transition-all hover:scale-[1.02] rounded-3xl",
                                                vencido ? "border-red-500/40" : "border-gold/20",
                                                p.isPrevisao && "opacity-80 border-dashed border-white/20"
                                            )}>
                                                {/* Header do Card */}
                                                <div className={cn(
                                                    "p-4 flex items-center justify-between",
                                                    vencido ? "bg-red-500/20" : "bg-gold/10"
                                                )}>
                                                    <Badge className={cn(
                                                        "font-black italic text-[10px] tracking-widest",
                                                        vencido
                                                            ? "bg-red-500 text-white"
                                                            : p.isPrevisao ? "bg-white/10 text-white" : "bg-gold text-black"
                                                    )}>
                                                        {vencido ? "VENCIDO" : p.isPrevisao ? "AGENDADO" : "PENDENTE"}
                                                    </Badge>
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">
                                                        REF: {getMesNome(p.mes)} / {p.ano}
                                                    </span>
                                                </div>

                                                <CardContent className="p-6 space-y-6">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">A pagar por</p>
                                                        <h3 className="text-white text-lg font-black truncate uppercase italic">{p.aluno?.nome_completo}</h3>
                                                    </div>

                                                    <div className="flex justify-between items-end bg-black-primary/50 p-4 rounded-2xl border border-white/5">
                                                        <div>
                                                            <p className="text-[9px] text-muted-foreground uppercase font-black mb-1">Total</p>
                                                            <p className={cn("text-2xl font-black leading-none", vencido ? "text-red-500" : "text-gold")}>
                                                                {formatCurrency(p.valor)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Calendar className="w-4 h-4 text-white/20 ml-auto mb-1" />
                                                            <p className="text-sm font-bold text-white leading-none">
                                                                {format(new Date(p.data_vencimento), 'dd/MM')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Botões Estilo Painel Admn */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            className="bg-gold text-black font-black italic hover:bg-gold/90 rounded-xl h-12"
                                                            onClick={() => handleAcaoFinanceira(p, 'pix')}
                                                            disabled={loadingPix}
                                                        >
                                                            <QrCode className="w-4 h-4 mr-2" />
                                                            PIX
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="border-white/10 text-white hover:bg-white/5 font-black italic rounded-xl h-12"
                                                            onClick={() => handleAcaoFinanceira(p, 'cartao')}
                                                            disabled={loadingPix}
                                                        >
                                                            <CreditCard className="w-4 h-4 mr-2" />
                                                            CARD
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="col-span-2 text-muted-foreground hover:text-gold hover:bg-gold/5 font-black uppercase text-[10px] h-10"
                                                            onClick={() => handleAcaoFinanceira(p, 'whatsapp')}
                                                        >
                                                            <MessageSquare className="w-3 h-3 mr-2" />
                                                            Falar com Suporte
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Extrato Refinado */}
                        <div className="space-y-6 pt-8">
                            <h2 className="text-xl font-black text-muted-foreground flex items-center gap-3 uppercase tracking-widest italic opacity-50">
                                <span className="w-8 h-1 bg-white/20 rounded-full" />
                                Histórico de Pagamentos
                            </h2>

                            <Card className="bg-black-secondary border-gold/10 overflow-hidden rounded-3xl shadow-2xl">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b border-white/5">
                                                <tr>
                                                    <th className="px-8 py-5">Filho(a)</th>
                                                    <th className="px-8 py-5">Período</th>
                                                    <th className="px-8 py-5">Valor</th>
                                                    <th className="px-8 py-5">Pagamento</th>
                                                    <th className="px-8 py-5 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {historico.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground italic font-medium">
                                                            Nenhum registro encontrado no extrato.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    historico.map((p) => (
                                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-8 py-5">
                                                                <p className="font-black text-white group-hover:text-gold transition-colors italic uppercase">{p.aluno?.nome_completo}</p>
                                                            </td>
                                                            <td className="px-8 py-5 text-muted-foreground uppercase font-bold text-xs tracking-tighter">
                                                                {getMesNome(p.mes)} / {p.ano}
                                                            </td>
                                                            <td className="px-8 py-5 font-black text-white">{formatCurrency(p.valor)}</td>
                                                            <td className="px-8 py-5 text-muted-foreground font-mono text-xs">
                                                                {p.data_pagamento ? format(new Date(p.data_pagamento), 'dd/MM/yyyy') : '-'}
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black uppercase text-[8px] italic tracking-widest p-1 px-3">
                                                                    LIQUIDADO
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Info Card Final */}
                <div className="bg-gradient-to-r from-gold/5 to-transparent border-l-4 border-gold p-8 rounded-3xl flex items-center gap-6 shadow-xl">
                    <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20">
                        <MessageSquare className="w-8 h-8 text-gold" />
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-black italic uppercase tracking-tight">Dúvidas sobre cobranças?</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                            Caso note algum valor incorreto ou precise negociar sua mensalidade, clique no botão de suporte acima ou entre em contato direto.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal PIX */}
            <Dialog open={pixOpen} onOpenChange={setPixOpen}>
                <DialogContent className="max-w-md bg-black-secondary border-gold/20 rounded-2xl p-0 overflow-hidden shadow-2xl">
                    <div className="h-2 bg-gold w-full" />
                    <div className="p-8 flex flex-col items-center">
                        <DialogHeader className="w-full mb-8">
                            <DialogTitle className="text-2xl font-black italic flex items-center justify-center gap-3 text-white">
                                <QrCode className="w-6 h-6 text-gold" />
                                COBRANÇA VIA PIX
                            </DialogTitle>
                        </DialogHeader>

                        {pixData?.qr_code_base64 && (
                            <div className="bg-white p-4 rounded-3xl mb-8 shadow-2xl border-4 border-gold/10">
                                <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48" />
                            </div>
                        )}

                        <div className="w-full space-y-3">
                            <p className="text-[10px] text-muted-foreground uppercase text-center font-black tracking-[0.3em]">Copia e Cola</p>
                            <div className="flex gap-2 bg-black-primary p-2 rounded-2xl border border-gold/10">
                                <Input
                                    readOnly
                                    value={pixData?.qr_code || ""}
                                    className="bg-transparent border-none font-mono text-[10px] h-10 focus-visible:ring-0 text-white"
                                />
                                <Button
                                    className="bg-gold text-black hover:bg-gold/90 h-10 px-4 font-black text-[10px] rounded-xl shrink-0"
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData?.qr_code || "");
                                        toast({ title: "Copiado!", description: "Código PIX pronto para colar." });
                                    }}
                                >
                                    COPIAR
                                </Button>
                            </div>
                        </div>

                        <p className="mt-8 text-[10px] text-muted-foreground italic text-center opacity-60 font-medium max-w-[250px]">
                            O status será atualizado instantaneamente após a confirmação do pagamento.
                        </p>

                        <Button
                            variant="ghost"
                            className="mt-6 text-gold hover:bg-gold/5 font-black uppercase text-xs"
                            onClick={() => setPixOpen(false)}
                        >
                            FECHAR JANELA
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </ResponsavelLayout>
    );
}
