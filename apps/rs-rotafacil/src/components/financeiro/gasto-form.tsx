import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, Edit } from "lucide-react";
import { GastoFormData, Gasto } from "@/types/financeiro";

interface GastoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GastoFormData) => Promise<void>;
  initialData?: Gasto;
  isEditing?: boolean;
}

export function GastoForm({ open, onClose, onSubmit, initialData, isEditing = false }: GastoFormProps) {
  const [formData, setFormData] = useState<GastoFormData>({
    descricao: "",
    valor: 0,
    tipo: "variavel",
    status: "nao_pago",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        descricao: initialData.descricao,
        valor: initialData.valor,
        tipo: initialData.tipo,
        status: initialData.status,
        observacoes: initialData.observacoes || "",
        data_vencimento: initialData.data_vencimento || "",
        data_pagamento: initialData.data_pagamento || "",
      });
    } else {
      setFormData({
        descricao: "",
        valor: 0,
        tipo: "variavel",
        status: "nao_pago",
        observacoes: "",
      });
    }
  }, [initialData, isEditing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        descricao: "",
        valor: 0,
        tipo: "variavel",
        status: "nao_pago",
        observacoes: "",
      });
    } catch (error) {
      console.error('Erro ao criar gasto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              {isEditing ? <Edit className="w-5 h-5 text-black-primary" /> : <Plus className="w-5 h-5 text-black-primary" />}
            </div>
            {isEditing ? "Editar Gasto" : "Adicionar Novo Gasto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Combustível, Manutenção, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixo">Fixo</SelectItem>
                <SelectItem value="variavel">Variável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao_pago">Não Pago</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="em_aberto">Em Aberto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_vencimento">Data de Vencimento</Label>
            <Input
              id="data_vencimento"
              type="date"
              value={formData.data_vencimento || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
            />
          </div>

          {formData.status === 'pago' && (
            <div>
              <Label htmlFor="data_pagamento">Data de Pagamento</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={formData.data_pagamento || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_pagamento: e.target.value }))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-gold text-black-primary hover:opacity-90"
              disabled={loading}
            >
              {isEditing ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {loading 
                ? (isEditing ? "Salvando..." : "Adicionando...")
                : (isEditing ? "Salvar Alterações" : "Adicionar Gasto")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}