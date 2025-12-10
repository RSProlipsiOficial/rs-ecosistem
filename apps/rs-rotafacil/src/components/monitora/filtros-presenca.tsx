import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { AlunoComPresenca } from '@/types/presenca';
import { TURNOS, STATUS_PRESENCA } from '@/types/presenca';

interface FiltrosPresencaProps {
  alunos: AlunoComPresenca[];
  filtroTexto: string;
  onFiltroTextoChange: (texto: string) => void;
  filtroColegios: string[];
  onFiltroColegiosChange: (colegios: string[]) => void;
  filtroTurnos: string[];
  onFiltroTurnosChange: (turnos: string[]) => void;
  filtroStatus: string[];
  onFiltroStatusChange: (status: string[]) => void;
}

export function FiltrosPresenca({
  alunos,
  filtroTexto,
  onFiltroTextoChange,
  filtroColegios,
  onFiltroColegiosChange,
  filtroTurnos,
  onFiltroTurnosChange,
  filtroStatus,
  onFiltroStatusChange,
}: FiltrosPresencaProps) {
  // Extrair colégios únicos
  const colegiosUnicos = Array.from(
    new Set(alunos.map(aluno => aluno.nome_colegio))
  ).sort();

  const handleColegioChange = (colegio: string, checked: boolean) => {
    if (checked) {
      onFiltroColegiosChange([...filtroColegios, colegio]);
    } else {
      onFiltroColegiosChange(filtroColegios.filter(c => c !== colegio));
    }
  };

  const handleTurnoChange = (turno: string, checked: boolean) => {
    if (checked) {
      onFiltroTurnosChange([...filtroTurnos, turno]);
    } else {
      onFiltroTurnosChange(filtroTurnos.filter(t => t !== turno));
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      onFiltroStatusChange([...filtroStatus, status]);
    } else {
      onFiltroStatusChange(filtroStatus.filter(s => s !== status));
    }
  };

  const limparFiltros = () => {
    onFiltroTextoChange('');
    onFiltroColegiosChange([]);
    onFiltroTurnosChange([]);
    onFiltroStatusChange([]);
  };

  const temFiltrosAtivos = 
    filtroTexto || 
    filtroColegios.length > 0 || 
    filtroTurnos.length > 0 || 
    filtroStatus.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros da Lista
            </span>
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
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para personalizar a visualização da lista de presença
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtro por texto */}
          <div className="space-y-2">
            <Label htmlFor="filtro-texto">Buscar por Nome ou Colégio</Label>
            <Input
              id="filtro-texto"
              placeholder="Digite o nome do aluno ou colégio..."
              value={filtroTexto}
              onChange={(e) => onFiltroTextoChange(e.target.value)}
            />
          </div>

          {/* Filtro por colégios */}
          <div className="space-y-3">
            <Label>Colégios</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {colegiosUnicos.map((colegio) => (
                <div key={colegio} className="flex items-center space-x-2">
                  <Checkbox
                    id={`colegio-${colegio}`}
                    checked={filtroColegios.includes(colegio)}
                    onCheckedChange={(checked) => 
                      handleColegioChange(colegio, checked as boolean)
                    }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STATUS_PRESENCA.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filtroStatus.includes(status.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(status.value, checked as boolean)
                    }
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
        </CardContent>
      </Card>
    </div>
  );
}