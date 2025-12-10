import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { UserPlus, X } from "lucide-react";
import { AlunoFormData, Van, Aluno } from "@/types/alunos";

interface AlunoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AlunoFormData) => Promise<void>;
  vans: Van[];
  selectedVanId?: string;
  editingAluno?: Aluno | null;
}

export function AlunoForm({ open, onClose, onSubmit, vans, selectedVanId, editingAluno }: AlunoFormProps) {
  const [formData, setFormData] = useState<AlunoFormData>({
    nome_completo: editingAluno?.nome_completo || "",
    nome_responsavel: editingAluno?.nome_responsavel || "",
    turno: editingAluno?.turno || "manha",
    serie: editingAluno?.serie || "",
    nome_colegio: editingAluno?.nome_colegio || "",
    endereco_rua: editingAluno?.endereco_rua || "",
    endereco_numero: editingAluno?.endereco_numero || "",
    endereco_bairro: editingAluno?.endereco_bairro || "",
    endereco_cidade: editingAluno?.endereco_cidade || "",
    endereco_estado: editingAluno?.endereco_estado || "",
    endereco_cep: editingAluno?.endereco_cep || "",
    tipo_residencia: editingAluno?.tipo_residencia || "casa",
    whatsapp_responsavel: editingAluno?.whatsapp_responsavel || "",
    valor_mensalidade: editingAluno?.valor_mensalidade || 0,
    valor_letalidade: editingAluno?.valor_letalidade || 0,
    van_id: editingAluno?.van_id || selectedVanId || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        nome_completo: "",
        nome_responsavel: "",
        turno: "manha",
        serie: "",
        nome_colegio: "",
        endereco_rua: "",
        endereco_numero: "",
        endereco_bairro: "",
        endereco_cidade: "",
        endereco_estado: "",
        endereco_cep: "",
        tipo_residencia: "casa",
        whatsapp_responsavel: "",
        valor_mensalidade: 0,
        valor_letalidade: 0,
        van_id: selectedVanId || "",
      });
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AlunoFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-black-primary" />
            </div>
            {editingAluno ? "Editar Aluno" : "Adicionar Novo Aluno"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                <Input
                  id="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="turno">Turno *</Label>
                <Select value={formData.turno} onValueChange={(value) => handleInputChange("turno", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="integral">Integral</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="serie">Série *</Label>
                <Input
                  id="serie"
                  value={formData.serie}
                  onChange={(e) => handleInputChange("serie", e.target.value)}
                  placeholder="Ex: 1º Ano, 5ª Série, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome_colegio">Nome do Colégio *</Label>
                <Input
                  id="nome_colegio"
                  value={formData.nome_colegio}
                  onChange={(e) => handleInputChange("nome_colegio", e.target.value)}
                  placeholder="Ex: Colégio São Lucas, Escola ABC"
                  required
                />
              </div>
              <div>
                <Label htmlFor="van_id">Van *</Label>
                <Select value={formData.van_id} onValueChange={(value) => handleInputChange("van_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma van" />
                  </SelectTrigger>
                  <SelectContent>
                    {vans.map((van) => (
                      <SelectItem key={van.id} value={van.id}>
                        {van.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Endereço</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="endereco_rua">Rua *</Label>
                <Input
                  id="endereco_rua"
                  value={formData.endereco_rua}
                  onChange={(e) => handleInputChange("endereco_rua", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endereco_numero">Número *</Label>
                <Input
                  id="endereco_numero"
                  value={formData.endereco_numero}
                  onChange={(e) => handleInputChange("endereco_numero", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endereco_bairro">Bairro *</Label>
                <Input
                  id="endereco_bairro"
                  value={formData.endereco_bairro}
                  onChange={(e) => handleInputChange("endereco_bairro", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endereco_cidade">Cidade *</Label>
                <Input
                  id="endereco_cidade"
                  value={formData.endereco_cidade}
                  onChange={(e) => handleInputChange("endereco_cidade", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endereco_estado">Estado *</Label>
                <Input
                  id="endereco_estado"
                  value={formData.endereco_estado}
                  onChange={(e) => handleInputChange("endereco_estado", e.target.value)}
                  placeholder="Ex: SP, RJ, MG"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endereco_cep">CEP *</Label>
                <Input
                  id="endereco_cep"
                  value={formData.endereco_cep}
                  onChange={(e) => handleInputChange("endereco_cep", e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo_residencia">Tipo de Residência</Label>
                <Select value={formData.tipo_residencia} onValueChange={(value) => handleInputChange("tipo_residencia", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Contato e Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato e Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp_responsavel">WhatsApp do Responsável *</Label>
                <Input
                  id="whatsapp_responsavel"
                  value={formData.whatsapp_responsavel}
                  onChange={(e) => handleInputChange("whatsapp_responsavel", e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <Label htmlFor="valor_mensalidade">Valor da Mensalidade *</Label>
                <Input
                  id="valor_mensalidade"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_mensalidade}
                  onChange={(e) => handleInputChange("valor_mensalidade", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="valor_letalidade">Taxa Extra (opcional)</Label>
                <Input
                  id="valor_letalidade"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_letalidade}
                  onChange={(e) => handleInputChange("valor_letalidade", parseFloat(e.target.value) || 0)}
                  placeholder="Ex: Taxa de combustível, material escolar, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
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
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : editingAluno ? "Atualizar" : "Adicionar"} Aluno
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}