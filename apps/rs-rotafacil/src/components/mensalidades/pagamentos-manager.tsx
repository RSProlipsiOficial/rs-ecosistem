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

export function PagamentosManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [mesAno, setMesAno] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const {
    alunos,
    loading,
    atualizarStatusPagamento,
    desativarAluno,
    openWhatsApp
  } = usePagamentosManager(mesAno);

  // Filtrar alunos
  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = aluno.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.nome_responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || 
                         (statusFilter === "pago" && aluno.status_pagamento === "pago") ||
                         (statusFilter === "pendente" && aluno.status_pagamento === "nao_pago") ||
                         (statusFilter === "vencido" && aluno.pagamento_vencido);
    
    return matchesSearch && matchesStatus;
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Gestão de Pagamentos</h2>
        <p className="text-muted-foreground">
          Gerencie o status dos pagamentos e marque como pago, pendente ou vencido
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Filtre por mês/ano, status do pagamento ou pesquise por aluno
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Mês/Ano</label>
            <Input
              type="month"
              value={mesAno}
              onChange={(e) => setMesAno(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Nome do aluno ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alunos por Colégio */}
      {colegiosOrdenados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== "todos" ? "Nenhum aluno encontrado" : "Nenhum pagamento encontrado"}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "todos" 
                ? "Tente ajustar os filtros de busca."
                : "Não há pagamentos para o período selecionado."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={colegiosOrdenados[0]} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {colegiosOrdenados.map((colegio) => (
              <TabsTrigger 
                key={colegio} 
                value={colegio}
                className="flex items-center gap-2 text-sm"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="truncate">{colegio}</span>
                <Badge variant="secondary" className="ml-auto">
                  {agrupadosPorColegio[colegio].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {colegiosOrdenados.map((colegio) => (
            <TabsContent key={colegio} value={colegio}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-gold" />
                    {colegio}
                  </CardTitle>
                  <CardDescription>
                    {agrupadosPorColegio[colegio].length} alunos - ordenados alfabeticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Cabeçalho da tabela */}
                  <div className="grid grid-cols-12 gap-4 p-3 mb-2 bg-muted/50 rounded-lg font-semibold text-sm">
                    <div className="col-span-3">Nome</div>
                    <div className="col-span-2">Van</div>
                    <div className="col-span-2">Valor</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3 text-right">Ações</div>
                  </div>
                  
                  {/* Lista de alunos */}
                  <div className="space-y-2">
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
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
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

  return (
    <Card className="w-full hover:bg-accent/20 transition-colors">
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Nome - 3 colunas */}
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gold" />
              <div>
                <div className="font-semibold">{aluno.nome_completo}</div>
                <div className="text-sm text-muted-foreground">{aluno.nome_responsavel}</div>
                {aluno.data_pagamento && (
                  <div className="text-xs text-green-600">
                    Pago em: {format(new Date(aluno.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Van - 2 colunas */}
          <div className="col-span-2">
            <span className="text-sm">{aluno.van_nome || "Não definida"}</span>
          </div>

          {/* Valor - 2 colunas */}
          <div className="col-span-2">
            <span className="font-mono text-sm">R$ {aluno.valor_mensalidade?.toFixed(2) || "0,00"}</span>
            {aluno.data_vencimento && (
              <div className={`text-xs flex items-center gap-1 ${getStatusColor()}`}>
                <Calendar className="w-3 h-3" />
                Venc: {format(new Date(aluno.data_vencimento), "dd/MM", { locale: ptBR })}
              </div>
            )}
          </div>

          {/* Status - 2 colunas */}
          <div className="col-span-2">
            <div className="flex flex-col gap-1">
              {getStatusBadge()}
              {aluno.fora_horario && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Fora do horário
                </Badge>
              )}
            </div>
          </div>

          {/* Ações - 3 colunas */}
          <div className="col-span-3 flex flex-wrap items-center gap-1 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenWhatsApp(aluno.whatsapp_responsavel, aluno.nome_completo)}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              WhatsApp
            </Button>

            {aluno.status_pagamento !== "pago" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAtualizarStatus(aluno.id, "pago")}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Marcar Pago
              </Button>
            )}

            {aluno.status_pagamento === "pago" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAtualizarStatus(aluno.id, "nao_pago")}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Clock className="w-3 h-3 mr-1" />
                Pendente
              </Button>
            )}

            {aluno.pagamento_vencido && aluno.ativo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDesativar(aluno.id)}
                className="text-destructive hover:text-destructive"
              >
                <UserX className="w-3 h-3 mr-1" />
                Desativar
              </Button>
            )}
          </div>
        </div>

        {!aluno.ativo && (
          <div className="col-span-12 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-center">
            <span className="text-destructive text-sm font-medium">Aluno Inativo</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}