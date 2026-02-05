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
    verificou_oleo: false,
    verificou_agua: false,
    verificou_pneus: false,
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
      verificou_oleo: false,
      verificou_agua: false,
      verificou_pneus: false,
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

  const isFormValid = formData.van_id &&
    todosItensRevisados &&
    (formData.quilometragem || 0) > 0 &&
    formData.verificou_oleo &&
    formData.verificou_agua &&
    formData.verificou_pneus;

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
    <Card className="border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="px-0 md:px-6">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-black text-white italic uppercase">
          <CheckCircle className="h-6 w-6 text-gold" />
          Checklist Diário
        </CardTitle>
        <CardDescription className="text-sm">
          Preencha todos os itens obrigatórios para garantir a segurança.
        </CardDescription>
        {foraHorario && (
          <Badge variant="outline" className="w-fit bg-gold/10 text-gold border-gold/20">
            <Clock className="h-3 w-3 mr-1" />
            Fora do horário (antes das 07:00)
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-0 md:px-6">
        <form onSubmit={handleSubmit} className="space-y-mobile-gap md:space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-mobile-gap md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="data" className="text-xs font-bold uppercase text-zinc-500">Data</Label>
              <Input
                id="data"
                type="date"
                className="h-11 md:h-12 bg-black-secondary border-sidebar-border"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="van_id" className="text-xs font-bold uppercase text-zinc-500">Veículo (Van)</Label>
              <Select
                value={formData.van_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, van_id: value }))}
                required
              >
                <SelectTrigger className="h-11 md:h-12 bg-black-secondary border-sidebar-border">
                  <SelectValue placeholder="Selecione uma van" />
                </SelectTrigger>
                <SelectContent className="bg-black-secondary border-sidebar-border text-white">
                  {(vans || []).map((van) => (
                    van && van.id && (
                      <SelectItem key={van.id} value={van.id}>
                        {van.nome || 'Van sem nome'}
                      </SelectItem>
                    )
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

          {/* Verificações de Segurança Fixas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gold" />
              Verificações Técnicas Obrigatórias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-black-secondary border-sidebar-border border rounded-lg hover:border-gold/50 transition-colors">
                <Checkbox
                  id="verificou_oleo"
                  checked={formData.verificou_oleo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verificou_oleo: checked }))}
                />
                <Label htmlFor="verificou_oleo" className="text-sm font-bold uppercase cursor-pointer">Nível de Óleo OK</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-black-secondary border-sidebar-border border rounded-lg hover:border-gold/50 transition-colors">
                <Checkbox
                  id="verificou_agua"
                  checked={formData.verificou_agua}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verificou_agua: checked }))}
                />
                <Label htmlFor="verificou_agua" className="text-sm font-bold uppercase cursor-pointer">Nível de Água OK</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-black-secondary border-sidebar-border border rounded-lg hover:border-gold/50 transition-colors">
                <Checkbox
                  id="verificou_pneus"
                  checked={formData.verificou_pneus}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verificou_pneus: checked }))}
                />
                <Label htmlFor="verificou_pneus" className="text-sm font-bold uppercase cursor-pointer">Estado Pneus OK</Label>
              </div>
            </div>
            {!formData.verificou_oleo || !formData.verificou_agua || !formData.verificou_pneus ? (
              <p className="text-xs text-gold/80 font-medium italic">* Certifique-se de conferir os níveis do motor antes de sair.</p>
            ) : null}
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
              className="flex-1 h-12 md:h-14 bg-gold text-black font-black uppercase tracking-widest hover:bg-gold/90 transition-all"
            >
              {loading ? 'Salvando...' : 'Confirmar Vistoria'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}