import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, Plus, Edit, Trash2, Users, Link } from "lucide-react";
import { VanForm } from "./van-form";
import { useVans } from "@/hooks/useVans";
import { useAlunos } from "@/hooks/useAlunos";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Van } from "@/types/alunos";

export function VanManager() {
  const { vans, loading: vansLoading, createVan, updateVan, deleteVan } = useVans();
  const { alunos, loading: alunosLoading } = useAlunos();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVan, setEditingVan] = useState<Van | null>(null);
  const [deletingVan, setDeletingVan] = useState<Van | null>(null);
  const { toast } = useToast();

  const handleVanSubmit = async (data: any) => {
    try {
      if (editingVan) {
        await updateVan(editingVan.id, data);
        toast({
          title: "Sucesso",
          description: "Van atualizada com sucesso!",
        });
      } else {
        await createVan(data);
        toast({
          title: "Sucesso",
          description: "Van criada com sucesso!",
        });
      }
      setIsFormOpen(false);
      setEditingVan(null);
    } catch (error) {
      console.error('Erro ao salvar van:', error);
    }
  };

  const handleEdit = (van: Van) => {
    setEditingVan(van);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingVan) return;

    try {
      await deleteVan(deletingVan.id);
      toast({
        title: "Sucesso",
        description: "Van removida com sucesso!",
      });
      setDeletingVan(null);
    } catch (error) {
      console.error('Erro ao deletar van:', error);
    }
  };

  if (vansLoading || (alunosLoading && !alunos)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando vans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-xl md:text-2xl font-semibold text-foreground truncate">Gerenciar Vans</h2>
          <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">
            Cadastre e gerencie suas vans de transporte
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingVan(null);
            setIsFormOpen(true);
          }}
          className="bg-gradient-gold text-black-primary hover:opacity-90 whitespace-nowrap h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Nova Van</span>
          <span className="xs:inline sm:hidden">Nova</span>
        </Button>
      </div>

      {vans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Bus className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma van cadastrada</h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 px-4">
              Comece criando sua primeira van para organizar o transporte dos alunos.
            </p>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-gold text-black-primary hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira van
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {vans.map((van) => (
            <Card key={van.id} className="hover:bg-accent/50 transition-colors min-h-[180px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base flex-1 min-w-0">
                    <Bus className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0" />
                    <span className="truncate">{van.nome}</span>
                  </CardTitle>
                  <Badge variant={van.ativo ? "default" : "secondary"} className="text-xs flex-shrink-0">
                    {van.ativo ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm mt-2">
                  Capacidade máxima: {van.capacidade_maxima} alunos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    Alunos: {alunos?.filter(a => a.van_id === van.id).length || 0}
                  </span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(van)}
                    className="flex-1 h-9 text-xs sm:text-sm"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingVan(van)}
                    className="text-destructive hover:text-destructive h-9 px-3"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VanForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVan(null);
        }}
        onSubmit={handleVanSubmit}
        editingVan={editingVan}
      />

      <AlertDialog open={!!deletingVan} onOpenChange={() => setDeletingVan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a van "{deletingVan?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}