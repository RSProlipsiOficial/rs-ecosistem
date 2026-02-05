import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  MessageCircle,
  UserX,
  GraduationCap
} from "lucide-react";
import { usePagamentosManager } from "@/hooks/usePagamentosManager";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MensalidadeControles } from "./mensalidade-controles";
import { MensalidadeFiltros } from "@/types/mensalidades";

export function PagamentosManager() {
  const [filtros, setFiltros] = useState<MensalidadeFiltros>(() => {
    const now = new Date();
    return {
      mes: now.getMonth() + 1,
      ano: now.getFullYear(),
      status: 'todos',
      searchTerm: "",
      showInactive: false
    };
  });

  const mesAno = `${filtros.ano}-${String(filtros.mes).padStart(2, '0')}`;

  const {
    alunos,
    loading,
    atualizarStatusPagamento,
    desativarAluno,
    openWhatsApp,
    refetch
  } = usePagamentosManager(mesAno);

  // Filtrar alunos localmente
  const filteredAlunos = alunos.filter(aluno => {
    const term = (filtros.searchTerm || "").toLowerCase();
    const matchesSearch = aluno.nome_completo.toLowerCase().includes(term) ||
      aluno.nome_responsavel.toLowerCase().includes(term) ||
      (aluno.van_nome || "").toLowerCase().includes(term) ||
      (aluno.nome_colegio || "").toLowerCase().includes(term);

    const matchesStatus = filtros.status === "todos" ||
      (Array.isArray(filtros.status) && filtros.status.length > 0 && filtros.status.includes(aluno.status_pagamento === 'pago' ? 'pagos' : 'pendentes')) ||
      (typeof filtros.status === 'string' && (
        (filtros.status === "pagos" && aluno.status_pagamento === "pago") ||
        (filtros.status === "pendentes" && aluno.status_pagamento === "nao_pago")
      ));

    const matchesAluno = !filtros.aluno_id || aluno.id === filtros.aluno_id;

    const matchesColegio = !filtros.colegios || filtros.colegios.length === 0 ||
      (aluno.nome_colegio && filtros.colegios.includes(aluno.nome_colegio));

    const matchesTurno = !filtros.turnos || filtros.turnos.length === 0 ||
      (aluno.turno && filtros.turnos.includes(aluno.turno));

    const matchesInactive = filtros.showInactive ? true : aluno.ativo;

    return matchesSearch && matchesStatus && matchesAluno && matchesColegio && matchesTurno && matchesInactive;
  });

  // Agrupar por colégio e ordenar alfabeticamente
  const agrupadosPorColegio = filteredAlunos.reduce((grupos, aluno) => {
    const colegio = aluno.nome_colegio || 'Colégio Não Informado';
    if (!grupos[colegio]) {
      grupos[colegio] = [];
    }
    grupos[colegio].push(aluno);
    return grupos;
  }, {} as Record<string, typeof filteredAlunos>);

  // Ordenar colégios alfabeticamente e alunos dentro de cada colégio
  const colegiosOrdenados = Object.keys(agrupadosPorColegio).sort();
  colegiosOrdenados.forEach(colegio => {
    agrupadosPorColegio[colegio].sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
  });

  const getStatusBadge = (aluno: any) => {
    if (aluno.status_pagamento === "pago") {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
    }
    if (aluno.pagamento_vencido) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Vencido</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  const getStatusColor = (aluno: any) => {
    if (aluno.status_pagamento === "pago") return "text-green-600";
    if (aluno.pagamento_vencido) return "text-red-600";
    return "text-yellow-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center gap-2">
            <Users className="w-6 h-6 text-gold" />
            Gestão de <span className="text-gold">Pagamentos</span>
          </h2>
          <p className="text-gold/50 text-[10px] uppercase font-bold tracking-tighter ml-1">
            Controle individual e baixa de mensalidades
          </p>
        </div>
      </div>

      {/* Filtros Premium Unificados */}
      <MensalidadeControles
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Lista de Alunos por Colégio Unificada */}
      {colegiosOrdenados.length === 0 ? (
        <Card className="bg-black/20 border-white/5 shadow-elegant">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-16 h-16 text-gold/20 mb-4" />
            <h3 className="text-lg font-black text-gold uppercase italic tracking-widest">
              {filtros.searchTerm || filtros.status !== "todos" ? "Nenhum aluno encontrado" : "Nenhum pagamento registrado"}
            </h3>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-tighter mt-2">
              {filtros.searchTerm || filtros.status !== "todos"
                ? "Tente ajustar seus novos filtros avançados."
                : "Não há pagamentos para o período de " + filtros.mes + "/" + filtros.ano
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 pb-10">
          {colegiosOrdenados.map((colegio) => (
            <div key={colegio} className="space-y-4">
              {/* Cabeçalho do Colégio Estilo Premium */}
              <div className="flex items-center gap-3 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gold/80 italic">
                  <GraduationCap className="w-4 h-4 text-gold" />
                  {colegio}
                  <span className="text-[10px] text-gold/30 ml-2 font-bold tracking-normal">
                    ({agrupadosPorColegio[colegio].length} alunos)
                  </span>
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {agrupadosPorColegio[colegio].map((aluno) => (
                  <AlunoCard
                    key={aluno.id}
                    aluno={aluno}
                    onAtualizarStatus={atualizarStatusPagamento}
                    onDesativar={desativarAluno}
                    onOpenWhatsApp={openWhatsApp}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AlunoCardProps {
  aluno: any;
  onAtualizarStatus: (alunoId: string, status: 'pago' | 'nao_pago') => void;
  onDesativar: (alunoId: string) => void;
  onOpenWhatsApp: (phone: string, studentName: string) => void;
}

function AlunoCard({ aluno, onAtualizarStatus, onDesativar, onOpenWhatsApp }: AlunoCardProps) {
  const getStatusBadge = () => {
    if (aluno.status_pagamento === "pago") {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
    }
    if (aluno.pagamento_vencido) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Vencido</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  const getStatusColor = () => {
    if (aluno.status_pagamento === "pago") return "text-green-600";
    if (aluno.pagamento_vencido) return "text-red-600";
    return "text-yellow-600";
  };

  const formatDate = (dateStr: string | null | undefined, formatStr: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return format(date, formatStr, { locale: ptBR });
    } catch (e) {
      return null;
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 group hover:shadow-elegant border-white/5 ${aluno.status_pagamento === 'pago' ? 'bg-green-500/5' : 'bg-black/20'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Informações do Aluno */}
          <div className="flex items-center gap-4 flex-1">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/10 group-hover:border-gold/30 transition-all">
              <GraduationCap className="h-6 w-6 text-gold" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white uppercase tracking-wider leading-none">
                {aluno.nome_completo}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-[10px] items-center flex gap-1 font-bold text-gold/60 uppercase tracking-tighter">
                  <Users className="w-3 h-3" /> {aluno.nome_responsavel}
                </p>
                <div className="h-1 w-1 rounded-full bg-gold/20 hidden md:block" />
                <p className="text-[10px] items-center flex gap-1 font-bold text-gray-400 uppercase tracking-tighter">
                  <Calendar className="w-3 h-3" /> Venc: Dia {aluno.data_vencimento ? format(new Date(aluno.data_vencimento), 'dd') : 'N/A'}
                </p>
                <div className="h-1 w-1 rounded-full bg-gold/20 hidden md:block" />
                <p className="text-[10px] items-center flex gap-1 font-bold text-gray-400 uppercase tracking-tighter">
                  <Clock className="w-3 h-3" /> {aluno.van_nome || "Privada"}
                </p>
              </div>
            </div>
          </div>

          {/* Dados Financeiros & Status */}
          <div className="flex flex-wrap items-center gap-6 lg:justify-end">
            <div className="space-y-1 text-right min-w-[100px]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/40">Mensalidade</p>
              <p className="text-sm font-black text-gold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(aluno.valor_mensalidade || 0))}
              </p>
            </div>

            <div className="flex flex-col gap-2 items-center lg:items-end">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/40">Status</p>
              {getStatusBadge()}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 border-l border-white/5 pl-6 ml-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOpenWhatsApp(aluno.whatsapp_responsavel, aluno.nome_completo)}
                className="h-9 w-9 bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-green-500/10"
                title="Conversar no WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>

              {aluno.status_pagamento !== "pago" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm(`Você confirma que recebeu o pagamento de ${aluno.nome_completo} MANUALMENTE (Dinheiro/Pix Direto)? 

AVISO: Isso ignora a confirmação automática do Mercado Pago.`)) {
                      onAtualizarStatus(aluno.id, "pago");
                    }
                  }}
                  className="h-9 gap-2 px-4 bg-gold/10 border-gold/20 text-gold hover:bg-gold hover:text-black font-black uppercase text-[10px] tracking-widest transition-all shadow-gold-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Receber
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onAtualizarStatus(aluno.id, "nao_pago")}
                  className="h-9 gap-2 px-4 bg-white/5 border-white/10 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  <Clock className="w-4 h-4" />
                  Estornar
                </Button>
              )}

              {aluno.pagamento_vencido && aluno.ativo && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja DESATIVAR o aluno ${aluno.nome_completo}? Ele não aparecerá mais nos relatórios ativos de faturamento.`)) {
                      onDesativar(aluno.id);
                    }
                  }}
                  className="h-9 w-9 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-red-500/10"
                  title="Desativar Aluno"
                >
                  <UserX className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {!aluno.ativo && (
          <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-md text-center">
            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest italic">Aluno Desativado (Atraso Crítico)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}