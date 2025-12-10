import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { GanhoExtraFormData } from "@/types/financeiro";

interface GanhoExtraFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GanhoExtraFormData) => Promise<void>;
}

export function GanhoExtraForm({ open, onClose, onSubmit }: GanhoExtraFormProps) {
  const [formData, setFormData] = useState<GanhoExtraFormData>({
    descricao: "",
    valor: 0,
    tipo: "frete",
    data_ganho: new Date().toISOString().split('T')[0],
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        descricao: "",
        valor: 0,
        tipo: "frete",
        data_ganho: new Date().toISOString().split('T')[0],
        observacoes: "",
      });
    } catch (error) {
      console.error('Erro ao criar ganho extra:', error);
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
              <Plus className="w-5 h-5 text-black-primary" />
            </div>
            Adicionar Ganho Extra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Frete para excursão escolar"
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
                <SelectItem value="frete">Frete</SelectItem>
                <SelectItem value="excursao">Excursão</SelectItem>
                <SelectItem value="ajuda">Ajuda</SelectItem>
                <SelectItem value="presente">Presente</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_ganho">Data *</Label>
            <Input
              id="data_ganho"
              type="date"
              value={formData.data_ganho}
              onChange={(e) => setFormData(prev => ({ ...prev, data_ganho: e.target.value }))}
              required
            />
          </div>

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
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Adicionando..." : "Adicionar Ganho"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}