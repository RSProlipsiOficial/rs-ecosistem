import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CreditCard, Users } from "lucide-react";
import { MensalidadeResumoCard } from "@/components/mensalidades/mensalidade-resumo";
import { MensalidadeControles } from "@/components/mensalidades/mensalidade-controles";
import { MensalidadeTabela } from "@/components/mensalidades/mensalidade-tabela";
import { PagamentosManager } from "@/components/mensalidades/pagamentos-manager";
import { EnviarMensagemModal } from "@/components/mensalidades/enviar-mensagem-modal";
import { ConfigModal } from "@/components/mensalidades/config-modal";
import { useMensalidades } from "@/hooks/useMensalidades";
import { MensalidadeFiltros, PagamentoComAluno, EnviarMensagemData } from "@/types/mensalidades";

const MensalidadesIndex = () => {
  const currentDate = new Date();
  const [filtros, setFiltros] = useState<MensalidadeFiltros>({
    mes: currentDate.getMonth() + 1,
    ano: currentDate.getFullYear(),
    status: undefined,
    van_id: undefined,
  });

  const [showMensagemModal, setShowMensagemModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<PagamentoComAluno | null>(null);

  const {
    pagamentos,
    resumo,
    config,
    loading,
    marcarComoPago,
    atualizarDataVencimento,
    salvarConfig,
    enviarMensagem,
    gerarMensagemPersonalizada,
    refetch,
  } = useMensalidades(filtros);

  const mesNome = new Date(filtros.ano, filtros.mes - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const handleEnviarMensagem = (pagamento: PagamentoComAluno) => {
    setPagamentoSelecionado(pagamento);
    setShowMensagemModal(true);
  };

  const handleEnviarMensagemSubmit = async (conteudo: string, whatsapp: string) => {
    if (!pagamentoSelecionado) return;

    const dados: EnviarMensagemData = {
      pagamento_id: pagamentoSelecionado.id,
      tipo_mensagem: 'manual',
      conteudo,
      whatsapp_responsavel: whatsapp,
    };

    await enviarMensagem(dados);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando mensalidades...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-dark">
        {/* Mobile Optimized Header - Sticky */}
        <div className="sticky top-0 z-50 bg-black border-b border-gold/20 backdrop-blur-sm">
          <div className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gold truncate" translate="no">
                  Mensalidades
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Gerencie as mensalidades e recebimentos
                </p>
              </div>
              <Button
                onClick={() => setShowConfigModal(true)}
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground whitespace-nowrap self-start sm:self-auto h-10"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Configurações</span>
                <span className="sm:hidden">Config</span>
              </Button>
            </div>
          </div>

          {/* Tabs Sticky Below Header */}
          <Tabs defaultValue="resumo" className="w-full">
            <TabsList className="w-full grid grid-cols-2 gap-1 p-1 bg-black-secondary/80 rounded-none border-t border-gold/10">
              <TabsTrigger value="resumo" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm h-10 whitespace-nowrap">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Resumo & Cobrança</span>
                <span className="xs:inline sm:hidden">Resumo</span>
              </TabsTrigger>
              <TabsTrigger value="pagamentos" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm h-10 whitespace-nowrap">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Gestão de Pagamentos</span>
                <span className="xs:inline sm:hidden">Gestão</span>
              </TabsTrigger>
            </TabsList>

            {/* Content with proper padding */}
            <div className="p-2 sm:p-4 md:p-6">
              <TabsContent value="resumo" className="space-y-4 sm:space-y-6 mt-0">
                {/* Filtros Premium */}
                <MensalidadeControles
                  filtros={filtros}
                  onFiltrosChange={setFiltros}
                  onRefresh={refetch}
                  loading={loading}
                />

                {/* Resumo */}
                <MensalidadeResumoCard resumo={resumo} />

                {/* Tabela de Mensalidades */}
                <MensalidadeTabela
                  pagamentos={pagamentos}
                  onMarcarComoPago={marcarComoPago}
                  onEnviarMensagem={handleEnviarMensagem}
                  onAtualizarDataVencimento={atualizarDataVencimento}
                />
              </TabsContent>

              <TabsContent value="pagamentos" className="mt-0">
                <PagamentosManager />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Modais */}
        <EnviarMensagemModal
          open={showMensagemModal}
          onClose={() => {
            setShowMensagemModal(false);
            setPagamentoSelecionado(null);
          }}
          pagamento={pagamentoSelecionado}
          config={config}
          onEnviar={handleEnviarMensagemSubmit}
          onGerarMensagem={gerarMensagemPersonalizada}
        />

        <ConfigModal
          open={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          config={config}
          onSalvar={salvarConfig}
        />
      </div>
    </MainLayout>
  );
};

export default MensalidadesIndex;
