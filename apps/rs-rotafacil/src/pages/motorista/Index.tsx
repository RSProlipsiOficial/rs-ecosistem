
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DynamicLayout } from "@/components/layout/dynamic-layout";
import { ChecklistForm } from '@/components/motorista/checklist-form';
import { ChecklistHistorico } from '@/components/motorista/checklist-historico';
import { ChecklistResumo } from '@/components/motorista/checklist-resumo';
import { useMotorista } from '@/hooks/useMotorista';
import { usePresenca } from '@/hooks/usePresenca';
import { useManutencao } from '@/hooks/useManutencao';
import { ChecklistMotorista } from '@/types/motorista';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ChecklistDetalhesModal } from '@/components/motorista/checklist-detalhes-modal';
import { ManutencaoForm } from '@/components/motorista/manutencao-form';
import { ManutencaoHistorico } from '@/components/motorista/manutencao-historico';
import { ManutencaoResumo } from '@/components/motorista/manutencao-resumo';
import { ManutencaoDetalhesModal } from '@/components/motorista/manutencao-detalhes-modal';
import { ChecklistItemsConfig } from '@/components/motorista/checklist-items-config';
import { ListaPresenca } from '@/components/monitora/lista-presenca';
import {
  CheckCircle,
  History,
  BarChart3,
  Users,
  Wrench,
  Settings,
  ClipboardList
} from 'lucide-react';

interface MotoristaIndexProps {
  customUserId?: string;
}

export default function MotoristaIndex({ customUserId }: MotoristaIndexProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'checklist';
  const {
    checklists,
    createChecklist,
    getResumoChecklists,
  } = useMotorista(customUserId);

  const {
    manutencoes,
    createManutencao,
    getResumoManutencoes,
  } = useManutencao(customUserId);

  const {
    alunosComPresenca,
    loading: loadingPresenca,
    marcarPresenca,
    refetch: refetchPresenca,
  } = usePresenca(customUserId);

  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistMotorista | null>(null);
  const [selectedManutencao, setSelectedManutencao] = useState<any | null>(null);
  const [isSubmittingChecklist, setIsSubmittingChecklist] = useState(false);
  const [isSubmittingManutencao, setIsSubmittingManutencao] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserRole(session?.user?.user_metadata?.tipo_usuario || session?.user?.user_metadata?.user_type || 'usuario');
    };
    checkRole();
  }, []);

  const isTeam = userRole === 'motorista' || userRole === 'monitora';


  const handleMarcarPresenca = async (alunoId: string, status: 'presente' | 'ausente') => {
    try {
      await marcarPresenca(alunoId, status);
      await refetchPresenca();
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
    }
  };


  const handleChecklistSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmittingChecklist(true);
      await createChecklist(data);
    } finally {
      setIsSubmittingChecklist(false);
    }
  };

  const handleManutencaoSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmittingManutencao(true);
      await createManutencao(data);
    } finally {
      setIsSubmittingManutencao(false);
    }
  };

  const resumoChecklist = getResumoChecklists();
  const resumoManutencao = getResumoManutencoes();

  return (
    <DynamicLayout>
      <div className="space-y-mobile-gap md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white italic uppercase leading-tight">Portal do Motorista</h1>
          <p className="text-muted-foreground text-sm md:text-base">Controle de vistorias, manutenção e rota</p>
        </div>

        <Tabs
          value={tabFromUrl}
          onValueChange={(value) => {
            setSearchParams({ tab: value });
          }}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-black-secondary border border-sidebar-border p-1 h-auto min-h-12 w-full">
            <TabsTrigger value="checklist" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <CheckCircle className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Vistoria</span>
            </TabsTrigger>
            <TabsTrigger value="resumo" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <BarChart3 className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Status Diário</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <History className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <Wrench className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Manutenção</span>
            </TabsTrigger>
            <TabsTrigger value="rota" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
              <Users className="h-4 w-4" />
              <span className="font-bold uppercase text-[10px]">Rota</span>
            </TabsTrigger>
            {!isTeam && (
              <TabsTrigger value="config" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gold data-[state=active]:text-black-primary transition-all">
                <Settings className="h-4 w-4" />
                <span className="font-bold uppercase text-[10px]">Configurações</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="checklist" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <ChecklistForm
              onSubmit={handleChecklistSubmit}
              loading={isSubmittingChecklist}
            />
          </TabsContent>

          <TabsContent value="resumo" className="animate-in fade-in duration-400 space-y-8">
            {resumoChecklist && <ChecklistResumo resumo={resumoChecklist} />}
            {resumoManutencao && <ManutencaoResumo resumo={resumoManutencao} />}
          </TabsContent>

          <TabsContent value="historico" className="animate-in fade-in duration-400">
            {checklists && (
              <ChecklistHistorico
                checklists={checklists}
                onViewDetails={setSelectedChecklist}
              />
            )}
          </TabsContent>

          <TabsContent value="manutencao" className="animate-in fade-in duration-400 space-y-6">
            <ManutencaoForm
              onSubmit={handleManutencaoSubmit}
              loading={isSubmittingManutencao}
            />
            {manutencoes && (
              <ManutencaoHistorico
                manutencoes={manutencoes}
                onViewDetails={setSelectedManutencao}
              />
            )}
          </TabsContent>

          <TabsContent value="rota" className="animate-in fade-in duration-400">
            <div className="space-y-4">
              <div className="bg-gold/10 border border-gold/20 p-4 rounded-xl">
                <p className="text-sm text-gold font-bold">Acompanhamento em Tempo Real</p>
                <p className="text-xs text-muted-foreground">Visualize os alunos escalados para a rota hoje.</p>
              </div>
              {alunosComPresenca && (
                <ListaPresenca
                  alunos={alunosComPresenca}
                  loading={loadingPresenca}
                  onMarcarPresenca={handleMarcarPresenca}
                  onAtualizarLista={refetchPresenca}
                  dataSelected={new Date().toISOString().split('T')[0]}
                  onDataChange={() => { }}
                  readOnly={false}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" className="animate-in fade-in duration-400">
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
    </DynamicLayout>
  );
}