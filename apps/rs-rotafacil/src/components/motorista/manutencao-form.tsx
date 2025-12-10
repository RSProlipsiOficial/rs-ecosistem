import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Wrench } from 'lucide-react';
import { useVans } from '@/hooks/useVans';
import { TIPOS_PROBLEMA, PRIORIDADES } from '@/types/manutencao';

interface ManutencaoFormProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  loading?: boolean;
}

export function ManutencaoForm({ onSubmit, loading }: ManutencaoFormProps) {
  const { vans } = useVans();
  const [formData, setFormData] = useState({
    van_id: '',
    tipo_problema: '',
    descricao_problema: '',
    prioridade: 'media',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.van_id || !formData.tipo_problema || !formData.descricao_problema) {
      return;
    }

    await onSubmit(formData);
    
    // Reset form after successful submission
    setFormData({
      van_id: '',
      tipo_problema: '',
      descricao_problema: '',
      prioridade: 'media',
    });
  };

  const isFormValid = formData.van_id && formData.tipo_problema && formData.descricao_problema.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Reportar Problema na Van
        </CardTitle>
        <CardDescription>
          Descreva detalhadamente o problema encontrado para que o responsável possa providenciar o reparo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Van e Tipo do Problema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="van_id">Van *</Label>
              <Select
                value={formData.van_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, van_id: value }))}
                required
              >
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
            
            <div className="space-y-2">
              <Label htmlFor="tipo_problema">Tipo do Problema *</Label>
              <Select
                value={formData.tipo_problema}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_problema: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PROBLEMA.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select
              value={formData.prioridade}
              onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORIDADES.map((prioridade) => (
                  <SelectItem key={prioridade.value} value={prioridade.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${prioridade.color}`}></div>
                      {prioridade.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição do Problema */}
          <div className="space-y-2">
            <Label htmlFor="descricao_problema">Descrição do Problema *</Label>
            <Textarea
              id="descricao_problema"
              value={formData.descricao_problema}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao_problema: e.target.value }))}
              placeholder="Descreva detalhadamente o problema encontrado (ex: freio fazendo ruído estranho, pneu furado, motor falhando, etc.)"
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground">
              Seja específico: quando o problema ocorre, qual o sintoma, se afeta a segurança, etc.
            </p>
          </div>

          {/* Aviso de Prioridade Urgente */}
          {formData.prioridade === 'urgente' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">
                <strong>Prioridade Urgente:</strong> Problemas que comprometem a segurança ou impedem o uso da van
              </span>
            </div>
          )}

          {/* Botão de Envio */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="flex-1"
            >
              {loading ? 'Reportando...' : 'Reportar Problema'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}