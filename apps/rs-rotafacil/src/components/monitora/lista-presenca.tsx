import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, RefreshCw, MessageCircle, MapPin,
  Calendar, Clock, Filter, X, ChevronDown,
  Plus, Search, RotateCcw, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody,
  TableHead, TableRow, TableCell
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent
} from "@/components/ui/collapsible";
import { AlunoComPresenca, TURNOS, STATUS_PRESENCA } from '@/types/presenca';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ListaPresencaProps {
  alunos: AlunoComPresenca[];
  loading: boolean;
  onMarcarPresenca: (alunoId: string, status: 'presente' | 'ausente' | 'limpar') => void;
  onAtualizarLista: () => void;
  onZerarLista?: () => Promise<void> | void;
  dataSelected: string;
  onDataChange: (data: string) => void;
  readOnly?: boolean;
}

export function ListaPresenca({
  alunos,
  loading,
  onMarcarPresenca,
  onAtualizarLista,
  dataSelected,
  onDataChange,
  readOnly = false,
}: ListaPresencaProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroColegios, setFiltroColegios] = useState<string[]>([]);
  const [filtroTurnos, setFiltroTurnos] = useState<string[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string[]>([]);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata;
        const role = meta?.tipo_usuario || meta?.user_type || 'usuario';
        setUserRole(role);
      }
    };
    getRole();
  }, []);

  // Aplicar todos os filtros
  const filteredAlunos = (alunos || []).filter(aluno => {
    if (!aluno) return false;

    // Filtro por texto
    const nomeCompleto = aluno.nome_completo || '';
    const nomeColegio = aluno.nome_colegio || '';

    const matchText = nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nomeColegio.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por colégios
    const matchColegio = filtroColegios.length === 0 || (aluno.nome_colegio && filtroColegios.includes(aluno.nome_colegio));

    // Filtro por turnos
    const matchTurno = filtroTurnos.length === 0 || (aluno.turno && filtroTurnos.includes(aluno.turno));

    // Filtro por status
    let matchStatus = true;
    if (filtroStatus.length > 0) {
      const status = aluno.presenca?.status;
      if (status) {
        matchStatus = filtroStatus.includes(status);
      } else {
        matchStatus = filtroStatus.includes('sem_marcacao');
      }
    }

    return matchText && matchColegio && matchTurno && matchStatus;
  });

  // Agrupar alunos por colégio e turno
  const alunosPorColegioTurno = (filteredAlunos || []).reduce((acc, aluno) => {
    if (!aluno) return acc;
    const colegio = aluno.nome_colegio || 'Desconhecido';
    const turno = aluno.turno || 'Desconhecido';
    const chave = `${colegio} - ${turno.charAt(0).toUpperCase() + turno.slice(1)}`;
    if (!acc[chave]) {
      acc[chave] = [];
    }
    acc[chave].push(aluno);
    return acc;
  }, {} as Record<string, AlunoComPresenca[]>);

  // Ordenar as chaves (colégio + turno) alfabeticamente
  const chavesOrdenadas = Object.keys(alunosPorColegioTurno).sort();

  const getStatusBadge = (aluno: AlunoComPresenca) => {
    const status = aluno.presenca?.status;

    if (status === 'presente') {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          ✅ Presente
        </Badge>
      );
    } else if (status === 'ausente') {
      return (
        <Badge variant="destructive">
          ❌ Ausente
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          Não marcado
        </Badge>
      );
    }
  };

  const abrirWhatsApp = (numero: string, nomeAluno: string) => {
    const numeroLimpo = (numero || '').replace(/\D/g, '');
    const isMotorista = userRole === 'motorista';
    const mensagem = `Olá! Esta é uma mensagem da ${isMotorista ? 'motorista' : 'monitora'} da van escolar sobre ${nomeAluno}.`;
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const abrirMapa = (aluno: AlunoComPresenca) => {
    const rua = aluno.endereco_rua || '';
    const numero = aluno.endereco_numero || '';
    const bairro = aluno.endereco_bairro || '';
    const cidade = aluno.endereco_cidade || '';
    const estado = aluno.endereco_estado || '';
    const endereco = `${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  const colegiosUnicos = Array.from(new Set((alunos || []).map(aluno => aluno?.nome_colegio))).filter(Boolean).sort() as string[];

  const handleColegioChange = (colegio: string, checked: boolean) => {
    if (checked) {
      setFiltroColegios([...filtroColegios, colegio]);
    } else {
      setFiltroColegios(filtroColegios.filter(c => c !== colegio));
    }
  };

  const handleTurnoChange = (turno: string, checked: boolean) => {
    if (checked) {
      setFiltroTurnos([...filtroTurnos, turno]);
    } else {
      setFiltroTurnos(filtroTurnos.filter(t => t !== turno));
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setFiltroStatus([...filtroStatus, status]);
    } else {
      setFiltroStatus(filtroStatus.filter(s => s !== status));
    }
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroColegios([]);
    setFiltroTurnos([]);
    setFiltroStatus([]);
  };

  const temFiltrosAtivos =
    searchTerm ||
    filtroColegios.length > 0 ||
    filtroTurnos.length > 0 ||
    filtroStatus.length > 0;

  if (alunos.length === 0 && !loading) {
    const isOwner = userRole === 'admin' || userRole === 'consultor';

    return (
      <Card className="bg-black-secondary border-sidebar-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6">
            <Users className="h-8 w-8 text-gold" />
          </div>
          <p className="text-xl font-bold text-gold mb-2 uppercase italic">
            Nenhum aluno encontrado
          </p>
          <p className="text-gray-400 max-w-sm mb-8">
            Para que a lista de rota apareça, você precisa cadastrar seus alunos e vinculá-los a uma van.
          </p>

          {isOwner && (
            <Button
              onClick={() => navigate('/alunos')}
              className="bg-gold text-black-primary hover:bg-gold/80 font-bold uppercase transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Alunos agora
            </Button>
          )}

          {!isOwner && (
            <p className="text-xs text-gold/60 font-medium bg-gold/5 px-4 py-2 rounded-full border border-gold/10">
              Solicite ao seu gestor o cadastro dos alunos no sistema.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <CardHeader className="py-3 px-mobile-padding-x md:px-6 border-b border-sidebar-border/50 bg-black-secondary/30">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gold italic">
            <Calendar className="h-4 w-4 text-gold" />
            Vistoria e Chamada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-mobile-padding-x md:p-6 bg-black/40">
          <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-mobile-gap md:gap-4 items-end">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="data-presenca" className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Data da Rota</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                  <Input
                    id="data-presenca"
                    type="date"
                    value={dataSelected}
                    onChange={(e) => onDataChange(e.target.value)}
                    disabled={readOnly}
                    className="h-11 md:h-10 bg-black-secondary border-gold/20 text-gold text-xs focus:border-gold/50 transition-all pl-9"
                  />
                </div>
              </div>
              <div className="md:col-span-6 space-y-2">
                <Label htmlFor="busca" className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Buscar Aluno ou Escola</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                  <Input
                    id="busca"
                    placeholder="Digite o nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={readOnly}
                    className="h-11 md:h-10 bg-black-secondary border-gold/20 text-gold placeholder:text-gold/20 text-xs focus:border-gold/50 transition-all pl-9"
                  />
                </div>
              </div>
              {!readOnly && (
                <div className="md:col-span-3 grid grid-cols-2 gap-2">
                  <Button
                    onClick={onAtualizarLista}
                    disabled={loading}
                    className="w-full h-11 md:h-10 gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80 text-white font-black uppercase text-[9px] tracking-widest border border-white/10 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>

                  <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={loading}
                        className="w-full h-11 md:h-10 gap-2 font-black uppercase text-[9px] tracking-widest shadow-red-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Zerar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black-secondary border-gold/20 w-[95%] max-w-lg rounded-[24px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-gold italic uppercase font-black tracking-tighter flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Limpar Chamada
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 text-xs">
                          Remover TODAS as marcações para <strong>{format(new Date(dataSelected + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}</strong>.
                          <br /><br />
                          <span className="text-gold font-bold uppercase">Senha: 1234</span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4 space-y-3">
                        <Input
                          type="text"
                          placeholder="Digite 1234..."
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="h-12 bg-black/40 border-gold/20 text-gold focus:border-gold/50 font-bold text-center tracking-widest"
                        />
                      </div>
                      <AlertDialogFooter className="flex-col md:flex-row gap-2">
                        <AlertDialogCancel
                          onClick={() => setResetPassword('')}
                          className="w-full md:w-auto bg-transparent border-white/10 text-white hover:bg-white/5 uppercase font-black text-[10px] h-11"
                        >
                          Voltar
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            disabled={resetPassword.trim() !== '1234'}
                            onClick={async (e) => {
                              e.preventDefault();
                              if (onZerarLista) {
                                try {
                                  await onZerarLista();
                                  setResetPassword('');
                                  setIsResetDialogOpen(false);
                                } catch (err) {
                                  console.error('Falha ao zerar lista:', err);
                                }
                              }
                            }}
                            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white uppercase font-black text-[10px] h-11"
                          >
                            Confirmar
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="h-11 md:h-9 gap-2 text-[10px] font-black uppercase tracking-widest border-gold/20 text-white hover:bg-gold/5 hover:border-gold/40 transition-all">
                  <Filter className="h-3.5 w-3.5 text-gold" />
                  Filtrar
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${filtrosAbertos ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-6 pt-6 border-t border-white/5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold/60">Filtrar por Colégio</Label>
                  <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-xl border border-white/5 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {colegiosUnicos.map(colegio => (
                      <div key={colegio} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-colegio-${colegio}`}
                          checked={filtroColegios.includes(colegio)}
                          onCheckedChange={(checked) => handleColegioChange(colegio, !!checked)}
                          className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor={`filter-colegio-${colegio}`}
                          className="text-[11px] font-bold text-white/70 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {colegio}
                        </label>
                      </div>
                    ))}
                    {colegiosUnicos.length === 0 && <p className="text-[10px] text-white/30 italic">Nenhum colégio encontrado</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold/60">Filtrar por Turno</Label>
                  <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    {Object.entries(TURNOS).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-turno-${key}`}
                          checked={filtroTurnos.includes(key)}
                          onCheckedChange={(checked) => handleTurnoChange(key, !!checked)}
                          className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor={`filter-turno-${key}`}
                          className="text-[11px] font-bold text-white/70 cursor-pointer"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gold/60">Filtrar por Status</Label>
                  <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    {Object.entries(STATUS_PRESENCA).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-status-${key}`}
                          checked={filtroStatus.includes(key)}
                          onCheckedChange={(checked) => handleStatusChange(key, !!checked)}
                          className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor={`filter-status-${key}`}
                          className="text-[11px] font-bold text-white/70 cursor-pointer"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-status-sem-marcacao"
                        checked={filtroStatus.includes('sem_marcacao')}
                        onCheckedChange={(checked) => handleStatusChange('sem_marcacao', !!checked)}
                        className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                      />
                      <label
                        htmlFor="filter-status-sem-marcacao"
                        className="text-[11px] font-bold text-white/70 cursor-pointer"
                      >
                        Não marcado
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-end pb-1">
                  <Button
                    variant="ghost"
                    onClick={limparFiltros}
                    disabled={!temFiltrosAtivos}
                    className="w-full gap-2 text-[10px] font-black uppercase tracking-widest text-gold/60 hover:text-gold hover:bg-gold/5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {readOnly && userRole !== 'motorista' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <p className="text-blue-400 text-sm font-medium">
            👁️ Modo visualização: Esta é uma visualização da lista da monitora. Você não pode marcar presenças.
          </p>
        </div>
      )}

      {chavesOrdenadas.map((chaveColegioTurno) => {
        const alunosGrupo = alunosPorColegioTurno[chaveColegioTurno];
        const presentes = alunosGrupo.filter(a => a.presenca?.status === 'presente').length;
        const ausentes = alunosGrupo.filter(a => a.presenca?.status === 'ausente').length;

        return (
          <Card key={chaveColegioTurno} className="bg-black/20 border-white/5 overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-sidebar-border/50 bg-black-secondary/30">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gold italic">
                  <Users className="h-4 w-4 text-gold" />
                  {chaveColegioTurno}
                </span>
                <div className="flex gap-1.5">
                  <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">
                    PRES: {presentes}
                  </Badge>
                  <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">
                    AUS: {ausentes}
                  </Badge>
                  <Badge variant="outline" className="border-sidebar-border text-white/40 text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">
                    TOTAL: {alunosGrupo.length}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[700px] lg:min-w-full">
                  <TableHeader className="bg-black/40">
                    <TableRow className="hover:bg-transparent border-sidebar-border">
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-gold/80 py-2">Aluno</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-gold/80 py-2">Responsável</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-gold/80 py-2">Contato</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-gold/80 py-2">Endereço</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-gold/80 py-2">Turno</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-gold/80 py-2">Status</TableHead>
                      {!readOnly && <TableHead className="text-right text-[9px] font-black uppercase tracking-widest text-gold/80 py-2">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alunosGrupo.map((aluno) => (
                      <TableRow key={aluno.id} className="hover:bg-white/5 border-sidebar-border text-[11px] transition-colors">
                        <TableCell className="font-bold text-white py-1.5 px-3 max-w-[140px] truncate leading-none">
                          {aluno.nome_completo || 'N/A'}
                        </TableCell>
                        <TableCell className="text-white/60 py-1.5 px-3 max-w-[110px] truncate leading-none">
                          {aluno.nome_responsavel || 'N/A'}
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirWhatsApp(aluno.whatsapp_responsavel || '', aluno.nome_completo || 'Aluno')}
                            className="h-6 gap-1.5 text-gold/60 hover:text-gold hover:bg-gold/10 px-2 text-[9px] font-bold"
                            disabled={readOnly || !aluno.whatsapp_responsavel}
                          >
                            <MessageCircle className="h-3 w-3" />
                            {aluno.whatsapp_responsavel || 'N/A'}
                          </Button>
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirMapa(aluno)}
                            className="h-6 gap-1.5 text-white/40 hover:text-white hover:bg-white/5 px-2 text-[9px] max-w-[160px] truncate"
                            disabled={readOnly || !(aluno.endereco_rua && aluno.endereco_numero)}
                          >
                            <MapPin className="h-3 w-3 text-gold/40" />
                            {(aluno.endereco_rua && aluno.endereco_numero) ? `${aluno.endereco_rua}, ${aluno.endereco_numero}` : 'N/A'}
                          </Button>
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">{aluno.turno || 'N/A'}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          {getStatusBadge(aluno)}
                        </TableCell>
                        {!readOnly && (
                          <TableCell className="text-right py-1.5 px-3">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant={aluno.presenca?.status === 'presente' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onMarcarPresenca(aluno.id, 'presente')}
                                disabled={loading}
                                className={`h-6 w-6 p-0 text-[10px] transition-all ${aluno.presenca?.status === 'presente' ? 'bg-green-500 hover:bg-green-600 border-none' : 'border-sidebar-border hover:border-green-500/50 hover:bg-green-500/10'}`}
                              >
                                ✓
                              </Button>
                              <Button
                                variant={aluno.presenca?.status === 'ausente' ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => onMarcarPresenca(aluno.id, 'ausente')}
                                disabled={loading}
                                className={`h-6 w-6 p-0 text-[10px] transition-all ${aluno.presenca?.status === 'ausente' ? 'bg-red-500 hover:bg-red-600 border-none' : 'border-sidebar-border hover:border-red-500/50 hover:bg-red-500/10'}`}
                              >
                                ✕
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onMarcarPresenca(aluno.id, 'limpar')}
                                disabled={loading || !aluno.presenca}
                                title="Limpar marcação"
                                className="h-6 w-6 p-0 text-[10px] border-sidebar-border hover:border-gold/50 hover:bg-gold/10 transition-all text-gold/40 hover:text-gold"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}