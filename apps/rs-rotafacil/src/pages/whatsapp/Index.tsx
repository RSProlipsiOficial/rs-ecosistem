import { MainLayout } from "@/components/layout/main-layout";
import { WhatsAppManager } from "@/components/whatsapp/whatsapp-manager";

const WhatsAppPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Baileys</h1>
          <p className="text-muted-foreground">
            Configure instâncias WhatsApp e envie mensagens automatizadas com IA
          </p>
        </div>
        
        <WhatsAppManager />
      </div>
    </MainLayout>
  );
};

export default WhatsAppPage;