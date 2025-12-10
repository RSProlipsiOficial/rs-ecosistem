import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useVans } from '@/hooks/useVans';
import { useChecklistItems } from '@/hooks/useChecklistItems';
import { Badge } from '@/components/ui/badge';

interface ChecklistFormProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  initialData?: Record<string, any>;
  loading?: boolean;
}

export function ChecklistForm({ onSubmit, initialData, loading }: ChecklistFormProps) {
  const { vans } = useVans();
  const { items: checklistItems, loading: itemsLoading } = useChecklistItems();
  const [formData, setFormData] = useState<Record<string, any>>({
    van_id: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
    combustivel: null,
    quilometragem: 0,
    ...initialData,
  });

  // Atualizar formData quando os itens do checklist são carregados
  useEffect(() => {
    if (checklistItems.length > 0) {
      const initialChecklistData: Record<string, any> = {};
      checklistItems.forEach(item => {
        const fieldKey = item.nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        initialChecklistData[fieldKey] = item.tipo === 'boolean' ? false : 
                                        item.tipo === 'number' ? 0 : '';
      });
      
      setFormData(prev => ({
        ...prev,
        ...initialChecklistData,
        ...initialData,
      }));
    }
  }, [checklistItems, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.van_id) {
      return;
    }

    await onSubmit(formData);
    
    // Reset form after successful submission
    const resetData: Record<string, any> = {
      van_id: '',
      data: new Date().toISOString().split('T')[0],
      observacoes: '',
      combustivel: null,
      quilometragem: 0,
    };
    
    checklistItems.forEach(item => {
      const fieldKey = item.nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      resetData[fieldKey] = item.tipo === 'boolean' ? false : 
                           item.tipo === 'number' ? 0 : '';
    });
    
    setFormData(resetData);
  };

  const todosItensRevisados = checklistItems
    .filter(item => item.obrigatorio)
    .every(item => {
      const fieldKey = item.nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      return item.tipo === 'boolean' ? formData[fieldKey] === true : 
             item.tipo === 'number' ? (formData[fieldKey] || 0) > 0 :
             Boolean(formData[fieldKey]);
    });

  const isFormValid = formData.van_id && todosItensRevisados && (formData.quilometragem || 0) > 0;

  // Verificar se está fora do horário
  const agora = new Date();
  const horarioLimite = new Date();
  horarioLimite.setHours(7, 0, 0, 0);
  const foraHorario = agora > horarioLimite;

  if (itemsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Carregando configurações do checklist...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Checklist Diário do Motorista
        </CardTitle>
        <CardDescription>
          Preencha todos os itens obrigatórios para garantir a segurança do veículo
        </CardDescription>
        {foraHorario && (
          <Badge variant="outline" className="w-fit">
            <Clock className="h-3 w-3 mr-1" />
            Fora do horário recomendado (antes das 07:00)
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="van_id">Van</Label>
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
          </div>

          {/* Checklist items dinâmicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Itens do Checklist</h3>
            {checklistItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum item configurado para o checklist</p>
                <p className="text-sm">Configure os itens na aba "Configurações"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklistItems.map((item) => {
                  const fieldKey = item.nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                  
                  if (item.tipo === 'boolean') {
                    return (
                      <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={fieldKey}
                          checked={formData[fieldKey] || false}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, [fieldKey]: checked }))
                          }
                        />
                        <div className="flex-1">
                          <Label htmlFor={fieldKey} className="cursor-pointer">
                            {item.nome}
                            {item.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {item.descricao && (
                            <p className="text-sm text-muted-foreground">{item.descricao}</p>
                          )}
                        </div>
                        {formData[fieldKey] ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    );
                  }
                  
                  if (item.tipo === 'number') {
                    return (
                      <div key={item.id} className="p-3 border rounded-lg space-y-2">
                        <Label htmlFor={fieldKey}>
                          {item.nome}
                          {item.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {item.descricao && (
                          <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        )}
                        <Input
                          id={fieldKey}
                          type="number"
                          value={formData[fieldKey] || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            [fieldKey]: e.target.value ? Number(e.target.value) : 0 
                          }))}
                          required={item.obrigatorio}
                        />
                      </div>
                    );
                  }
                  
                  if (item.tipo === 'text') {
                    return (
                      <div key={item.id} className="p-3 border rounded-lg space-y-2">
                        <Label htmlFor={fieldKey}>
                          {item.nome}
                          {item.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {item.descricao && (
                          <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        )}
                        <Input
                          id={fieldKey}
                          type="text"
                          value={formData[fieldKey] || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            [fieldKey]: e.target.value 
                          }))}
                          required={item.obrigatorio}
                        />
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
            )}
          </div>

          {/* Campos especiais fixos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="combustivel">Combustível (%)</Label>
                <Input
                  id="combustivel"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.combustivel || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    combustivel: e.target.value ? Number(e.target.value) : null 
                  }))}
                  placeholder="Ex: 75"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quilometragem">Quilometragem *</Label>
                <Input
                  id="quilometragem"
                  type="number"
                  min="0"
                  value={formData.quilometragem || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quilometragem: Number(e.target.value) || 0
                  }))}
                  placeholder="Ex: 45000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Ex: Pneu dianteiro esquerdo um pouco murcho..."
              rows={3}
            />
          </div>

          {/* Status do formulário */}
          {!todosItensRevisados && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-orange-700">
                Marque todos os itens como revisados para confirmar o checklist
              </span>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Confirmar Checklist'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}