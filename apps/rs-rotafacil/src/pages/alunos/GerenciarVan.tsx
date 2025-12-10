import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { VanSelector } from "@/components/alunos/van-selector";
import { AlunoCard } from "@/components/alunos/aluno-card";
import { AlunoForm } from "@/components/alunos/aluno-form";
import { VanForm } from "@/components/alunos/van-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Users2, AlertCircle } from "lucide-react";
import { useVans } from "@/hooks/useVans";
import { useAlunos } from "@/hooks/useAlunos";
import { Aluno } from "@/types/alunos";
import { useToast } from "@/hooks/use-toast";

const GerenciarVan = () => {
  const [selectedVan, setSelectedVan] = useState<string | null>(null);
  const [showAlunoForm, setShowAlunoForm] = useState(false);
  const [showVanForm, setShowVanForm] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deletingAlunoId, setDeletingAlunoId] = useState<string | null>(null);

  const { vans, loading: vansLoading, createVan } = useVans();
  const { alunos, loading: alunosLoading, createAluno, updateAluno, deleteAluno } = useAlunos(selectedVan || undefined);
  const { toast } = useToast();

  const handleVanSelect = (vanId: string) => {
    setSelectedVan(vanId);
  };

  const handleAddAluno = () => {
    if (!selectedVan) {
      toast({
        title: "Atenção",
        description: "Selecione uma van primeiro.",
        variant: "destructive",
      });
      return;
    }
    setEditingAluno(null);
    setShowAlunoForm(true);
  };

  const handleEditAluno = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setShowAlunoForm(true);
  };

  const handleDeleteAluno = (id: string) => {
    setDeletingAlunoId(id);
  };

  const confirmDeleteAluno = async () => {
    if (deletingAlunoId) {
      await deleteAluno(deletingAlunoId);
      setDeletingAlunoId(null);
    }
  };

  const handleViewMap = (aluno: Aluno) => {
    const address = `${aluno.endereco_rua}, ${aluno.endereco_numero}, ${aluno.endereco_bairro}, ${aluno.endereco_cidade}, ${aluno.endereco_estado}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleSendWhatsApp = (whatsapp: string) => {
    // Remove todos os caracteres não numéricos
    const cleanNumber = whatsapp.replace(/\D/g, '');
    
    // Adiciona o código do país se não estiver presente
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAlunoSubmit = async (data: any) => {
    try {
      if (editingAluno) {
        await updateAluno(editingAluno.id, data);
      } else {
        await createAluno(data);
      }
      setShowAlunoForm(false);
      setEditingAluno(null);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleVanSubmit = async (data: { nome: string; capacidade_maxima: number }) => {
    try {
      const newVan = await createVan(data);
      setSelectedVan(newVan.id);
      setShowVanForm(false);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  if (vansLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando vans...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gerenciamento por <span className="text-gold">Van</span>
            </h1>
            <p className="text-muted-foreground">
              Gerencie os alunos organizados por van de transporte
            </p>
          </div>
        </div>

        {/* Van Selector */}
        <VanSelector
          vans={vans}
          selectedVan={selectedVan}
          onVanSelect={handleVanSelect}
          onAddVan={() => setShowVanForm(true)}
          alunosCount={alunos.length}
        />

        {/* Content */}
        {selectedVan ? (
          <div className="space-y-6">
            {/* Add Student Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Alunos da {vans.find(v => v.id === selectedVan)?.nome}
              </h2>
              <Button
                onClick={handleAddAluno}
                className="bg-gradient-gold text-black-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aluno
              </Button>
            </div>

            {/* Students List */}
            {alunosLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Carregando alunos...</p>
                </div>
              </div>
            ) : alunos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {alunos.map((aluno) => (
                  <AlunoCard
                    key={aluno.id}
                    aluno={aluno}
                    onEdit={handleEditAluno}
                    onDelete={handleDeleteAluno}
                    onViewMap={handleViewMap}
                    onSendWhatsApp={handleSendWhatsApp}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users2 className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhum aluno cadastrado
                  </h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Comece adicionando o primeiro aluno desta van.
                  </p>
                  <Button
                    onClick={handleAddAluno}
                    className="bg-gradient-gold text-black-primary hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Aluno
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-card border-border shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users2 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Selecione uma van
              </h3>
              <p className="text-muted-foreground text-center">
                Escolha uma van para visualizar e gerenciar seus alunos.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Forms */}
        <AlunoForm
          open={showAlunoForm}
          onClose={() => {
            setShowAlunoForm(false);
            setEditingAluno(null);
          }}
          onSubmit={handleAlunoSubmit}
          vans={vans}
          selectedVanId={selectedVan}
          editingAluno={editingAluno}
        />

        <VanForm
          open={showVanForm}
          onClose={() => setShowVanForm(false)}
          onSubmit={handleVanSubmit}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingAlunoId} onOpenChange={() => setDeletingAlunoId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este aluno? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAluno}
                className="bg-destructive hover:bg-destructive/90"
              >
                Remover Aluno
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default GerenciarVan;