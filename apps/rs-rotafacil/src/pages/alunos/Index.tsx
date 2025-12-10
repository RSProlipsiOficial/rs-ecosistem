import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Bus } from "lucide-react";
import { VanManager } from "@/components/alunos/van-manager";
import { AlunoManager } from "@/components/alunos/aluno-manager";

export default function AlunosIndex() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-dark text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gold">Gerenciamento de Alunos</h1>
            <p className="text-muted-foreground">
              Gerencie suas vans e alunos de forma organizada
            </p>
          </div>

          <Tabs defaultValue="vans" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="vans" className="flex items-center gap-2">
                <Bus className="w-4 h-4" />
                Vans
              </TabsTrigger>
              <TabsTrigger value="alunos" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Alunos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vans">
              <VanManager />
            </TabsContent>

            <TabsContent value="alunos">
              <AlunoManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}