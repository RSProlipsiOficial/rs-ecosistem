import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, Plus, Edit, Trash2, Users } from "lucide-react";
import { VanForm } from "./van-form";
import { useVans } from "@/hooks/useVans";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Van } from "@/types/alunos";

export function VanManager() {
  const { vans, loading, createVan, updateVan, deleteVan } = useVans();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando vans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gerenciar Vans</h2>
          <p className="text-muted-foreground">
            Cadastre e gerencie suas vans de transporte
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingVan(null);
            setIsFormOpen(true);
          }}
          className="bg-gradient-gold text-black-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Van
        </Button>
      </div>

      {vans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bus className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma van cadastrada</h3>
            <p className="text-muted-foreground text-center mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vans.map((van) => (
            <Card key={van.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-gold" />
                    {van.nome}
                  </CardTitle>
                  <Badge variant={van.ativo ? "default" : "secondary"}>
                    {van.ativo ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <CardDescription>
                  Capacidade máxima: {van.capacidade_maxima} alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Alunos cadastrados: 0
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(van)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingVan(van)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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