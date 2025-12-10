import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  CreditCard,
  Clock,
  Star,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";

interface CreditPack {
  id: string;
  nome: string;
  descricao: string;
  creditos: number;
  preco: number;
  validade_dias: number;
  popular: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminCreditosIAIndex() {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
  const [newPack, setNewPack] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    creditos: 100,
    preco: 9.90,
    validade_dias: 30,
    popular: false,
    ativo: true
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
        description: "Não foi possível carregar os packs de créditos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingPack) {
        // Atualizar pack existente
        const updatedPack = {
          ...editingPack,
          nome: formData.nome,
          descricao: formData.descricao,
          creditos: formData.creditos,
          preco: formData.preco,
          validade_dias: formData.validade_dias,
          popular: formData.popular,
          ativo: formData.ativo,
          updated_at: new Date().toISOString()
        };
        
        setPacks(prev => prev.map(p => p.id === editingPack.id ? updatedPack : p));
      } else {
        // Criar novo pack
        const newPackData: CreditPack = {
          id: Date.now().toString(),
          nome: formData.nome,
          descricao: formData.descricao,
          creditos: formData.creditos,
          preco: formData.preco,
          validade_dias: formData.validade_dias,
          popular: formData.popular,
          ativo: formData.ativo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setPacks(prev => [...prev, newPackData]);
      }

      toast({
        title: "Sucesso",
        description: "Pack de créditos salvo com sucesso!",
      });

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar pack:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o pack de créditos.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pack: CreditPack) => {
    setEditingPack(pack);
    setFormData({
      nome: pack.nome,
      descricao: pack.descricao,
      creditos: pack.creditos,
      preco: pack.preco,
      validade_dias: pack.validade_dias,
      popular: pack.popular,
      ativo: pack.ativo
    });
    setNewPack(true);
  };

  const handleDelete = async (packId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pack de créditos?')) return;
    
    try {
      setPacks(prev => prev.filter(p => p.id !== packId));
      toast({
        title: "Sucesso",
        description: "Pack de créditos excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir pack:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pack de créditos.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      creditos: 100,
      preco: 9.90,
      validade_dias: 30,
      popular: false,
      ativo: true
    });
    setEditingPack(null);
    setNewPack(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Carregando packs de créditos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              Créditos RS-IA
            </h1>
            <p className="text-muted-foreground">
              Configure os packs de créditos para recompra via Mercado Pago
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
                {editingPack ? "Editando Pack de Créditos" : "Novo Pack de Créditos"}
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
                    placeholder="9.90"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="creditos" className="text-sm font-medium">Quantidade de Créditos</Label>
                  <Input
                    id="creditos"
                    type="number"
                    value={formData.creditos}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditos: Number(e.target.value) }))}
                    placeholder="100"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validade" className="text-sm font-medium">Validade (dias)</Label>
                  <Input
                    id="validade"
                    type="number"
                    value={formData.validade_dias}
                    onChange={(e) => setFormData(prev => ({ ...prev, validade_dias: Number(e.target.value) }))}
                    placeholder="30"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Configurações</Label>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="popular"
                        checked={formData.popular}
                        onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                        className="w-4 h-4 rounded border-border"
                      />
                      <Label htmlFor="popular" className="text-sm">Pack popular</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ativo"
                        checked={formData.ativo}
                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                        className="w-4 h-4 rounded border-border"
                      />
                      <Label htmlFor="ativo" className="text-sm">Pack ativo</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Pack"}
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
            <Card key={pack.id} className={pack.popular ? "border-primary bg-primary/5" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      pack.popular ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                      {pack.popular ? <Star className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {pack.nome}
                        {pack.popular && (
                          <Badge className="bg-primary text-primary-foreground">
                            MAIS POPULAR
                          </Badge>
                        )}
                        <Badge variant={pack.ativo ? "default" : "secondary"}>
                          {pack.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">{pack.descricao}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        R$ {pack.preco.toFixed(2).replace('.', ',')}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {pack.creditos} créditos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(pack)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(pack.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Brain className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-medium">{pack.creditos} Créditos</p>
                    <p className="text-xs text-muted-foreground">IA Tokens</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <p className="text-sm font-medium">{pack.validade_dias} dias</p>
                    <p className="text-xs text-muted-foreground">Validade</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <p className="text-sm font-medium">Mercado Pago</p>
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <span>Valor por crédito: R$ {(pack.preco / pack.creditos).toFixed(4).replace('.', ',')}</span>
                  <span>Atualizado: {new Date(pack.updated_at).toLocaleString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pack configurado</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro pack de créditos RS-IA.
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