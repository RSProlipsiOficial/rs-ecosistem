import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AlunosIndex from "./pages/alunos/Index";
import GerenciarVan from "./pages/alunos/GerenciarVan";
import FinanceiroIndex from "./pages/financeiro/Index";
import MensalidadesIndex from "./pages/mensalidades/Index";
import MotoristaIndex from "./pages/motorista/Index";
import MonitoraIndex from "./pages/monitora/Index";
import WhatsAppIndex from "./pages/whatsapp/Index";
import EducacaoFinanceiraIndex from "./pages/educacao-financeira/Index";
import UpgradeIndex from "./pages/upgrade/Index";
import SuporteIndex from "./pages/suporte/Index";
import PerfilIndex from "./pages/perfil/Index";
import AuthIndex from "./pages/auth/Index";
import LandingIndex from "./pages/landing/Index";

import SiteIndex from "./pages/site/Index";
import IndicacaoIndex from "./pages/indicacao/Index";
import IAIndex from "./pages/ia/Index";
import ImportarIndex from "./pages/importar/Index";
import AdminIndex from "./pages/admin/Index";
import AdminAppsIndex from "./pages/admin/apps/Index";
import AdminVideosIndex from "./pages/admin/videos/Index";
import AdminTutoriaisIndex from "./pages/admin/tutoriais/Index";
import AdminSuporteIndex from "./pages/admin/suporte/Index";
import AdminSiteIndex from "./pages/admin/site/Index";
import AdminPacksIndex from "./pages/admin/packs/Index";
import AdminCreditosIAIndex from "./pages/admin/creditos-ia/Index";
import AdminUsuariosIndex from "./pages/admin/usuarios/Index";
import AdminLoginIndex from "./pages/admin/login/Index";
import ConsultorCadastroIndex from "./pages/consultor/cadastro/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingIndex />} />
          <Route path="/app" element={<Index />} />
          <Route path="/alunos" element={<AlunosIndex />} />
          <Route path="/alunos/gerenciar-van" element={<GerenciarVan />} />
        <Route path="/financeiro" element={<FinanceiroIndex />} />
        <Route path="/mensalidades" element={<MensalidadesIndex />} />
        <Route path="/motorista" element={<MotoristaIndex />} />
          <Route path="/monitora" element={<MonitoraIndex />} />
          <Route path="/whatsapp" element={<WhatsAppIndex />} />
          <Route path="/educacao-financeira" element={<EducacaoFinanceiraIndex />} />
          <Route path="/upgrade" element={<UpgradeIndex />} />
          <Route path="/suporte" element={<SuporteIndex />} />
          <Route path="/perfil" element={<PerfilIndex />} />
          <Route path="/auth" element={<AuthIndex />} />
          <Route path="/landing" element={<LandingIndex />} />
          
          <Route path="/site" element={<SiteIndex />} />
          <Route path="/indicacao" element={<IndicacaoIndex />} />
          <Route path="/ia" element={<IAIndex />} />
          <Route path="/importar" element={<ImportarIndex />} />
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/admin/apps" element={<AdminAppsIndex />} />
          <Route path="/admin/videos" element={<AdminVideosIndex />} />
          <Route path="/admin/tutoriais" element={<AdminTutoriaisIndex />} />
          <Route path="/admin/suporte" element={<AdminSuporteIndex />} />
          <Route path="/admin/site" element={<AdminSiteIndex />} />
          <Route path="/admin/packs" element={<AdminPacksIndex />} />
          <Route path="/admin/creditos-ia" element={<AdminCreditosIAIndex />} />
          <Route path="/admin/usuarios" element={<AdminUsuariosIndex />} />
          <Route path="/admin/login" element={<AdminLoginIndex />} />
          <Route path="/consultor/cadastro" element={<ConsultorCadastroIndex />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;