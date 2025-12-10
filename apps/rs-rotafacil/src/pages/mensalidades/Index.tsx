import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CreditCard, Users } from "lucide-react";
import { MensalidadeResumoCard } from "@/components/mensalidades/mensalidade-resumo";
import { MensalidadeFiltrosCard } from "@/components/mensalidades/mensalidade-filtros";
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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Controle de <span className="text-gold">Mensalidades</span>
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Gerenciamento completo de pagamentos - {mesNome}
            </p>
          </div>
          
          <Button
            onClick={() => setShowConfigModal(true)}
            variant="outline"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="resumo" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Resumo & Cobrança
            </TabsTrigger>
            <TabsTrigger value="pagamentos" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gestão de Pagamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            {/* Filtros */}
            <MensalidadeFiltrosCard 
              filtros={filtros} 
              onFiltrosChange={setFiltros} 
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

          <TabsContent value="pagamentos">
            <PagamentosManager />
          </TabsContent>
        </Tabs>

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