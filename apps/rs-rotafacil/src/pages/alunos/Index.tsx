import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Bus, FileText, School } from "lucide-react";
import { VanManager } from "@/components/alunos/van-manager";
import { AlunoManager } from "@/components/alunos/aluno-manager";
import { ContractManager } from "@/components/alunos/contract-manager";
import { ColegiosManager } from "@/components/alunos/colegios-manager";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PlanLimitWarning } from "@/components/common/plan-limit-warning";

export default function AlunosIndex() {
  const { limits } = usePlanLimits();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.tipo_usuario || session?.user?.user_metadata?.user_type || 'usuario';
      setUserRole(role);
    };
    getUser();
  }, []);

  const isTeam = userRole === 'motorista' || userRole === 'monitora';

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-dark text-foreground">
        <Tabs defaultValue={isTeam ? "alunos" : "vans"} className="w-full">
          {/* Sticky Header com Tabs - SOMENTE NAVEGAÇÃO É STICKY */}
          <div className="sticky top-0 z-40 bg-black/95 border-b border-gold/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <TabsList className={`grid w-full gap-2 p-1 bg-black-secondary border border-white/5 rounded-xl ${isTeam ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4"} h-auto`}>
                {!isTeam && (
                  <TabsTrigger
                    value="vans"
                    className="flex items-center justify-center gap-2 h-12 px-3 data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all rounded-lg border border-transparent data-[state=active]:border-gold/30"
                  >
                    <Bus className="w-4 h-4" />
                    <span>Vans</span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="alunos"
                  className="flex items-center justify-center gap-2 h-12 px-3 data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all rounded-lg border border-transparent data-[state=active]:border-gold/30"
                >
                  <Users className="w-4 h-4" />
                  <span>Alunos</span>
                </TabsTrigger>
                {!isTeam && (
                  <>
                    <TabsTrigger
                      value="colegios"
                      className="flex items-center justify-center gap-2 h-12 px-3 data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all rounded-lg border border-transparent data-[state=active]:border-gold/30"
                    >
                      <School className="w-4 h-4" />
                      <span>Colégios</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="contratos"
                      className="flex items-center justify-center gap-2 h-12 px-3 data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all rounded-lg border border-transparent data-[state=active]:border-gold/30"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Contratos</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>
          </div>

          {/* Conteúdo - Fora do Sticky para scrollar normalmente */}
          {/* pt-48 no mobile para garantir espaço abaixo das abas (2x2 grid) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-48 pb-10 sm:pt-20 space-y-8 overflow-y-auto">
            {!isTeam && (
              <TabsContent value="vans" className="mt-0 outline-none">
                {limits?.nearVanLimit && (
                  <PlanLimitWarning
                    type="van"
                    current={limits.currentUsage.vans}
                    max={limits.max_vans!}
                    planName={limits.planName}
                    className="mb-6"
                  />
                )}
                <VanManager />
              </TabsContent>
            )}

            <TabsContent value="alunos" className="mt-0 outline-none">
              {limits?.nearStudentLimit && (
                <PlanLimitWarning
                  type="student"
                  current={limits.currentUsage.students}
                  max={limits.max_alunos!}
                  planName={limits.planName}
                  className="mb-6"
                />
              )}
              <AlunoManager />
            </TabsContent>

            {!isTeam && (
              <TabsContent value="colegios" className="mt-0 outline-none">
                <ColegiosManager />
              </TabsContent>
            )}

            {!isTeam && (
              <TabsContent value="contratos" className="mt-0 outline-none">
                <ContractManager />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
