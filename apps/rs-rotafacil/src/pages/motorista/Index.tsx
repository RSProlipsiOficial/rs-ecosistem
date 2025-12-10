import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ChecklistForm } from '@/components/motorista/checklist-form';
import { ChecklistHistorico } from '@/components/motorista/checklist-historico';
import { ChecklistTable } from '@/components/motorista/checklist-table';
import { ChecklistDetalhesModal } from '@/components/motorista/checklist-detalhes-modal';
import { ChecklistResumo } from '@/components/motorista/checklist-resumo';
import { ChecklistItemsConfig } from '@/components/motorista/checklist-items-config';
import { ManutencaoForm } from '@/components/motorista/manutencao-form';
import { ManutencaoHistorico } from '@/components/motorista/manutencao-historico';
import { ManutencaoDetalhesModal } from '@/components/motorista/manutencao-detalhes-modal';
import { ManutencaoResumo } from '@/components/motorista/manutencao-resumo';
import { ListaPresenca } from '@/components/monitora/lista-presenca';
import { useMotorista } from '@/hooks/useMotorista';
import { useManutencao } from '@/hooks/useManutencao';
import { usePresenca } from '@/hooks/usePresenca';
import { ChecklistMotorista } from '@/types/motorista';
import { ManutencaoVan } from '@/types/manutencao';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, History, BarChart3, Settings, Wrench, Users } from 'lucide-react';

export default function MotoristaIndex() {
  const {
    checklists,
    loading,
    createChecklist,
    getResumoChecklists,
  } = useMotorista();

  const {
    manutencoes,
    loading: manutencaoLoading,
    createManutencao,
    markAsCompleted,
    getResumoManutencoes,
  } = useManutencao();

  const {
    alunosComPresenca,
    loading: loadingPresenca,
    refetch: refetchPresenca,
  } = usePresenca();

  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistMotorista | null>(null);
  const [selectedManutencao, setSelectedManutencao] = useState<ManutencaoVan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      await createChecklist(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManutencaoSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      await createManutencao(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (checklist: ChecklistMotorista) => {
    setSelectedChecklist(checklist);
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      setIsSubmitting(true);
      await markAsCompleted(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewManutencaoDetails = (manutencao: ManutencaoVan) => {
    setSelectedManutencao(manutencao);
  };

  const resumo = getResumoChecklists();
  const resumoManutencao = getResumoManutencoes();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Motorista</h1>
          <p className="text-muted-foreground">
            Gerenciamento de checklists diários de segurança do veículo
          </p>
        </div>

        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resumo" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Novo Checklist
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="gap-2">
              <Wrench className="h-4 w-4" />
              Manutenção do Veículo
            </TabsTrigger>
            <TabsTrigger value="lista-monitora" className="gap-2">
              <Users className="h-4 w-4" />
              Lista da Monitora
            </TabsTrigger>
            <TabsTrigger value="historico-checklists" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Checklists (Tabela)
            </TabsTrigger>
            <TabsTrigger value="historico-lista" className="gap-2">
              <History className="h-4 w-4" />
              Checklists (Lista)
            </TabsTrigger>
            <TabsTrigger value="historico-manutencao" className="gap-2">
              <Wrench className="h-4 w-4" />
              Manutenção
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <ChecklistResumo resumo={resumo} />
            <ManutencaoResumo resumo={resumoManutencao} />
            
            {checklists.length > 0 && (
              <ChecklistHistorico
                checklists={checklists.slice(0, 5)} // Mostrar apenas os 5 mais recentes
                onViewDetails={handleViewDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="checklist" className="space-y-6">
            <ChecklistForm
              onSubmit={handleSubmit}
              loading={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="manutencao" className="space-y-6">
            <ManutencaoForm
              onSubmit={handleManutencaoSubmit}
              loading={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="historico-checklists" className="space-y-6">
            <ChecklistTable
              checklists={checklists}
              onViewDetails={handleViewDetails}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="historico-lista" className="space-y-6">
            <ChecklistHistorico
              checklists={checklists}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="lista-monitora" className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Lista da Monitora (Visualização)</h3>
              <p className="text-sm text-muted-foreground">
                Visualização da lista de presença dos alunos marcada pela monitora
              </p>
            </div>
            <ListaPresenca
              alunos={alunosComPresenca}
              loading={loadingPresenca}
              onMarcarPresenca={() => {}} // Motorista não pode marcar presença
              onAtualizarLista={refetchPresenca}
              dataSelected={new Date().toISOString().split('T')[0]}
              onDataChange={() => {}} // Motorista não pode alterar data
              readOnly={true}
            />
          </TabsContent>

          <TabsContent value="historico-manutencao" className="space-y-6">
            <ManutencaoHistorico
              manutencoes={manutencoes}
              onViewDetails={handleViewManutencaoDetails}
              onMarkCompleted={handleMarkCompleted}
              loading={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="configuracoes" className="space-y-6">
            <ChecklistItemsConfig />
          </TabsContent>
        </Tabs>

        <ChecklistDetalhesModal
          checklist={selectedChecklist}
          open={!!selectedChecklist}
          onOpenChange={(open) => !open && setSelectedChecklist(null)}
        />

        <ManutencaoDetalhesModal
          manutencao={selectedManutencao}
          open={!!selectedManutencao}
          onOpenChange={(open) => !open && setSelectedManutencao(null)}
        />
      </div>
    </MainLayout>
  );
}