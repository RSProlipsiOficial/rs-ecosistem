import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, BookOpen, Edit, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface Tutorial {
  id: string;
  titulo: string;
  descricao?: string | null;
  link_tutorial: string;
  ativo: boolean;
  ordem: number | null;
  categoria: string;
  created_at: string;
}

export default function AdminTutoriaisIndex() {
  const [tutoriais, setTutoriais] = useState<Tutorial[]>([]);
  const [filteredTutoriais, setFilteredTutoriais] = useState<Tutorial[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    link_tutorial: "",
    ativo: true,
    ordem: 0,
    categoria: "Alunos e Vans"
  });

  useEffect(() => {
    loadTutoriais();
  }, []);

  useEffect(() => {
    const filtered = tutoriais.filter(tutorial =>
      tutorial.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tutorial.descricao && tutorial.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTutoriais(filtered);
  }, [searchTerm, tutoriais]);

  const loadTutoriais = async () => {
    try {
      const { data, error } = await supabase
        .from('tutoriais')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setTutoriais(data || []);
    } catch (error) {
      console.error('Erro ao carregar tutoriais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tutoriais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTutorial) {
        const { error } = await supabase
          .from('tutoriais')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            link_tutorial: formData.link_tutorial,
            ativo: formData.ativo,
            ordem: formData.ordem,
            categoria: formData.categoria
          })
          .eq('id', editingTutorial.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tutorial atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('tutoriais')
          .insert([{
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            link_tutorial: formData.link_tutorial,
            ativo: formData.ativo,
            ordem: formData.ordem,
            categoria: formData.categoria
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tutorial criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingTutorial(null);
      setFormData({
        titulo: "",
        descricao: "",
        link_tutorial: "",
        ativo: true,
        ordem: 0,
        categoria: "Alunos e Vans"
      });
      loadTutoriais();
    } catch (error) {
      console.error('Erro ao salvar tutorial:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o tutorial.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      titulo: tutorial.titulo,
      descricao: tutorial.descricao || "",
      link_tutorial: tutorial.link_tutorial,
      ativo: tutorial.ativo,
      ordem: tutorial.ordem || 0,
      categoria: tutorial.categoria || "Alunos e Vans"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tutorial?')) return;

    try {
      const { error } = await supabase
        .from('tutoriais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tutorial excluído com sucesso!",
      });

      loadTutoriais();
    } catch (error) {
      console.error('Erro ao excluir tutorial:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o tutorial.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tutoriais</h1>
            <p className="text-muted-foreground">
              Gerencie os tutoriais e vídeos de suporte exibidos nos apps - Padrão Profissional
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTutorial(null);
              setFormData({
                titulo: "",
                descricao: "",
                link_tutorial: "",
                ativo: true,
                ordem: 0
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTutorial ? 'Editar Tutorial' : 'Novo Tutorial'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título do Tutorial</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Como configurar sistema de pagamentos"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ordem">Ordem de Exibição</Label>
                    <Input
                      id="ordem"
                      type="number"
                      value={formData.ordem}
                      onChange={(e) => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
                      placeholder="1, 2, 3..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <select
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value="Alunos e Vans">Alunos e Vans</option>
                      <option value="RS-IA">RS-IA</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Mensalidades">Mensalidades</option>
                      <option value="Motorista">Motorista</option>
                      <option value="Monitora">Monitora</option>
                      <option value="Educação Financeira">Educação Financeira</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="link_tutorial">URL do Vídeo (YouTube/Vimeo)</Label>
                  <Input
                    id="link_tutorial"
                    type="url"
                    value={formData.link_tutorial}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_tutorial: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do tutorial..."
                  />
                </div>

                <div>
                  <Label htmlFor="ordem">Ordem de Exibição</Label>
                  <Input
                    id="ordem"
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Tutorial ativo</Label>
                </div>

                <Button type="submit" className="w-full">
                  {editingTutorial ? 'Atualizar Tutorial' : 'Criar Tutorial'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca */}
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tutoriais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tutoriais</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutoriais.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutoriais Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tutoriais.filter(tutorial => tutorial.ativo).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutoriais Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {tutoriais.filter(tutorial => !tutorial.ativo).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Tutoriais */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Carregando tutoriais...</p>
              </CardContent>
            </Card>
          ) : filteredTutoriais.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  {searchTerm ? "Nenhum tutorial encontrado." : "Nenhum tutorial cadastrado ainda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTutoriais.map((tutorial) => (
              <Card key={tutorial.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-medium">{tutorial.titulo}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${tutorial.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {tutorial.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {tutorial.categoria || 'Sem Categoria'}
                        </span>
                      </div>

                      {tutorial.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {tutorial.descricao}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Ordem: {tutorial.ordem || 0}</span>
                        <span>Criado em: {new Date(tutorial.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(tutorial.link_tutorial, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tutorial)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tutorial.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}