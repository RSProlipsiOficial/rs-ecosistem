import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw, QrCode, Check, CreditCard, Plus,
  CheckCircle, Trash2, Search, Wallet, Users, ExternalLink, Calendar, User, Clock,
  Car, MessageSquare, Edit, Save, X, Tag, FileText, DollarSign, FileSpreadsheet
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LancamentoFinanceiro, ResumoFinanceiro } from "@/types/financeiro";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { FinanceiroEditForm } from "./financeiro-edit-form";

interface GanhosSectionProps {
  lancamentos: LancamentoFinanceiro[];
  resumo: ResumoFinanceiro;
  onMarcarRealizado: (id: string) => Promise<void>;
  onCriarLancamento: (data: any) => Promise<any>;
  onEditarLancamento?: (id: string, data: any) => Promise<any>;
  onDeleteLancamento: (id: string) => Promise<void>;
  onGerarMensalidades: () => Promise<void>;
  onLimparPendencias?: () => Promise<void>;
  onGerarPix: (id: string) => Promise<any>;
  onGerarCheckout: (id: string) => Promise<any>;
  onAtualizarStatus: (id: string, novoStatus: 'pago' | 'pendente') => Promise<void>;
  onRefresh?: () => Promise<void>;
  itemToOpen?: string;
  onExport?: () => void;
}

