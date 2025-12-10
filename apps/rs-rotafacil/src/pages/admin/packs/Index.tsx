import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Edit3, Trash2, Save, X, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface Pack {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  funcionalidades: string[];
  ativo: boolean;
  tipo: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPacksIndex() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [newPack, setNewPack] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: 0,
    funcionalidades: "",
    ativo: true,
    tipo: "basico"
  });

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      // Load packs from database would go here
      setPacks([]);
    } catch (error) {
      console.error('Erro ao carregar packs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os packs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const funcionalidadesArray = formData.funcionalidades.split('\n').filter(f => f.trim());
      
      if (editingPack) {
        // Atualizar pack existente
        const updatedPack = {
          ...editingPack,
          nome: formData.nome,
          descricao: formData.descricao,
          preco: formData.preco,
          funcionalidades: funcionalidadesArray,
          ativo: formData.ativo,
          tipo: formData.tipo,
          updated_at: new Date().toISOString()
        };
        
        setPacks(prev => prev.map(p => p.id === editingPack.id ? updatedPack : p));
      } else {
        // Criar novo pack
        const newPackData: Pack = {
          id: Date.now().toString(),
          nome: formData.nome,
          descricao: formData.descricao,
          preco: formData.preco,
          funcionalidades: funcionalidadesArray,
          ativo: formData.ativo,
          tipo: formData.tipo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setPacks(prev => [...prev, newPackData]);
      }

      toast({
        title: "Sucesso",
        description: "Pack salvo com sucesso!",
      });

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar pack:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o pack.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pack: Pack) => {
    setEditingPack(pack);
    setFormData({
      nome: pack.nome,
      descricao: pack.descricao,
      preco: pack.preco,
      funcionalidades: pack.funcionalidades.join('\n'),
      ativo: pack.ativo,
      tipo: pack.tipo
    });
    setNewPack(true);
  };

  const handleDelete = async (packId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pack?')) return;
    
    try {
      setPacks(prev => prev.filter(p => p.id !== packId));
      toast({
        title: "Sucesso",
        description: "Pack excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir pack:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pack.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      preco: 0,
      funcionalidades: "",
      ativo: true,
      tipo: "basico"
    });
    setEditingPack(null);
    setNewPack(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Carregando packs...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Packs</h1>
            <p className="text-muted-foreground">
              Configure os packs e funcionalidades disponíveis
            </p>
          </div>
          
          <Button onClick={() => setNewPack(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pack
          </Button>
        </div>

        {/* Formulário de Criação/Edição */}
        {newPack && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                {editingPack ? "Editando Pack" : "Novo Pack"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium">Nome do Pack</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Pack Premium"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preco" className="text-sm font-medium">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco: Number(e.target.value) }))}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição detalhada do pack..."
                  rows={3}
                  className="w-full resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="funcionalidades" className="text-sm font-medium">Funcionalidades (uma por linha)</Label>
                <Textarea
                  id="funcionalidades"
                  value={formData.funcionalidades}
                  onChange={(e) => setFormData(prev => ({ ...prev, funcionalidades: e.target.value }))}
                  placeholder="Vans ilimitadas&#10;Gestão financeira&#10;Relatórios avançados&#10;Suporte prioritário"
                  rows={6}
                  className="w-full resize-none font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-sm font-medium">Tipo do Pack</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="gratis">Grátis</SelectItem>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="profissional">Profissional</SelectItem>
                      <SelectItem value="ilimitado">Ilimitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                      className="w-4 h-4 rounded border-border"
                    />
                    <Label htmlFor="ativo" className="text-sm">Pack ativo e disponível</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button variant="outline" onClick={resetForm} className="min-w-[100px]">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Packs */}
        <div className="grid gap-6">
          {packs.map((pack) => (
            <Card key={pack.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">
                        {pack.nome}
                        {pack.tipo === "premium" && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">MAIS POPULAR</span>}
                        {pack.tipo === "profissional" && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">RECOMENDADO</span>}
                        {pack.tipo === "gratis" && <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-1 rounded-full">GRÁTIS</span>}
                        <Badge variant={pack.ativo ? "default" : "secondary"} className="ml-2">
                          {pack.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">{pack.descricao}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {pack.preco === 0 ? "GRÁTIS" : `R$ ${pack.preco.toFixed(2).replace('.', ',')}`}
                    </span>
                    {pack.preco > 0 && <span className="text-sm text-muted-foreground">/mês</span>}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(pack)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(pack.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium mb-2">Funcionalidades:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pack.funcionalidades.map((func, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{func}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <span>Tipo: {pack.tipo}</span>
                  <span>Atualizado: {new Date(pack.updated_at).toLocaleString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pack configurado</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro pack para começar.
              </p>
              <Button onClick={() => setNewPack(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Pack
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}