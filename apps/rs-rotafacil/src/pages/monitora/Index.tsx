
import { useState, useEffect } from 'react';
import { DynamicLayout } from "@/components/layout/dynamic-layout";
import { ListaPresenca } from '@/components/monitora/lista-presenca';
import { ResumoPresencas } from '@/components/monitora/resumo-presencas';
import { OcorrenciasManager } from '@/components/monitora/ocorrencias-manager';
import { ListaHistorica } from '@/components/monitora/lista-historica';
import { usePresenca } from '@/hooks/usePresenca';
import { ResumoGeralPresenca } from '@/types/presenca';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart3, RefreshCw, AlertCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonitoraIndexProps {
  customUserId?: string;
}

export default function MonitoraIndex({ customUserId }: MonitoraIndexProps = {}) {
  const {
    alunosComPresenca,
    loading,
    marcarPresenca,
    zerarPresencas,
    getResumoPresencas,
    refetch,
  } = usePresenca(customUserId);

  const [resumo, setResumo] = useState<ResumoGeralPresenca | null>(null);
  const [dataSelected, setDataSelected] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const handleMarcarPresenca = async (alunoId: string, status: 'presente' | 'ausente' | 'limpar') => {
    await marcarPresenca(alunoId, status, dataSelected);
    await atualizarResumo();
  };

  const handleZerarLista = async () => {
    try {
      await zerarPresencas(dataSelected);
      await atualizarResumo();
    } catch (error: any) {
      console.error("Erro ao zerar lista:", error);
    }
  };

  const atualizarResumo = async () => {
    const novoResumo = await getResumoPresencas(dataSelected);
    setResumo(novoResumo);
  };

  const handleAtualizarLista = async () => {
    await refetch(dataSelected);
    await atualizarResumo();
  };

  useEffect(() => {
    if (alunosComPresenca.length > 0) {
      atualizarResumo();
    }
  }, [alunosComPresenca]);

  useEffect(() => {
    refetch(dataSelected);
  }, [dataSelected]);

  return (
    <DynamicLayout>
      <div className="space-y-mobile-gap md:space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white italic uppercase leading-tight">Monitoramento</h1>
          <p className="text-[11px] md:text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-80">Controle de presença e ocorrências</p>
        </div>

        <Tabs defaultValue="lista" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:flex md:items-center md:justify-start gap-2 bg-black-secondary border border-sidebar-border p-1 h-auto min-h-12 w-full">
            <TabsTrigger value="lista" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <Users className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Lista de Presença</span>
            </TabsTrigger>
            <TabsTrigger value="resumo" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <BarChart3 className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Resumo Geral</span>
            </TabsTrigger>
            <TabsTrigger value="ocorrencias" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <AlertCircle className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Ocorrências</span>
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <ClipboardList className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <ListaPresenca
              alunos={alunosComPresenca}
              loading={loading}
              onMarcarPresenca={handleMarcarPresenca}
              onAtualizarLista={handleAtualizarLista}
              onZerarLista={handleZerarLista}
              dataSelected={dataSelected}
              onDataChange={setDataSelected}
            />
          </TabsContent>

          <TabsContent value="resumo" className="animate-in fade-in duration-400">
            {resumo && (
              <ResumoPresencas
                resumo={resumo}
                dataSelected={dataSelected}
                loading={loading}
              />
            )}
          </TabsContent>

          <TabsContent value="ocorrencias" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <OcorrenciasManager
              alunos={alunosComPresenca}
              loadingAlunos={loading}
            />
          </TabsContent>

          <TabsContent value="relatorio" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <ListaHistorica alunos={alunosComPresenca} />
          </TabsContent>
        </Tabs>
      </div>
    </DynamicLayout>
  );
}