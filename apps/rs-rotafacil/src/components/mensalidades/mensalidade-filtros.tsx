import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MensalidadeFiltros } from "@/types/mensalidades";
import { supabase } from "@/integrations/supabase/client";

interface MensalidadeFiltrosProps {
  filtros: MensalidadeFiltros;
  onFiltrosChange: (filtros: MensalidadeFiltros) => void;
}

interface Van {
  id: string;
  nome: string;
}

export function MensalidadeFiltrosCard({ filtros, onFiltrosChange }: MensalidadeFiltrosProps) {
  const [vans, setVans] = useState<Van[]>([]);

  useEffect(() => {
    fetchVans();
  }, []);

  const fetchVans = async () => {
    try {
      const { data, error } = await supabase
        .from('vans')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setVans(data || []);
    } catch (error) {
      console.error('Erro ao buscar vans:', error);
    }
  };

  const gerarOpcoesAno = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual - 2; i <= anoAtual + 1; i++) {
      anos.push(i);
    }
    return anos;
  };

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="mes">Mês</Label>
            <Select
              value={filtros.mes.toString()}
              onValueChange={(value) => 
                onFiltrosChange({ ...filtros, mes: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ano">Ano</Label>
            <Select
              value={filtros.ano.toString()}
              onValueChange={(value) => 
                onFiltrosChange({ ...filtros, ano: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {gerarOpcoesAno().map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="van">Van</Label>
            <Select
              value={filtros.van_id || "todas"}
              onValueChange={(value) => 
                onFiltrosChange({ 
                  ...filtros, 
                  van_id: value === "todas" ? undefined : value 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as vans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as vans</SelectItem>
                {vans.map((van) => (
                  <SelectItem key={van.id} value={van.id}>
                    {van.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={filtros.status || "todos"}
              onValueChange={(value) => 
                onFiltrosChange({ 
                  ...filtros, 
                  status: value === "todos" ? undefined : value as any
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pagos">Somente Pagos</SelectItem>
                <SelectItem value="pendentes">Somente Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}