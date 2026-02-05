import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { UserPlus, X, Loader2 } from "lucide-react";
import { AlunoFormData, Van, Aluno } from "@/types/alunos";
import { formatToPascalCase } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
    nome_completo: editingAluno?.nome_completo ?? "",
    nome_responsavel: editingAluno?.nome_responsavel ?? "",
    cpf: editingAluno?.cpf ?? "",
    email: editingAluno?.email ?? "",
    turno: editingAluno?.turno ?? "manha",
    serie: editingAluno?.serie ?? "",
    sala: editingAluno?.sala ?? "", // Novo campo
    nome_colegio: editingAluno?.nome_colegio ?? "",
    endereco_rua: editingAluno?.endereco_rua ?? "",
    endereco_numero: editingAluno?.endereco_numero ?? "",
    endereco_bairro: editingAluno?.endereco_bairro ?? "",
    endereco_cidade: editingAluno?.endereco_cidade ?? "",
    endereco_estado: editingAluno?.endereco_estado ?? "",
    endereco_cep: editingAluno?.endereco_cep ?? "",
    tipo_residencia: editingAluno?.tipo_residencia ?? "casa",
    whatsapp_responsavel: editingAluno?.whatsapp_responsavel ?? "",
    valor_mensalidade: editingAluno?.valor_mensalidade ?? 0,
    valor_letalidade: editingAluno?.valor_letalidade ?? 0,
    dia_vencimento: editingAluno?.dia_vencimento ?? undefined,
    van_id: editingAluno?.van_id ?? selectedVanId ?? "",
  });


  const [isCustomSerie, setIsCustomSerie] = useState(false);
  const [isCustomSala, setIsCustomSala] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Estados para Colégios Dinâmicos
  const [colegios, setColegios] = useState<any[]>([]);
  const [colegiosLoading, setColegiosLoading] = useState(false);
  const [isCustomColegio, setIsCustomColegio] = useState(false);

  // Atualizar formData quando editingAluno mudar
  useEffect(() => {
    if (editingAluno) {
      setFormData({
        nome_completo: editingAluno.nome_completo || "",
        nome_responsavel: editingAluno.nome_responsavel || "",
        cpf: editingAluno.cpf || "",
        email: editingAluno.email || "",
        turno: editingAluno.turno || "manha",
        serie: editingAluno.serie || "",
        sala: editingAluno.sala || "",
        nome_colegio: editingAluno.nome_colegio || "",
        endereco_rua: editingAluno.endereco_rua || "",
        endereco_numero: editingAluno.endereco_numero || "",
        endereco_bairro: editingAluno.endereco_bairro || "",
        endereco_cidade: editingAluno.endereco_cidade || "",
        endereco_estado: editingAluno.endereco_estado || "",
        endereco_cep: editingAluno.endereco_cep || "",
        tipo_residencia: editingAluno.tipo_residencia || "casa",
        whatsapp_responsavel: editingAluno.whatsapp_responsavel || "",
        valor_mensalidade: editingAluno.valor_mensalidade || 0,
        valor_letalidade: editingAluno.valor_letalidade || 0,
        dia_vencimento: editingAluno.dia_vencimento || undefined,
        van_id: editingAluno.van_id || selectedVanId || "",
      });
    } else {
      setFormData({
        nome_completo: "",
        nome_responsavel: "",
        cpf: "",
        email: "",
        turno: "manha",
        serie: "",
        sala: "",
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
        dia_vencimento: undefined,
        van_id: selectedVanId || "",
      });
    }
  }, [editingAluno, selectedVanId]);

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
        cpf: "",
        email: "",
        turno: "manha",
        serie: "",
        sala: "",
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
        dia_vencimento: undefined,
        van_id: selectedVanId || "",
      });
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AlunoFormData, value: any) => {
    console.log(`[FormAluno] Mudando ${field} para:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));

    // Se mudar a van, resetar colégio e recarregar lista
    if (field === 'van_id') {
      setIsCustomColegio(false);
      handleInputChange('nome_colegio', '');
    }

    if (field === 'sala') {
      setIsCustomSala(value === 'Outra');
    }

    if (field === 'nome_colegio' && value === 'custom') {
      // setIsCustomColegio(true); // Desativado a pedido do Roberto
      // setFormData(prev => ({ ...prev, nome_colegio: '' }));
    }
  };

  // Carregar colégios da van selecionada
  useEffect(() => {
    const fetchColegios = async () => {
      if (!formData.van_id) {
        setColegios([]);
        return;
      }

      setColegiosLoading(true);
      try {
        const { data, error } = await supabase
          .from('van_colegios')
          .select(`
            colegio_id,
            colegios (
              id,
              nome
            )
          `)
          .eq('van_id', formData.van_id);

        if (error) throw error;

        const lista = data?.map((item: any) => ({
          id: item.colegios?.id,
          nome: item.colegios?.nome
        })).filter(c => c.id) || [];

        setColegios(lista);

        // Se estiver editando e o colégio atual não estiver na lista da van, 
        // ou se for um nome digitado manualmente, ativa modo custom
        if (editingAluno?.nome_colegio && !lista.some((c: any) => c.nome === editingAluno.nome_colegio)) {
          setIsCustomColegio(true);
        }
      } catch (err) {
        console.error('Erro ao buscar colégios:', err);
      } finally {
        setColegiosLoading(false);
      }
    };

    fetchColegios();
  }, [formData.van_id, editingAluno]);

  // Efeito inicial para detectar campos manuais na edição
  useEffect(() => {
    if (editingAluno) {
      if (editingAluno.sala && !['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(editingAluno.sala)) {
        setIsCustomSala(true);
      }
    }
  }, [editingAluno]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121212] border-white/10 text-white rounded-[24px]">
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
          <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg text-gold font-bold uppercase italic">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_completo" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nome Completo do Aluno *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                  onBlur={(e) => handleInputChange("nome_completo", formatToPascalCase(e.target.value))}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="nome_responsavel" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nome do Responsável *</Label>
                <Input
                  id="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                  onBlur={(e) => handleInputChange("nome_responsavel", formatToPascalCase(e.target.value))}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="cpf" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">CPF do Responsável *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
                    handleInputChange("cpf", formatted);
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Email do Responsável *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="senha_responsavel" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Senha de Acesso do Responsável *</Label>
                <Input
                  id="senha_responsavel"
                  type="password"
                  value={formData.senha_responsavel || ""}
                  onChange={(e) => handleInputChange("senha_responsavel", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required={!editingAluno}
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Senha para o responsável acessar a Área da Família
                </p>
              </div>
              <div>
                <Label htmlFor="turno" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Turno *</Label>
                <select
                  id="turno"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                  value={formData.turno}
                  onChange={(e) => handleInputChange("turno", e.target.value)}
                  required
                >
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="integral">Integral</option>
                  <option value="noite">Noite</option>
                </select>
              </div>
              <div>
                <Label htmlFor="serie" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Série *</Label>
                <select
                  id="serie"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-dark-lighter px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium"
                  style={{
                    background: '#1a1b23',
                    color: '#ffffff'
                  }}
                  value={formData.serie}
                  onChange={(e) => handleInputChange("serie", e.target.value)}
                  required
                >
                  <option value="" disabled style={{ background: '#1a1b23', color: '#9ca3af' }}>Selecione a série</option>
                  <optgroup label="Educação Infantil" style={{ background: '#1a1b23', color: '#fbbf24', fontWeight: 'bold' }}>
                    <option value="Berçário" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Berçário</option>
                    <option value="Maternal" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Maternal</option>
                    <option value="Infantil 2" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 2</option>
                    <option value="Infantil 3" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 3</option>
                    <option value="Infantil 4" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 4</option>
                    <option value="Infantil 5" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Infantil 5</option>
                    <option value="Jardim" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>Jardim</option>
                  </optgroup>
                  <optgroup label="Ensino Fundamental" style={{ background: '#1a1b23', color: '#60a5fa', fontWeight: 'bold' }}>
                    <option value="1º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>1º Ano</option>
                    <option value="2º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>2º Ano</option>
                    <option value="3º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>3º Ano</option>
                    <option value="4º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>4º Ano</option>
                    <option value="5º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>5º Ano</option>
                    <option value="6º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>6º Ano</option>
                    <option value="7º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>7º Ano</option>
                    <option value="8º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>8º Ano</option>
                    <option value="9º Ano" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>9º Ano</option>
                  </optgroup>
                  <optgroup label="Ensino Médio" style={{ background: '#1a1b23', color: '#34d399', fontWeight: 'bold' }}>
                    <option value="1º Médio" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>1º Médio</option>
                    <option value="2º Médio" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>2º Médio</option>
                    <option value="3º Médio" style={{ background: '#1a1b23', color: '#ffffff', paddingLeft: '1rem' }}>3º Médio</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <Label htmlFor="sala" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sala / Turma *</Label>
                <select
                  id="sala"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                  value={formData.sala}
                  onChange={(e) => handleInputChange("sala", e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione a sala</option>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(letra => (
                    <option key={letra} value={letra}>Sala {letra}</option>
                  ))}
                  <option value="Outra">Outra / Manual</option>
                </select>
                {isCustomSala && (
                  <Input
                    id="sala_manual"
                    placeholder="Digite o número/nome da sala"
                    value={formData.sala === 'Outra' ? '' : formData.sala}
                    onChange={(e) => handleInputChange("sala", e.target.value)}
                    className="mt-2 bg-[#0a0a0a] border-gold/30 text-white focus:border-gold"
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="nome_colegio" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  Nome do Colégio * {colegiosLoading && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}
                </Label>
                {!isCustomColegio ? (
                  <select
                    id="nome_colegio_select"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                    value={formData.nome_colegio}
                    onChange={(e) => handleInputChange("nome_colegio", e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione o colégio</option>
                    {colegios.map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                    {/* Opção custom removida a pedido do Roberto para manter a integridade dos dados */}
                  </select>
                ) : (
                  <div className="relative">
                    <Input
                      id="nome_colegio"
                      value={formData.nome_colegio}
                      onChange={(e) => handleInputChange("nome_colegio", e.target.value)}
                      onBlur={(e) => handleInputChange("nome_colegio", formatToPascalCase(e.target.value))}
                      placeholder="Digite o nome do colégio"
                      required
                      className="bg-[#0a0a0a] border-gold/30 text-white focus:border-gold pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomColegio(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      title="Voltar para lista"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="van_id" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Van *</Label>
                <select
                  id="van_id"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                  value={formData.van_id}
                  onChange={(e) => handleInputChange("van_id", e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione uma van</option>
                  {vans.map((van) => (
                    <option key={van.id} value={van.id}>
                      {van.nome}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Endereço */}
          <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg text-gold font-bold uppercase italic">Endereço</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="endereco_rua" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Rua *</Label>
                <Input
                  id="endereco_rua"
                  value={formData.endereco_rua}
                  onChange={(e) => handleInputChange("endereco_rua", e.target.value)}
                  onBlur={(e) => handleInputChange("endereco_rua", formatToPascalCase(e.target.value))}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="endereco_numero" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Número *</Label>
                <Input
                  id="endereco_numero"
                  value={formData.endereco_numero}
                  onChange={(e) => handleInputChange("endereco_numero", e.target.value)}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="endereco_bairro" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Bairro *</Label>
                <Input
                  id="endereco_bairro"
                  value={formData.endereco_bairro}
                  onChange={(e) => handleInputChange("endereco_bairro", e.target.value)}
                  onBlur={(e) => handleInputChange("endereco_bairro", formatToPascalCase(e.target.value))}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="endereco_cidade" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Cidade *</Label>
                <Input
                  id="endereco_cidade"
                  value={formData.endereco_cidade}
                  onChange={(e) => handleInputChange("endereco_cidade", e.target.value)}
                  onBlur={(e) => handleInputChange("endereco_cidade", formatToPascalCase(e.target.value))}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="endereco_estado" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Estado *</Label>
                <Input
                  id="endereco_estado"
                  value={formData.endereco_estado}
                  onChange={(e) => handleInputChange("endereco_estado", e.target.value)}
                  onBlur={(e) => handleInputChange("endereco_estado", e.target.value.toUpperCase())}
                  placeholder="Ex: SP, RJ, MG"
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="endereco_cep" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">CEP *</Label>
                <div className="relative">
                  <Input
                    id="endereco_cep"
                    value={formData.endereco_cep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const formatted = value.replace(/^(\d{5})(\d{3})/, "$1-$2");
                      handleInputChange("endereco_cep", formatted);
                    }}
                    onBlur={async (e) => {
                      const cep = e.target.value.replace(/\D/g, "");
                      if (cep.length === 8) {
                        setIsCepLoading(true);
                        try {
                          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                          const data = await response.json();
                          if (!data.erro) {
                            setFormData((prev) => ({
                              ...prev,
                              endereco_rua: data.logradouro,
                              endereco_bairro: data.bairro,
                              endereco_cidade: data.localidade,
                              endereco_estado: data.uf,
                            }));
                          }
                        } catch (error) {
                          console.error("Erro ao buscar CEP:", error);
                        } finally {
                          setIsCepLoading(false);
                        }
                      }
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                    className={`bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50 ${isCepLoading ? "pr-10" : ""}`}
                  />
                  {isCepLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="tipo_residencia" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tipo de Residência</Label>
                <select
                  id="tipo_residencia"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
                  value={formData.tipo_residencia}
                  onChange={(e) => handleInputChange("tipo_residencia", e.target.value)}
                >
                  <option value="casa" className="bg-[#121212]">Casa</option>
                  <option value="apartamento" className="bg-[#121212]">Apartamento</option>
                  <option value="outro" className="bg-[#121212]">Outro</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Contato e Financeiro */}
          <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg text-gold font-bold uppercase italic">Contato e Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp_responsavel" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">WhatsApp do Responsável *</Label>
                <Input
                  id="whatsapp_responsavel"
                  value={formData.whatsapp_responsavel}
                  onChange={(e) => handleInputChange("whatsapp_responsavel", e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <div>
                <Label htmlFor="valor_mensalidade" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Valor da Mensalidade *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <Input
                    id="valor_mensalidade"
                    className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                    value={formData.valor_mensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const numberValue = parseFloat(value) / 100;
                      handleInputChange("valor_mensalidade", numberValue);
                    }}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dia_vencimento" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Dia de Vencimento *</Label>
                <Input
                  id="dia_vencimento"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_vencimento || ""}
                  onChange={(e) => handleInputChange("dia_vencimento", parseInt(e.target.value) || 0)}
                  placeholder="Dia (1-31)"
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                />
                <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Dia do mês para vencimento da fatura</p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="valor_letalidade" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Taxa Extra (opcional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <Input
                    id="valor_letalidade"
                    className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                    value={formData.valor_letalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const numberValue = parseFloat(value) / 100;
                      handleInputChange("valor_letalidade", numberValue);
                    }}
                    placeholder="Ex: 50,00"
                  />
                </div>
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
    </Dialog >
  );
}