import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ListaPresenca } from '@/components/monitora/lista-presenca';
import { ResumoPresencas } from '@/components/monitora/resumo-presencas';
import { usePresenca } from '@/hooks/usePresenca';
import { ResumoGeralPresenca } from '@/types/presenca';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart3 } from 'lucide-react';

export default function MonitoraIndex() {
  const {
    alunosComPresenca,
    loading,
    marcarPresenca,
    getResumoPresencas,
    refetch,
  } = usePresenca();

  const [resumo, setResumo] = useState<ResumoGeralPresenca | null>(null);
  const [dataSelected, setDataSelected] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const handleMarcarPresenca = async (alunoId: string, status: 'presente' | 'ausente') => {
    await marcarPresenca(alunoId, status, dataSelected);
    await atualizarResumo();
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
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista da Monitora</h1>
          <p className="text-muted-foreground">
            Controle de presença diária dos alunos por colégio
          </p>
        </div>

        <Tabs defaultValue="lista" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lista" className="gap-2">
              <Users className="h-4 w-4" />
              Lista de Presença
            </TabsTrigger>
            <TabsTrigger value="resumo" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumo Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-6">
            <ListaPresenca
              alunos={alunosComPresenca}
              loading={loading}
              onMarcarPresenca={handleMarcarPresenca}
              onAtualizarLista={handleAtualizarLista}
              dataSelected={dataSelected}
              onDataChange={setDataSelected}
            />
          </TabsContent>

          <TabsContent value="resumo" className="space-y-6">
            {resumo && (
              <ResumoPresencas
                resumo={resumo}
                dataSelected={dataSelected}
                loading={loading}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}