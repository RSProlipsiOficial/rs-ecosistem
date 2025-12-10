import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit, Settings, GripVertical, Eye } from 'lucide-react';
import { useChecklistItems, ChecklistItemFormData, ChecklistItemPersonalizado } from '@/hooks/useChecklistItems';
import { Checkbox } from '@/components/ui/checkbox';

export function ChecklistItemsConfig() {
  const {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  } = useChecklistItems();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItemPersonalizado | null>(null);
  const [formData, setFormData] = useState<ChecklistItemFormData>({
    nome: '',
    descricao: '',
    obrigatorio: true,
    tipo: 'boolean',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        setEditingItem(null);
      } else {
        await createItem(formData);
        setIsAddModalOpen(false);
      }
      
      // Reset form
      setFormData({
        nome: '',
        descricao: '',
        obrigatorio: true,
        tipo: 'boolean',
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (item: ChecklistItemPersonalizado) => {
    setFormData({
      nome: item.nome,
      descricao: item.descricao || '',
      obrigatorio: item.obrigatorio,
      tipo: item.tipo,
    });
    setEditingItem(item);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este item do checklist?')) {
      await deleteItem(id);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'boolean': return 'Sim/Não';
      case 'number': return 'Número';
      case 'text': return 'Texto';
      default: return tipo;
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'boolean': return 'default';
      case 'number': return 'secondary';
      case 'text': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurar Itens do Checklist
        </CardTitle>
        <CardDescription>
          Personalize os itens do checklist adicionando ou removendo conforme suas necessidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botão Adicionar */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item configurado' : 'itens configurados'}
          </p>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Item</DialogTitle>
                <DialogDescription>
                  Configure um novo item para o checklist diário
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Item *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Extintor de incêndio"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Ex: Verificar se está dentro da validade"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Verificação</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value: 'boolean' | 'number' | 'text') => 
                      setFormData(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Sim/Não (Checkbox)</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="obrigatorio">Item Obrigatório</Label>
                    <p className="text-xs text-muted-foreground">
                      Se obrigatório, deve ser preenchido para confirmar o checklist
                    </p>
                  </div>
                  <Switch
                    id="obrigatorio"
                    checked={formData.obrigatorio}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, obrigatorio: checked }))
                    }
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    Adicionar Item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        {/* Lista de Itens */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando itens...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">Nenhum item configurado</p>
            <p className="text-sm text-muted-foreground">
              Adicione itens personalizados para o checklist
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Obrigatório</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    </TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>
                      <Badge variant={getTipoBadgeVariant(item.tipo) as any}>
                        {getTipoLabel(item.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.obrigatorio ? (
                        <Badge variant="destructive">Obrigatório</Badge>
                      ) : (
                        <Badge variant="outline">Opcional</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {item.descricao || 'Sem descrição'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Modal de Edição */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
              <DialogDescription>
                Modificar as configurações do item do checklist
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome do Item *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Extintor de incêndio"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição</Label>
                <Textarea
                  id="edit-descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Ex: Verificar se está dentro da validade"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo de Verificação</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value: 'boolean' | 'number' | 'text') => 
                    setFormData(prev => ({ ...prev, tipo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">Sim/Não (Checkbox)</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-obrigatorio">Item Obrigatório</Label>
                  <p className="text-xs text-muted-foreground">
                    Se obrigatório, deve ser preenchido para confirmar o checklist
                  </p>
                </div>
                <Switch
                  id="edit-obrigatorio"
                  checked={formData.obrigatorio}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, obrigatorio: checked }))
                  }
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}