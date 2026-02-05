import { MainLayout } from "@/components/layout/main-layout";
import { ResumoCard } from "@/components/financeiro/resumo-card";
import { GanhosSection } from "@/components/financeiro/ganhos-section";
import { GastosSection } from "@/components/financeiro/gastos-section";
import { ResultadoSection } from "@/components/financeiro/resultado-section";
import { RelatorioVansSection } from "@/components/financeiro/relatorio-vans-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { Wallet, CreditCard, BarChart3, TrendingUp, User, Target, Briefcase } from "lucide-react";
import { OwnerBudgetCard } from "@/components/financeiro/owner-budget-card";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { exportFinanceiroToExcel, exportContadorReport } from "@/utils/exportFinanceiro";
import { Download, FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const FinanceiroIndex = () => {
  const financeiro = useFinanceiro();
  const [searchParams, setSearchParams] = useSearchParams();
  const [itemToOpen, setItemToOpen] = useState<{ id: string, tipo: string } | null>(null);
  const [activeTab, setActiveTab] = useState("receitas");

  // Ler parâmetros da URL e abrir dialog automaticamente
  useEffect(() => {
    const openItemId = searchParams.get('openItem');
    const tipo = searchParams.get('tipo');

    if (openItemId && tipo) {
      setItemToOpen({ id: openItemId, tipo });
      // Mudar para a aba correta
      if (tipo === 'mensalidade') {
        setActiveTab('receitas');
      } else if (tipo === 'despesa') {
        setActiveTab('despesas');
      }
      // Limpar parâmetros da URL após ler
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (financeiro.loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Sincronizando livro caixa...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-full space-y-6 pb-20">
        {/* Header Premium */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-8 bg-gold" />
              <span className="text-gold text-[10px] font-bold tracking-widest uppercase">Gestão Financeira RS</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              Fluxo de <span className="text-gold">Caixa</span>
              <div className="bg-gold/10 px-2 py-0.5 rounded text-[10px] text-gold border border-gold/20 font-bold uppercase">Pro</div>
            </h1>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mt-1">
              {mesAtual} • Inteligência de Dados
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => exportContadorReport(financeiro.lancamentos, mesAtual)}
              variant="outline"
              className="bg-black/40 border-gold/30 text-gold hover:bg-gold/10 h-11 px-4 rounded-xl font-bold gap-2 text-xs"
            >
              <FileDown className="w-4 h-4" />
              RELATÓRIO CONTADOR
            </Button>

            <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-xl border border-border/50">
              <div className="px-3 py-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-foreground">Sincronizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Principal */}
        <ResumoCard resumo={financeiro.resumo} />

        {/* Dashboard de Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-card/40 p-2 rounded-2xl border border-border/40 shadow-sm backdrop-blur-sm">
            <TabsList className="bg-transparent border-none h-auto p-0 gap-1 md:gap-2 flex-wrap">
              <TabsTrigger
                value="receitas"
                className="data-[state=active]:bg-gold data-[state=active]:text-white h-10 px-4 md:px-6 rounded-xl font-bold transition-all flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20"
              >
                <TrendingUp className="w-4 h-4" />
                Receitas
              </TabsTrigger>
              <TabsTrigger
                value="despesas"
                className="data-[state=active]:bg-gold data-[state=active]:text-white h-10 px-4 md:px-6 rounded-xl font-bold transition-all flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20"
              >
                <Briefcase className="w-4 h-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger
                value="retiradas"
                className="data-[state=active]:bg-gold data-[state=active]:text-white h-10 px-4 md:px-6 rounded-xl font-bold transition-all flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20"
              >
                <User className="w-4 h-4" />
                Pró-labore
              </TabsTrigger>
              <TabsTrigger
                value="relatorio"
                className="data-[state=active]:bg-gold data-[state=active]:text-white h-10 px-4 md:px-6 rounded-xl font-bold transition-all flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20"
              >
                <BarChart3 className="w-4 h-4" />
                Por Van
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:flex items-center gap-4 px-4 border-l border-border/50">
              <div className="text-right">
                <p className="text-[9px] text-muted-foreground font-black uppercase">Saldo Corrente</p>
                <p className={`text-sm font-black ${financeiro.resumo.saldoFinal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeiro.resumo.saldoFinal)}
                </p>
              </div>
              <div className="h-8 w-8 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20">
                <Wallet className="w-4 h-4 text-gold" />
              </div>
            </div>
          </div>

          <TabsContent value="receitas" className="mt-0 focus-visible:ring-0">
            <GanhosSection
              lancamentos={financeiro.lancamentos}
              resumo={financeiro.resumo}
              onMarcarRealizado={financeiro.onMarcarRealizado}
              onCriarLancamento={financeiro.onCriarLancamento}
              onEditarLancamento={financeiro.onEditarLancamento}
              onDeleteLancamento={financeiro.onDeleteLancamento}
              onGerarMensalidades={financeiro.onGerarMensalidades}
              onLimparPendencias={financeiro.onLimparPendencias}
              onGerarPix={financeiro.onGerarPix}
              onGerarCheckout={financeiro.onGerarCheckout}
              onAtualizarStatus={financeiro.onAtualizarStatus}
              onRefresh={financeiro.refetch}
              onExport={() => exportFinanceiroToExcel(
                financeiro.lancamentos.filter(l => l.tipo === 'receita'),
                `Receitas_${mesAtual.replace('/', '_')}`
              )}
              itemToOpen={itemToOpen?.tipo === 'mensalidade' ? itemToOpen.id : undefined}
            />
          </TabsContent>

          <TabsContent value="despesas" className="mt-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GastosSection
                  title="Custos da Empresa"
                  gastos={financeiro.lancamentos.filter(l => l.tipo === 'despesa' && l.alocacao !== 'dono')}
                  onMarcarGasto={financeiro.onMarcarRealizado}
                  onCriarGasto={data => financeiro.onCriarLancamento({ ...data, tipo: 'despesa', alocacao: 'empresa' })}
                  onEditarGasto={financeiro.onEditarLancamento}
                  onDeleteGasto={financeiro.onDeleteLancamento}
                  onRefresh={financeiro.refetch}
                  onExport={() => exportFinanceiroToExcel(
                    financeiro.lancamentos.filter(l => l.tipo === 'despesa' && l.alocacao !== 'dono'),
                    `Despesas_Empresa_${mesAtual.replace('/', '_')}`
                  )}
                  itemToOpen={itemToOpen?.tipo === 'despesa' ? itemToOpen.id : undefined}
                  totalGanhos={financeiro.resumo.totalGanhos}
                  totalGlobalEmpresa={financeiro.resumo.totalGastosEmpresa}
                  totalGlobalDono={financeiro.resumo.totalRetiradaDono}
                />
              </div>
              <div>
                <ResultadoSection resumo={financeiro.resumo} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retiradas" className="mt-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GastosSection
                  title="Retiradas de Pró-labore"
                  gastos={financeiro.lancamentos.filter(l => l.tipo === 'despesa' && l.alocacao === 'dono')}
                  onMarcarGasto={financeiro.onMarcarRealizado}
                  onCriarGasto={data => financeiro.onCriarLancamento({ ...data, tipo: 'despesa', alocacao: 'dono', categoria: 'RETIRADA' })}
                  onEditarGasto={financeiro.onEditarLancamento}
                  onDeleteGasto={financeiro.onDeleteLancamento}
                  onRefresh={financeiro.refetch}
                  onExport={() => exportFinanceiroToExcel(
                    financeiro.lancamentos.filter(l => l.tipo === 'despesa' && l.alocacao === 'dono'),
                    `Pro_Labore_${mesAtual.replace('/', '_')}`
                  )}
                  itemToOpen={itemToOpen?.tipo === 'despesa' ? itemToOpen.id : undefined}
                  totalGanhos={financeiro.resumo.totalGanhos}
                  totalGlobalEmpresa={financeiro.resumo.totalGastosEmpresa}
                  totalGlobalDono={financeiro.resumo.totalRetiradaDono}
                />
              </div>
              <div className="space-y-6">
                <OwnerBudgetCard
                  resumo={financeiro.resumo}
                  onUpdateMeta={financeiro.onUpdateMeta}
                />
                <ResultadoSection resumo={financeiro.resumo} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relatorio" className="mt-0 focus-visible:ring-0">
            <RelatorioVansSection
              lancamentos={financeiro.lancamentos}
              resumo={financeiro.resumo}
            />
          </TabsContent>
        </Tabs>
      </div >
    </MainLayout >
  );
};

export default FinanceiroIndex;