export function GanhosSection({
  lancamentos,
  resumo,
  onMarcarRealizado,
  onCriarLancamento,
  onEditarLancamento,
  onDeleteLancamento,
  onGerarMensalidades,
  onLimparPendencias,
  onGerarPix,
  onGerarCheckout,
  onAtualizarStatus,
  onRefresh,
  itemToOpen,
  onExport
}: GanhosSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLancamento, setSelectedLancamento] = useState<LancamentoFinanceiro | null>(null);
  const [pixData, setPixData] = useState<{ qr_code: string, qr_code_base64: string } | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [extraDetailsOpen, setExtraDetailsOpen] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState<LancamentoFinanceiro | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    valor: "",
    data_evento: "",
    categoria: "",
    descricao: "",
    alocacao: "empresa" as "empresa" | "dono",
    pagamento_status: "pago" as "pago" | "pendente",
    observacoes: ""
  });
  const [pixOpen, setPixOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Carregar configurações de juros do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('user_profiles')
            .select('juros_tipo, juros_valor_multa, juros_valor_dia, juros_percentual_multa, juros_percentual_mes')
            .eq('user_id', user.id)
            .maybeSingle();
          if (data) setProfile(data);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    };
    loadProfile();
  }, []);

  // Abrir dialog automaticamente quando itemToOpen é fornecido
  useEffect(() => {
    if (itemToOpen && lancamentos.length > 0) {
      const item = lancamentos.find(l => l.id === itemToOpen);
      if (item) {
        setSelectedLancamento(item);
        setDetailsOpen(true);
      }
    }
  }, [itemToOpen, lancamentos]);

  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // FILTRO SEGURO CONTRA NULOS
  const filteredLancamentos = useMemo(() => {
    const list = Array.isArray(lancamentos) ? lancamentos : [];
    if (!searchTerm) return list;
    const search = searchTerm.toLowerCase();
    return list.filter(l => {
      if (!l) return false;
      const desc = (l.descricao || "").toLowerCase();
      const nome = (l.aluno?.nome_completo || "").toLowerCase();
      return desc.includes(search) || nome.includes(search);
    });
  }, [lancamentos, searchTerm]);

  const receitasMensalidades = useMemo(() => {
    return filteredLancamentos.filter(l => l && l.tipo === 'receita' && l.origem === 'mensalidade');
  }, [filteredLancamentos]);

  // AGRUPAMENTO PREMIUM (VAN > TURNO)
  const agrupamentoMensalidades = useMemo(() => {
    const grupos: { [van: string]: { [turno: string]: LancamentoFinanceiro[] } } = {};
    if (!receitasMensalidades.length) return grupos;

    receitasMensalidades.forEach(m => {
      if (!m) return;
      const vanNome = m.aluno?.vans?.nome || 'Sem Van';
      const turno = m.aluno?.turno || 'Sem Turno';

      if (!grupos[vanNome]) grupos[vanNome] = {};
      if (!grupos[vanNome][turno]) grupos[vanNome][turno] = [];
      grupos[vanNome][turno].push(m);
    });

    // Ordenação alfabética segura
    try {
      Object.keys(grupos).forEach(van => {
        Object.keys(grupos[van]).forEach(t => {
          grupos[van][t].sort((a, b) => {
            const nomeA = (a.aluno?.nome_completo || "").toLowerCase();
            const nomeB = (b.aluno?.nome_completo || "").toLowerCase();
            return nomeA.localeCompare(nomeB);
          });
        });
      });
    } catch (e) {
      console.error("Erro na ordenação:", e);
    }

    return grupos;
  }, [receitasMensalidades]);

  const handleGerarPix = async (id: string, l: LancamentoFinanceiro) => {
    try {
      setLoadingAction(`pix-${id}`);
      setSelectedLancamento(l);
      const data = await onGerarPix(id);
      if (data) {
        setPixData(data);
        setPixOpen(true);
      }
    } catch (error: any) {
      toast({ title: "Erro ao gerar PIX", description: error.message, variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarcarRealizado = async (id: string) => {
    try {
      setLoadingAction(`pago-${id}`);
      await onMarcarRealizado(id);
      toast({ title: "Sucesso", description: "Lançamento marcado como pago!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  // Função para calcular juros por atraso
  const calcularJuros = (lancamento: LancamentoFinanceiro) => {
    const valorOriginal = Number(lancamento.valor) || 0;

    // Se não tem aluno ou dia de vencimento, usa a data_evento como fallback
    if (!lancamento.aluno?.dia_vencimento && !lancamento.data_evento) {
      return { diasAtraso: 0, multa: 0, juros: 0, valorTotal: valorOriginal };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let vencimento: Date;

    // Priorizar dia_vencimento do aluno
    if (lancamento.aluno?.dia_vencimento) {
      const diaVenc = lancamento.aluno.dia_vencimento;
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      // Criar data de vencimento do mês atual
      vencimento = new Date(anoAtual, mesAtual, diaVenc);
      vencimento.setHours(0, 0, 0, 0);

      // Se o vencimento ainda não chegou neste mês, usar o mês anterior
      if (vencimento > hoje) {
        vencimento = new Date(anoAtual, mesAtual - 1, diaVenc);
        vencimento.setHours(0, 0, 0, 0);
      }
    } else {
      // Fallback: usar data_evento
      vencimento = new Date(lancamento.data_evento!);
      vencimento.setHours(0, 0, 0, 0);
    }

    const diffTime = hoje.getTime() - vencimento.getTime();
    const diasAtraso = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    console.log('DEBUG JUROS:', {
      hoje: hoje.toISOString(),
      vencimento: vencimento.toISOString(),
      diaVencimentoAluno: lancamento.aluno?.dia_vencimento,
      diffTime,
      diasAtraso,
      valorOriginal
    });

    if (diasAtraso <= 0) return { diasAtraso: 0, multa: 0, juros: 0, valorTotal: valorOriginal };

    let multa = 0;
    let juros = 0;
    const type = profile?.juros_tipo || 'valor';

    if (type === 'valor') {
      multa = Number(profile?.juros_valor_multa) || 10;
      const jurosDia = Number(profile?.juros_valor_dia) || 2;
      juros = diasAtraso * jurosDia;
      console.log('JUROS VALOR:', { multa, jurosDia, diasAtraso, juros });
    } else {
      const multaPerc = Number(profile?.juros_percentual_multa) || 2;
      const jurosMesPerc = Number(profile?.juros_percentual_mes) || 1;

      multa = (valorOriginal * multaPerc) / 100;
      const taxaDiaria = (jurosMesPerc / 30) / 100;
      juros = valorOriginal * taxaDiaria * diasAtraso;
      console.log('JUROS PERCENTUAL:', { multaPerc, jurosMesPerc, taxaDiaria, diasAtraso, juros });
    }

    const valorTotal = valorOriginal + multa + juros;

    return { diasAtraso, multa, juros, valorTotal };
  };

  // Função para enviar PIX via WhatsApp
  const handleEnviarWhatsApp = async (lancamento: LancamentoFinanceiro) => {
    try {
      setLoadingAction(`whatsapp-${lancamento.id}`);

      // Calcular juros
      const { diasAtraso, juros, valorTotal } = calcularJuros(lancamento);

      // Gerar PIX com valor atualizado
      const data = await onGerarPix(lancamento.id);

      if (!data?.qr_code) {
        throw new Error("Erro ao gerar código PIX");
      }

      const nomeAluno = lancamento.aluno?.nome_completo || "Aluno";
      const whatsapp = lancamento.aluno?.whatsapp_responsavel;

      if (!whatsapp) {
        toast({
          title: "WhatsApp não encontrado",
          description: `O aluno ${nomeAluno} não possui WhatsApp cadastrado.`,
          variant: "destructive"
        });
        return;
      }

      // Formatar mensagem
      const dataVenc = lancamento.data_evento ? new Date(lancamento.data_evento).toLocaleDateString('pt-BR') : '-';
      const valorOriginalFmt = formatCurrency(lancamento.valor);
      const { multa } = calcularJuros(lancamento);
      const multaFmt = formatCurrency(multa);
      const jurosFmt = formatCurrency(juros);
      const valorTotalFmt = formatCurrency(valorTotal);

      const labelJuros = profile?.juros_tipo === 'percentual'
        ? `Juros (${profile.juros_percentual_mes}%/mês)`
        : `Juros (R$ ${profile?.juros_valor_dia || 2}/dia)`;

      const mensagem = diasAtraso > 0
        ? `Olá! 👋\n\nIdentificamos pendência na mensalidade de *${nomeAluno}*.\n\n📅 *Vencimento:* ${dataVenc}\n💰 *Valor Original:* ${valorOriginalFmt}\n⏰ *Dias de Atraso:* ${diasAtraso} dias\n💸 *Multa:* ${multaFmt}\n📊 *${labelJuros}:* ${jurosFmt}\n💳 *VALOR TOTAL:* ${valorTotalFmt}\n\n🔗 *Link de Pagamento PIX (Copie e Cole):*\n${data.qr_code}\n\nQualquer dúvida, estamos à disposição! 🚐`
        : `Olá! 👋\n\nLembrete de mensalidade de *${nomeAluno}*.\n\n📅 *Vencimento:* ${dataVenc}\n💰 *Valor:* ${valorOriginalFmt}\n\n🔗 *Link de Pagamento PIX (Copie e Cole):*\n${data.qr_code}\n\nObrigado! 🚐`;

      // Limpar e formatar WhatsApp
      const whatsappLimpo = whatsapp.replace(/\D/g, '');
      const whatsappFormatado = whatsappLimpo.startsWith('55') ? whatsappLimpo : `55${whatsappLimpo}`;

      // Abrir WhatsApp
      const urlWhatsApp = `https://wa.me/${whatsappFormatado}?text=${encodeURIComponent(mensagem)}`;
      window.open(urlWhatsApp, '_blank');

      toast({
        title: "WhatsApp aberto!",
        description: diasAtraso > 0
          ? `Cobrança com juros de ${jurosFmt} calculada.`
          : "Mensagem de cobrança preparada."
      });

      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro ao enviar WhatsApp",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!onEditarLancamento) return;
    const target = selectedLancamento || selectedExtra;
    if (!target) return;

    try {
      setLoadingAction(`save-${target.id}`);
      await onEditarLancamento(target.id, {
        ...data,
        valor: parseFloat(data.valor)
      });
      toast({ title: "Sucesso", description: "Lançamento atualizado com sucesso!" });
      setDetailsOpen(false);
      setExtraDetailsOpen(false);
      setIsEditing(false);
      if (onRefresh) await onRefresh();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const startEditing = (l: LancamentoFinanceiro) => {
    setEditForm({
      valor: l.valor.toString(),
      data_evento: l.data_evento ? new Date(l.data_evento).toISOString().split('T')[0] : "",
      categoria: l.categoria || "",
      descricao: l.descricao || "",
      alocacao: l.alocacao as any || "empresa",
      pagamento_status: l.pagamento_status as any || "pago",
      observacoes: (l as any).observacoes || ""
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações Premium */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground tracking-tight">Centro de Receitas</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Gestão de Mensalidades</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno ou recibo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-none h-11 focus-visible:ring-gold/50 rounded-xl"
            />
          </div>
          <Button
            onClick={onExport}
            variant="outline"
            className="bg-green-600/10 border-green-500/30 text-green-500 hover:bg-green-500/20 h-11 px-4 rounded-xl font-bold"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button
            onClick={() => onRefresh && onRefresh()}
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10 h-11 px-4 rounded-xl font-bold"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button
            onClick={() => {
              if (window.confirm("TEM CERTEZA? Isso excluirá todas as mensalidades PENDENTES deste mês para que você possa gerar novamente. Pagamentos já realizados não serão afetados.")) {
                onLimparPendencias && onLimparPendencias();
              }
            }}
            variant="outline"
            className="border-red-500/30 text-red-500 hover:bg-red-500/10 h-11 px-4 rounded-xl font-bold"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar Mês
          </Button>
          <Button
            onClick={onGerarMensalidades}
            className="bg-gold text-black hover:bg-gold/90 border-none shadow-xl shadow-gold/20 h-11 px-6 rounded-xl font-black italic tracking-tighter"
          >
            <Plus className="mr-2 h-5 w-5" />
            GERAR COBRANÇAS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Mensalidades por Van */}
        <Card className="lg:col-span-2 bg-card border-border shadow-xl rounded-2xl overflow-hidden border-b-4 border-b-gold/20">
          <CardHeader className="pb-4 bg-muted/10 border-b border-border/50">
            <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg font-black italic">
              <Users className="w-5 h-5 text-gold" />
              RECEBIMENTOS POR VAN
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {Object.keys(agrupamentoMensalidades).length > 0 ? (
              <Accordion type="multiple" defaultValue={Object.keys(agrupamentoMensalidades)} className="w-full">
                {Object.entries(agrupamentoMensalidades).map(([van, turnos]) => (
                  <AccordionItem value={van} key={van} className="border-b border-border/50 px-4 last:border-none">
                    <AccordionTrigger className="hover:no-underline py-5 group">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gold rounded-full mr-1 group-data-[state=open]:h-10 transition-all" />
                        <div className="text-left">
                          <span className="text-sm md:text-md font-black text-foreground uppercase tracking-tight">{van}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] bg-gold/5 text-gold border-gold/20 font-bold">
                              {Object.values(turnos).flat().length} ALUNOS
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      {Object.entries(turnos).map(([turno, lista]) => (
                        <div key={turno} className="mb-6 last:mb-0">
                          <div className="flex items-center gap-3 mb-3 bg-muted/30 p-2 rounded-xl border border-border/20">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{turno}</h4>
                            <div className="h-px bg-gold/20 flex-grow" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {lista.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => {
                                  setSelectedLancamento(m);
                                  setDetailsOpen(true);
                                }}
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/5 hover:bg-gold/[0.04] transition-all group/item border-l-4 border-l-gold/30 cursor-pointer"
                              >
                                <div className="flex-1 min-w-0 pr-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black text-foreground truncate uppercase">{m.aluno?.nome_completo || "Sem Nome"}</span>
                                    {m.pagamento_status === 'pago' ? (
                                      <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-green-500" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <Clock className="w-2.5 h-2.5 text-yellow-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] font-bold">
                                    <span className="text-gold tracking-tight">{formatCurrency(m.valor)}</span>
                                    <span className="text-muted-foreground uppercase opacity-40">[{m.data_evento ? new Date(m.data_evento).toLocaleDateString('pt-BR') : '-'}]</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className={`h-5 text-[8px] px-1.5 font-black uppercase ${m.pagamento_status === 'pago' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'}`}>
                                    {m.pagamento_status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-border">
                  <Search className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-50">Silêncio no caixa...</p>
                <p className="text-[10px] text-muted-foreground/60 uppercase mt-1">Nenhuma fatura encontrada neste mês.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lado Direito: Outras Receitas */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-xl rounded-2xl border-t-4 border-t-gold/30">
            <CardHeader className="pb-4 border-b border-border/50 bg-muted/5">
              <CardTitle className="text-xs font-black flex items-center gap-2 uppercase italic tracking-widest">
                <Plus className="w-4 h-4 text-gold" /> Ganhos Avulsos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                <div className="divide-y divide-border/30">
                  {filteredLancamentos
                    .filter(l => l.tipo === 'receita' && l.origem !== 'mensalidade')
                    .map(l => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setSelectedExtra(l);
                          setExtraDetailsOpen(true);
                        }}
                        className="p-4 hover:bg-muted/30 transition-all flex justify-between items-center group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{l.descricao}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[9px] text-muted-foreground font-bold">{l.data_evento ? new Date(l.data_evento).toLocaleDateString() : '-'}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-gold tracking-tighter">{formatCurrency(l.valor)}</p>
                          <Badge variant="outline" className={`h-4 text-[8px] px-1.5 font-black uppercase ${l.pagamento_status === 'pago' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'}`}>
                            {l.pagamento_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {filteredLancamentos.filter(l => l.tipo === 'receita' && l.origem !== 'mensalidade').length === 0 && (
                    <div className="py-20 text-center opacity-30 italic">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Sem registros extras</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 bg-muted/10 border-t border-border/50">
                <Button
                  className="w-full h-10 text-[10px] font-black uppercase tracking-widest bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-xl transition-all"
                  variant="outline"
                  onClick={() => navigate('/financeiro/novo-lancamento?tipo=receita')}
                >
                  <Plus className="w-3 h-3 mr-2" /> Nova Entrada Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={(open) => {
        setDetailsOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className={`${isEditing ? 'max-w-2xl' : 'max-w-md'} bg-card border-border rounded-2xl overflow-hidden p-0 border-gold/20 shadow-2xl transition-all duration-300`}>
          <div className="h-2 bg-gold w-full" />
          <div className="p-6">
            <DialogHeader className="mb-6 flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-black italic flex items-center gap-3">
                <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                  <User className="w-5 h-5 text-black" />
                </div>
                {isEditing ? 'EDITAR RECEBIMENTO' : 'DETALHES DO RECEBIMENTO'}
              </DialogTitle>
              {!isEditing && selectedLancamento && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(selectedLancamento)}
                  className="h-8 px-2 text-gold hover:bg-gold/10 font-bold"
                >
                  <Edit className="w-4 h-4 mr-1" /> Editar
                </Button>
              )}
            </DialogHeader>

            {selectedLancamento && (
              <div className="space-y-6">
                {isEditing ? (
                  <FinanceiroEditForm
                    tipo="receita"
                    initialData={selectedLancamento}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                    loading={loadingAction === `save-${selectedLancamento.id}`}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Valor do Título</p>
                        <p className="text-xl font-black text-gold tracking-tighter">{formatCurrency(selectedLancamento.valor)}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Status Atual</p>
                        <Badge className={`h-6 px-3 text-[10px] font-black uppercase ${selectedLancamento.pagamento_status === 'pago' ? "bg-green-500" : "bg-yellow-500"}`}>
                          {selectedLancamento.pagamento_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-muted/10 p-4 rounded-2xl border border-border/30 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Vencimento</span>
                        <span className="font-black">{selectedLancamento.data_evento ? new Date(selectedLancamento.data_evento).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {selectedLancamento.aluno && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-bold uppercase tracking-tighter">Aluno Principal</span>
                          <span className="font-black text-gold">{selectedLancamento.aluno.nome_completo}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start text-xs pt-2 border-t border-border/30">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Descrição</span>
                        <span className="font-medium text-right max-w-[200px]">{selectedLancamento.descricao}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {selectedLancamento.pagamento_status === 'pendente' && (
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            className="bg-gold text-black hover:bg-gold/90 h-12 rounded-xl font-black shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                            onClick={() => handleGerarPix(selectedLancamento.id, selectedLancamento)}
                            disabled={!!loadingAction}
                          >
                            <QrCode className="w-5 h-5" />
                            PIX
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            onClick={async () => {
                              try {
                                setLoadingAction(`checkout-${selectedLancamento.id}`);
                                const data = await onGerarCheckout(selectedLancamento.id);
                                if (data?.init_point) {
                                  window.open(data.init_point, '_blank');
                                  toast({ title: "Checkout aberto!", description: "Janela de pagamento foi aberta." });
                                }
                              } catch (error: any) {
                                toast({ title: "Erro ao gerar Checkout", description: error.message, variant: "destructive" });
                              } finally {
                                setLoadingAction(null);
                              }
                            }}
                            disabled={!!loadingAction}
                          >
                            <CreditCard className="w-5 h-5" />
                            CARD
                          </Button>
                          <Button
                            className="bg-[#25D366] hover:bg-[#1fb855] text-white h-12 rounded-xl font-black shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                            onClick={() => handleEnviarWhatsApp(selectedLancamento)}
                            disabled={!!loadingAction}
                          >
                            <MessageSquare className="w-5 h-5" />
                            ZAP
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          className={`flex-1 h-12 rounded-xl font-black shadow-lg ${selectedLancamento.pagamento_status === 'pago'
                            ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20'
                            : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                            }`}
                          onClick={async () => {
                            const novoStatus = selectedLancamento.pagamento_status === 'pago' ? 'pendente' : 'pago';
                            const confirmMsg = novoStatus === 'pago'
                              ? "CONFIRMAR RECEBIMENTO MANUAL?\n\nIsso marcará como PAGO sem validar no Mercado Pago."
                              : "ESTORNAR PAGAMENTO?\n\nO lançamento voltará a ficar pendente.";

                            if (window.confirm(confirmMsg)) {
                              await onAtualizarStatus(selectedLancamento.id, novoStatus);
                              setDetailsOpen(false);
                            }
                          }}
                        >
                          {selectedLancamento.pagamento_status === 'pago' ? '⏰ DESMARCAR PAGAMENTO' : '✅ MARCAR COMO PAGO'}
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10 h-12 w-12 p-0 rounded-xl"
                          onClick={async () => {
                            if (confirm("Deseja deletar este registro permanentemente?")) {
                              await onDeleteLancamento(selectedLancamento.id);
                              setDetailsOpen(false);
                            }
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pixOpen} onOpenChange={setPixOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl overflow-hidden p-0 border-gold/20 shadow-2xl">
          <div className="h-2 bg-gold w-full" />
          <div className="p-8 flex flex-col items-center">
            <DialogHeader className="w-full mb-8">
              <DialogTitle className="text-xl font-black italic flex items-center justify-center gap-3">
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
              <div className="flex gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                <Input
                  readOnly
                  value={pixData?.qr_code || ""}
                  className="bg-transparent border-none font-mono text-[9px] h-10 focus-visible:ring-0"
                />
                <Button
                  className="bg-gold text-black hover:bg-gold/90 h-10 px-4 font-black text-[10px] rounded-xl shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData?.qr_code || "");
                    toast({ title: "Código PIX copiado!", description: "Envie para o cliente." });
                  }}
                >
                  COPIAR
                </Button>
              </div>
            </div>
            <p className="mt-8 text-[10px] text-muted-foreground italic text-center opacity-60 font-medium">
              O status será atualizado instantaneamente após a confirmação do Banco Central.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes para Receitas Avulsas */}
      <Dialog open={extraDetailsOpen} onOpenChange={(open) => {
        setExtraDetailsOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className={`${isEditing ? 'max-w-2xl' : 'max-w-md'} bg-card border-border rounded-2xl overflow-hidden p-0 border-gold/20 shadow-2xl transition-all duration-300`}>
          <div className="h-2 bg-gold w-full" />
          <div className="p-6">
            <DialogHeader className="mb-6 flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-black italic flex items-center gap-3">
                <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-black" />
                </div>
                {isEditing ? 'EDITAR RECEITA' : 'DETALHES DA RECEITA'}
              </DialogTitle>
              {!isEditing && selectedExtra && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(selectedExtra)}
                  className="h-8 px-2 text-gold hover:bg-gold/10 font-bold"
                >
                  <Edit className="w-4 h-4 mr-1" /> Editar
                </Button>
              )}
            </DialogHeader>

            {selectedExtra && (
              <div className="space-y-6">
                {isEditing ? (
                  <FinanceiroEditForm
                    tipo="receita"
                    initialData={selectedExtra}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                    loading={loadingAction === `save-${selectedExtra.id}`}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Valor Recebido</p>
                        <p className="text-xl font-black text-gold tracking-tighter">{formatCurrency(selectedExtra.valor)}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Status Atual</p>
                        <Badge className={`h-6 px-3 text-[10px] font-black uppercase ${selectedExtra.pagamento_status === 'pago' ? "bg-green-500" : "bg-yellow-500"}`}>
                          {selectedExtra.pagamento_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-muted/10 p-4 rounded-2xl border border-border/30 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Data</span>
                        <span className="font-black">{selectedExtra.data_evento ? new Date(selectedExtra.data_evento).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Categoria</span>
                        <span className="font-black text-gold">{selectedExtra.categoria}</span>
                      </div>
                      <div className="flex justify-between items-start text-xs pt-2 border-t border-border/30">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Descrição</span>
                        <span className="font-medium text-right max-w-[200px]">{selectedExtra.descricao}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className={`flex-1 h-12 rounded-xl font-black shadow-lg ${selectedExtra.pagamento_status === 'pago'
                          ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20'
                          : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                          }`}
                        onClick={async () => {
                          await onAtualizarStatus(selectedExtra.id, selectedExtra.pagamento_status === 'pago' ? 'pendente' : 'pago');
                          setExtraDetailsOpen(false);
                        }}
                      >
                        {selectedExtra.pagamento_status === 'pago' ? '⏰ DESMARCAR RECEBIMENTO' : '✅ MARCAR COMO RECEBIDO'}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:bg-red-500/10 h-12 w-12 p-0 rounded-xl"
                        onClick={async () => {
                          if (confirm("Excluir esta receita permanentemente?")) {
                            await onDeleteLancamento(selectedExtra.id);
                            setExtraDetailsOpen(false);
                          }
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}