import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Video, Edit, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface VideoEducacao {
  id: string;
  titulo: string;
  descricao?: string | null;
  link_video: string;
  ativo: boolean;
  ordem: number | null;
  thumbnail_url?: string | null;
  created_at: string;
}

export default function AdminVideosIndex() {
  const [videos, setVideos] = useState<VideoEducacao[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoEducacao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoEducacao | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    link_video: "",
    ativo: true,
    ordem: 0
  });

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    const filtered = videos.filter(video =>
      video.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.descricao && video.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos_educacao')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os vídeos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('videos_educacao')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            link_video: formData.link_video,
            ativo: formData.ativo,
            ordem: formData.ordem
          })
          .eq('id', editingVideo.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Vídeo atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('videos_educacao')
          .insert([{
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            link_video: formData.link_video,
            ativo: formData.ativo,
            ordem: formData.ordem
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Vídeo criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingVideo(null);
      setFormData({
        titulo: "",
        descricao: "",
        link_video: "",
        ativo: true,
        ordem: 0
      });
      loadVideos();
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o vídeo.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (video: VideoEducacao) => {
    setEditingVideo(video);
    setFormData({
      titulo: video.titulo,
      descricao: video.descricao || "",
      link_video: video.link_video,
      ativo: video.ativo,
      ordem: video.ordem || 0
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      const { error } = await supabase
        .from('videos_educacao')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Vídeo excluído com sucesso!",
      });
      
      loadVideos();
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o vídeo.",
        variant: "destructive",
      });
    }
  };

  const getVideoThumbnail = (url: string) => {
    // Extract YouTube video ID if it's a YouTube URL
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vídeos Educacionais</h1>
            <p className="text-muted-foreground">
              Gerencie os vídeos de educação financeira exibidos nos apps - Padrão Profissional
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingVideo(null);
              setFormData({
                titulo: "",
                descricao: "",
                link_video: "",
                ativo: true,
                ordem: 0
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Vídeo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? 'Editar Vídeo' : 'Novo Vídeo Educacional'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título do Vídeo</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Fundamentos da Educação Financeira"
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
                </div>
                
                <div>
                  <Label htmlFor="link_video">URL do Vídeo (YouTube/Vimeo)</Label>
                  <Input
                    id="link_video"
                    type="url"
                    value={formData.link_video}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_video: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ Verifique se o link não está duplicado na lista atual
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição Detalhada</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição completa do conteúdo do vídeo..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Vídeo ativo nos apps</Label>
                </div>
                
                <Button type="submit" className="w-full">
                  {editingVideo ? 'Atualizar Vídeo' : 'Criar Vídeo'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca Avançada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Busca e Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descrição ou URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Organizadas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.length}</div>
              <p className="text-xs text-muted-foreground">
                Base organizada por ordem
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vídeos Ativos</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {videos.filter(video => video.ativo).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Exibidos nos apps
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vídeos Inativos</CardTitle>
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {videos.filter(video => !video.ativo).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Arquivados/Rascunhos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Vídeos Profissional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Base de Dados de Vídeos Educacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando vídeos...</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum vídeo encontrado com o termo pesquisado." : "Nenhum vídeo cadastrado ainda."}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Comece adicionando vídeos educacionais para construir sua base organizada
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map((video) => (
                  <div key={video.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        {getVideoThumbnail(video.link_video) ? (
                          <img 
                            src={getVideoThumbnail(video.link_video)!} 
                            alt={video.titulo}
                            className="w-32 h-24 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center border">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{video.titulo}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                video.ativo 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {video.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                              {video.ordem && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  Ordem: {video.ordem}
                                </span>
                              )}
                            </div>
                            
                            {video.descricao && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {video.descricao}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>📅 {new Date(video.created_at).toLocaleDateString('pt-BR')}</span>
                              <span>🔗 {new URL(video.link_video).hostname}</span>
                            </div>
                          </div>
                          
                          {/* Ações */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(video.link_video, '_blank')}
                              title="Assistir vídeo"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(video)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(video.id)}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Painel de Verificação de Duplicatas */}
        {videos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                Verificação de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">📊 Estatísticas da Base</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Total de vídeos cadastrados: {videos.length}</li>
                    <li>• Vídeos sem ordem definida: {videos.filter(v => !v.ordem || v.ordem === 0).length}</li>
                    <li>• Vídeos sem descrição: {videos.filter(v => !v.descricao).length}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">✅ Recomendações</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Defina ordem para organização</li>
                    <li>• Adicione descrições detalhadas</li>
                    <li>• Mantenha títulos claros e únicos</li>
                    <li>• Verifique links funcionais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}