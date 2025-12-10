import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Plus, Edit, Trash2, Search, MapPin, MessageCircle } from "lucide-react";
import { AlunoForm } from "./aluno-form";
import { useAlunos } from "@/hooks/useAlunos";
import { useVans } from "@/hooks/useVans";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Aluno } from "@/types/alunos";

export function AlunoManager() {
  const { alunos, loading: alunosLoading, createAluno, updateAluno, deleteAluno } = useAlunos();
  const { vans, loading: vansLoading } = useVans();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredAlunos = alunos.filter(aluno => 
    aluno.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.nome_responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.nome_colegio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAlunoSubmit = async (data: any) => {
    try {
      if (editingAluno) {
        await updateAluno(editingAluno.id, data);
        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso!",
        });
      } else {
        await createAluno(data);
        toast({
          title: "Sucesso", 
          description: "Aluno adicionado com sucesso!",
        });
      }
      setIsFormOpen(false);
      setEditingAluno(null);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAluno) return;

    try {
      await deleteAluno(deletingAluno.id);
      toast({
        title: "Sucesso",
        description: "Aluno removido com sucesso!",
      });
      setDeletingAluno(null);
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
    }
  };

  const openWhatsApp = (phone: string, studentName: string) => {
    const message = `Olá! Sou do transporte escolar. Gostaria de falar sobre o(a) ${studentName}.`;
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const openMaps = (aluno: Aluno) => {
    const address = `${aluno.endereco_rua}, ${aluno.endereco_numero}, ${aluno.endereco_bairro}, ${aluno.endereco_cidade}, ${aluno.endereco_estado}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, "_blank");
  };

  const getVanName = (vanId: string) => {
    const van = vans.find(v => v.id === vanId);
    return van ? van.nome : "Van não encontrada";
  };

  if (alunosLoading || vansLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando alunos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gerenciar Alunos</h2>
          <p className="text-muted-foreground">
            Cadastre e gerencie os alunos do transporte escolar
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => {
              setEditingAluno(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-gold text-black-primary hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Aluno
          </Button>
        </div>
      </div>

      {filteredAlunos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? "Tente ajustar os termos da sua busca."
                : "Comece adicionando seu primeiro aluno ao sistema."
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-gold text-black-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro aluno
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlunos.map((aluno) => (
            <Card key={aluno.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="w-4 h-4 text-gold" />
                      {aluno.nome_completo}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {aluno.nome_responsavel}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {aluno.turno}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div><strong>Colégio:</strong> {aluno.nome_colegio}</div>
                  <div><strong>Série:</strong> {aluno.serie}</div>
                  <div><strong>Van:</strong> {getVanName(aluno.van_id)}</div>
                  <div><strong>Mensalidade:</strong> R$ {aluno.valor_mensalidade.toFixed(2)}</div>
                  {aluno.valor_letalidade && aluno.valor_letalidade > 0 && (
                    <div><strong>Taxa Extra:</strong> R$ {aluno.valor_letalidade.toFixed(2)}</div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWhatsApp(aluno.whatsapp_responsavel, aluno.nome_completo)}
                    className="flex-1"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMaps(aluno)}
                    className="flex-1"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Mapa
                  </Button>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(aluno)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingAluno(aluno)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlunoForm 
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAluno(null);
        }}
        onSubmit={handleAlunoSubmit}
        vans={vans}
        editingAluno={editingAluno}
      />

      <AlertDialog open={!!deletingAluno} onOpenChange={() => setDeletingAluno(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o aluno "{deletingAluno?.nome_completo}"? Esta ação não pode ser desfeita.
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