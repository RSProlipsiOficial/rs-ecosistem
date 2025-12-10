import { MainLayout } from "@/components/layout/main-layout";
import { ResumoCard } from "@/components/financeiro/resumo-card";
import { GanhosSection } from "@/components/financeiro/ganhos-section";
import { GastosSection } from "@/components/financeiro/gastos-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceiro } from "@/hooks/useFinanceiro";

const FinanceiroIndex = () => {
  const {
    pagamentosMensais,
    ganhosExtras,
    gastos,
    resumo,
    loading,
    marcarPagamentoComoPago,
    marcarGastoComoPago,
    criarGanhoExtra,
    criarGasto,
    editarGasto,
  } = useFinanceiro();

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados financeiros...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="px-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Módulo <span className="text-gold">Financeiro</span>
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Controle completo de ganhos e gastos - {mesAtual}
          </p>
        </div>

        {/* Resumo Geral */}
        <ResumoCard resumo={resumo} />

        {/* Tabs para Ganhos e Gastos */}
        <Tabs defaultValue="ganhos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ganhos" className="flex items-center gap-2">
              💰 <span className="hidden sm:inline">Ganhos</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="flex items-center gap-2">
              💸 <span className="hidden sm:inline">Gastos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ganhos" className="space-y-6">
            <GanhosSection
              pagamentosMensais={pagamentosMensais}
              ganhosExtras={ganhosExtras}
              onMarcarPagamento={marcarPagamentoComoPago}
              onCriarGanhoExtra={criarGanhoExtra}
            />
          </TabsContent>

          <TabsContent value="gastos" className="space-y-6">
            <GastosSection
              gastos={gastos}
              onMarcarGasto={marcarGastoComoPago}
              onCriarGasto={criarGasto}
              onEditarGasto={editarGasto}
            />
          </TabsContent>
        </Tabs>

        {/* Gráfico de Comparação (placeholder para futuro) */}
        <div className="mt-8">
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4 px-1">
            📈 Comparativo Mensal
          </h2>
          <div className="bg-card border border-border rounded-lg p-6 lg:p-8 text-center">
            <p className="text-muted-foreground text-sm lg:text-base">
              Gráfico de comparação será implementado em breve
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FinanceiroIndex;