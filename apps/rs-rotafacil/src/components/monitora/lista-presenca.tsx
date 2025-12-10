import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, RefreshCw, MessageCircle, MapPin, Calendar, Clock, Filter, X, ChevronDown } from 'lucide-react';
import { AlunoComPresenca, TURNOS, STATUS_PRESENCA } from '@/types/presenca';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface ListaPresencaProps {
  alunos: AlunoComPresenca[];
  loading: boolean;
  onMarcarPresenca: (alunoId: string, status: 'presente' | 'ausente') => void;
  onAtualizarLista: () => void;
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

  // Aplicar todos os filtros
  const filteredAlunos = alunos.filter(aluno => {
    // Filtro por texto
    const matchText = aluno.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.nome_colegio.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por colégios
    const matchColegio = filtroColegios.length === 0 || filtroColegios.includes(aluno.nome_colegio);
    
    // Filtro por turnos
    const matchTurno = filtroTurnos.length === 0 || filtroTurnos.includes(aluno.turno);
    
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
  const alunosPorColegioTurno = filteredAlunos.reduce((acc, aluno) => {
    const chave = `${aluno.nome_colegio} - ${aluno.turno.charAt(0).toUpperCase() + aluno.turno.slice(1)}`;
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
    const numeroLimpo = numero.replace(/\D/g, '');
    const mensagem = `Olá! Esta é uma mensagem da monitora da van escolar sobre ${nomeAluno}.`;
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const abrirMapa = (aluno: AlunoComPresenca) => {
    const endereco = `${aluno.endereco_rua}, ${aluno.endereco_numero}, ${aluno.endereco_bairro}, ${aluno.endereco_cidade}, ${aluno.endereco_estado}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  // Extrair colégios únicos
  const colegiosUnicos = Array.from(new Set(alunos.map(aluno => aluno.nome_colegio))).sort();

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
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum aluno encontrado
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Cadastre alunos para começar a marcar presenças
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles superiores com filtros integrados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Controles da Lista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="data-presenca">Data</Label>
              <Input
                id="data-presenca"
                type="date"
                value={dataSelected}
                onChange={(e) => onDataChange(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="busca">Buscar Aluno ou Colégio</Label>
              <Input
                id="busca"
                placeholder="Digite o nome do aluno ou colégio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={readOnly}
              />
            </div>
            {!readOnly && (
              <div className="flex items-end">
                <Button
                  onClick={onAtualizarLista}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar Lista
                </Button>
              </div>
            )}
          </div>

          {/* Filtros avançados colapsáveis */}
          <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros Avançados
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtrosAbertos ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              {temFiltrosAtivos && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limparFiltros}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Filtro por colégios */}
              <div className="space-y-3">
                <Label>Colégios</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {colegiosUnicos.map((colegio) => (
                    <div key={colegio} className="flex items-center space-x-2">
                      <Checkbox
                        id={`colegio-${colegio}`}
                        checked={filtroColegios.includes(colegio)}
                        onCheckedChange={(checked) => 
                          handleColegioChange(colegio, checked as boolean)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`colegio-${colegio}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {colegio}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por turnos */}
              <div className="space-y-3">
                <Label>Turnos</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TURNOS.map((turno) => (
                    <div key={turno.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`turno-${turno.value}`}
                        checked={filtroTurnos.includes(turno.value)}
                        onCheckedChange={(checked) => 
                          handleTurnoChange(turno.value, checked as boolean)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`turno-${turno.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {turno.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por status de presença */}
              <div className="space-y-3">
                <Label>Status de Presença</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STATUS_PRESENCA.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={filtroStatus.includes(status.value)}
                        onCheckedChange={(checked) => 
                          handleStatusChange(status.value, checked as boolean)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`status-${status.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {status.icon} {status.label}
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-sem_marcacao"
                      checked={filtroStatus.includes('sem_marcacao')}
                      onCheckedChange={(checked) => 
                        handleStatusChange('sem_marcacao', checked as boolean)
                      }
                      disabled={readOnly}
                    />
                    <Label
                      htmlFor="status-sem_marcacao"
                      className="text-sm font-normal cursor-pointer"
                    >
                      ⚪ Não marcado
                    </Label>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {readOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            👁️ Modo visualização: Esta é uma visualização da lista da monitora. Você não pode marcar presenças.
          </p>
        </div>
      )}

      {/* Lista agrupada por colégio e turno */}
      {chavesOrdenadas.map((chaveColegioTurno) => {
        const alunosGrupo = alunosPorColegioTurno[chaveColegioTurno];
        const presentes = alunosGrupo.filter(a => a.presenca?.status === 'presente').length;
        const ausentes = alunosGrupo.filter(a => a.presenca?.status === 'ausente').length;
        
        return (
          <Card key={chaveColegioTurno}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {chaveColegioTurno}
                </span>
                <div className="flex gap-2 text-sm">
                  <Badge variant="default" className="bg-green-500">
                    Presentes: {presentes}
                  </Badge>
                  <Badge variant="destructive">
                    Ausentes: {ausentes}
                  </Badge>
                  <Badge variant="outline">
                    Total: {alunosGrupo.length}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Status</TableHead>
                      {!readOnly && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alunosGrupo.map((aluno) => (
                      <TableRow key={aluno.id}>
                        <TableCell className="font-medium">
                          {aluno.nome_completo}
                        </TableCell>
                        <TableCell>
                          {aluno.nome_responsavel}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirWhatsApp(aluno.whatsapp_responsavel, aluno.nome_completo)}
                            className="gap-2"
                            disabled={readOnly}
                          >
                            <MessageCircle className="h-4 w-4" />
                            {aluno.whatsapp_responsavel}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirMapa(aluno)}
                            className="gap-2"
                            disabled={readOnly}
                          >
                            <MapPin className="h-4 w-4" />
                            {aluno.endereco_rua}, {aluno.endereco_numero}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {aluno.turno}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(aluno)}
                        </TableCell>
                        {!readOnly && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant={aluno.presenca?.status === 'presente' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onMarcarPresenca(aluno.id, 'presente')}
                                disabled={loading}
                                className="gap-1"
                              >
                                ✅
                              </Button>
                              <Button
                                variant={aluno.presenca?.status === 'ausente' ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => onMarcarPresenca(aluno.id, 'ausente')}
                                disabled={loading}
                                className="gap-1"
                              >
                                ❌
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