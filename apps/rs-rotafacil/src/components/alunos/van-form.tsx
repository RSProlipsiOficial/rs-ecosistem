import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bus, X } from "lucide-react";
import { Van } from "@/types/alunos";

interface VanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; capacidade_maxima: number }) => Promise<void>;
  editingVan?: Van | null;
}

export function VanForm({ open, onClose, onSubmit, editingVan }: VanFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    capacidade_maxima: 20,
  });
  
  // Update form data when editingVan changes
  useEffect(() => {
    if (editingVan) {
      setFormData({
        nome: editingVan.nome,
        capacidade_maxima: editingVan.capacidade_maxima,
      });
    } else {
      setFormData({ nome: "", capacidade_maxima: 20 });
    }
  }, [editingVan]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      setFormData({ nome: "", capacidade_maxima: 20 });
    } catch (error) {
      console.error('Erro ao criar van:', error);
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
              <Bus className="w-5 h-5 text-black-primary" />
            </div>
            {editingVan ? "Editar Van" : "Adicionar Nova Van"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Van *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Van Tio Beto"
              required
            />
          </div>

          <div>
            <Label htmlFor="capacidade_maxima">Capacidade Máxima *</Label>
            <Input
              id="capacidade_maxima"
              type="number"
              min="1"
              value={formData.capacidade_maxima}
              onChange={(e) => setFormData(prev => ({ ...prev, capacidade_maxima: parseInt(e.target.value) || 20 }))}
              required
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
              <Bus className="w-4 h-4 mr-2" />
              {loading ? (editingVan ? "Atualizando..." : "Criando...") : (editingVan ? "Atualizar Van" : "Criar Van")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}