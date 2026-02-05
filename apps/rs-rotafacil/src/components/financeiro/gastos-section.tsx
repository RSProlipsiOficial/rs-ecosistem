import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, CreditCard, Trash2, Search, Filter, Calendar, DollarSign, Edit, Save, X, Tag, FileText, FileSpreadsheet } from "lucide-react";
import { LancamentoFinanceiro } from "@/types/financeiro";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ImportGastosModal } from "./import-gastos-modal";
import { FinanceiroEditForm } from "./financeiro-edit-form";
import { GastosAnalytics } from "./gastos-analytics";

interface GastosSectionProps {
  title?: string;
  gastos: LancamentoFinanceiro[];
  onMarcarGasto: (id: string) => Promise<void>;
  onCriarGasto: (data: any) => Promise<any>;
  onEditarGasto?: (id: string, data: any) => Promise<any>;
  onDeleteGasto: (id: string) => Promise<void>;
  totalGanhos?: number;
  totalGlobalEmpresa?: number;
  totalGlobalDono?: number;
  onRefresh?: () => void;
  itemToOpen?: string;
  onExport?: () => void;
}

export function GastosSection({
  title = "Controle de Despesas",
  gastos,
  onMarcarGasto,
  onCriarGasto,
  onEditarGasto,
  onDeleteGasto,
  onRefresh,
  itemToOpen,
  totalGanhos,
  totalGlobalEmpresa,
  totalGlobalDono,
  onExport
}: GastosSectionProps) {
  // ... existing state and functions ...

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGasto, setSelectedGasto] = useState<LancamentoFinanceiro | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    valor: "",
    data_evento: "",
    categoria: "",
    descricao: "",
    alocacao: "empresa" as "empresa" | "dono",
    pagamento_status: "pago" as "pago" | "pendente",
    observacoes: ""
  });

  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredGastos = useMemo(() => {
    return gastos.filter(g => {
      // Filtro de busca (texto)
      const matchesSearch = searchTerm === "" ||
        (g.descricao || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.categoria || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Se não tem categoria selecionada, retorna baseado apenas na busca
      if (!selectedCategory) return matchesSearch;

      // Se tem categoria selecionada, verifica se o gasto pertence a ela (usando o mesmo mapeamento do analytics)
      const catUpper = (g.categoria || "").toUpperCase();
      const subUpper = (g.subcategoria || "").toUpperCase();
      const descUpper = (g.descricao || "").toUpperCase();
      const matchesCategory = () => {
        if (g.alocacao === 'dono' || catUpper.includes("RETIRADA") || catUpper.includes("PRÓ-LABORE") || catUpper.includes("PRO-LABORE")) {
          // Mapeamento Dono (Apenas para garantir consistência)
          if (selectedCategory === "Investimentos (Pessoal)") return catUpper.includes("INV") || descUpper.includes("INV") || subUpper.includes("INV");
          if (selectedCategory === "Contas Fixas (Casa)") return catUpper.includes("CONTAS") || catUpper.includes("FIXO") || descUpper.includes("ALUGUEL") || descUpper.includes("LUZ") || descUpper.includes("ÁGUA");
          if (selectedCategory === "Cartão de Crédito") return descUpper.includes("FATURA") || descUpper.includes("CARTÃO") || catUpper.includes("CARTÃO") || descUpper.includes("NUBANK");
          if (selectedCategory === "Alimentação (Pessoal)") return catUpper.includes("ALIMENTAÇÃO") || descUpper.includes("COMIDA") || descUpper.includes("IFOOD");
          if (selectedCategory === "Lazer") return catUpper.includes("LAZER") || catUpper.includes("SAÍDA") || descUpper.includes("VIAGEM");
          if (selectedCategory === "Saúde & Bem-estar") return catUpper.includes("SAÚDE") || descUpper.includes("FARMÁCIA") || descUpper.includes("MÉDICO");
          if (selectedCategory === "Retirada Pessoal") return true;
        } else {
          // Mapeamento Empresa
          if (selectedCategory === "Colaboradores") return catUpper.includes("SALÁRIO") || catUpper.includes("DIÁRIA") || subUpper.includes("MOTORISTA") || subUpper.includes("MONITORA") || descUpper.includes("MOTORISTA") || descUpper.includes("MONITORA");
          if (selectedCategory === "Manutenção") return catUpper.includes("MANUTENÇÃO") || subUpper.includes("PEÇAS") || descUpper.includes("OFICINA") || descUpper.includes("MECÂNICA") || descUpper.includes("PEÇAS") || descUpper.includes("VAN") || descUpper.includes("GASOLINA") || descUpper.includes("PARCELA");
          if (selectedCategory === "Investimentos (Empresa)") return catUpper.includes("INVESTIMENT") || descUpper.includes("APORTE") || subUpper.includes("INVESTIMENT");
          if (selectedCategory === "Gestão & Ferramentas") return descUpper.includes("CHATGPT") || descUpper.includes("MERCADO PAGO") || descUpper.includes("WIFI") || descUpper.includes("INTERNET") || descUpper.includes("TAXA") || subUpper.includes("GESTÃO");
          if (selectedCategory === "Móveis & Equipamentos") return catUpper.includes("MÓVEL") || catUpper.includes("CADEIRA") || descUpper.includes("ESCRITÓRIO") || descUpper.includes("MÓVEIS");
          if (selectedCategory === "Combustível") return catUpper.includes("COMBUSTÍVEL") || descUpper.includes("POSTO") || subUpper.includes("COMBUSTÍVEL");
          if (selectedCategory === "Alimentação (Empresa)") return catUpper.includes("ALIMENTAÇÃO") || descUpper.includes("COMIDA") || descUpper.includes("LANCHE");
          if (selectedCategory === "Celular") return catUpper.includes("CELULAR") || catUpper.includes("TELEFONE");
        }
        return (g.categoria || "Outros") === selectedCategory;
      };

      return matchesSearch && matchesCategory();
    });
  }, [gastos, searchTerm, selectedCategory]);

  const handleGastoClick = (gasto: LancamentoFinanceiro) => {
    setSelectedGasto(gasto);
    setEditForm({
      valor: gasto.valor.toString(),
      data_evento: gasto.data_evento ? new Date(gasto.data_evento).toISOString().split('T')[0] : "",
      categoria: gasto.categoria || "",
      descricao: gasto.descricao || "",
      alocacao: gasto.alocacao as any || "empresa",
      pagamento_status: gasto.pagamento_status as any || "pago",
      observacoes: (gasto as any).observacoes || ""
    });
    setIsEditing(false);
    setDetailsOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedGasto) return;
    await onMarcarGasto(selectedGasto.id);
    setDetailsOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedGasto) return;
    if (confirm("Excluir esta despesa permanentemente?")) {
      await onDeleteGasto(selectedGasto.id);
      setDetailsOpen(false);
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!selectedGasto || !onEditarGasto) return;
    try {
      await onEditarGasto(selectedGasto.id, {
        ...data,
        valor: parseFloat(data.valor)
      });
      toast({ title: "Sucesso", description: "Despesa atualizada com sucesso!" });
      setDetailsOpen(false);
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden border-b-4 border-b-gold/20">
        <CardHeader className="pb-4 bg-muted/10 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-xl font-black italic">
              <CreditCard className="w-5 h-5 text-gold" />
              {title.toUpperCase()}
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar despesas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-none w-full md:w-48 text-xs rounded-xl"
                />
              </div>

              <Button
                onClick={onExport}
                variant="outline"
                className="bg-green-600/10 border-green-500/30 text-green-500 hover:bg-green-500/20 h-9 px-4 rounded-xl font-bold text-xs"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                EXCEL
              </Button>

              {onRefresh && <ImportGastosModal onSuccess={onRefresh} />}

              <Button
                onClick={() => navigate('/financeiro/novo-lancamento?tipo=despesa')}
                className="bg-gold hover:bg-gold/90 text-black h-9 px-4 rounded-xl font-black text-xs shadow-lg shadow-gold/20"
              >
                <Plus className="w-4 h-4 mr-1" /> NOVO GASTO
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <GastosAnalytics
            gastos={gastos}
            totalGanhos={totalGanhos}
            totalGlobalEmpresa={totalGlobalEmpresa}
            totalGlobalDono={totalGlobalDono}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          <div className="pt-2">
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-border/30">
                {filteredGastos.length > 0 ? (
                  filteredGastos.map((gasto) => (
                    <div
                      key={gasto.id}
                      onClick={() => handleGastoClick(gasto)}
                      className="flex items-center justify-between p-4 hover:bg-gold/[0.02] transition-colors group border-l-4 border-l-transparent hover:border-l-gold/30 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black text-foreground truncate uppercase tracking-tight">
                            {gasto.descricao}
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4 bg-muted/20 border-border/50">
                            {gasto.categoria}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                          <span className="text-gold">{formatCurrency(gasto.valor)}</span>
                          <span className="opacity-40">|</span>
                          <span className="uppercase tracking-tighter">
                            Venc: {gasto.data_evento ? new Date(gasto.data_evento).toLocaleDateString('pt-BR') : '-'}
                          </span>
                          <span className="opacity-40">|</span>
                          <span className="uppercase tracking-tighter text-[8px] bg-muted px-1.5 rounded">{gasto.alocacao}</span>
                        </div>
                      </div>

                      <Badge
                        className={`h-5 px-2 text-[9px] font-black uppercase ${gasto.pagamento_status === 'pago'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}
                      >
                        {gasto.pagamento_status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <Filter className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest opacity-50 italic">
                      Nenhum gasto encontrado
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={`${isEditing ? 'max-w-2xl' : 'max-w-md'} bg-card border-border rounded-2xl overflow-hidden p-0 border-gold/20 shadow-2xl transition-all duration-300`}>
          <div className="h-2 bg-gold w-full" />
          <div className="p-6">
            <DialogHeader className="mb-6 flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-black italic flex items-center gap-3">
                <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-black" />
                </div>
                {isEditing ? 'EDITAR DESPESA' : 'DETALHES DA DESPESA'}
              </DialogTitle>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 px-2 text-gold hover:bg-gold/10 font-bold"
                >
                  <Edit className="w-4 h-4 mr-1" /> Editar
                </Button>
              )}
            </DialogHeader>

            {selectedGasto && (
              <div className="space-y-6">
                {isEditing ? (
                  <FinanceiroEditForm
                    tipo="despesa"
                    initialData={selectedGasto}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                    loading={false}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Valor</p>
                        <p className="text-xl font-black text-red-500 tracking-tighter">{formatCurrency(selectedGasto.valor)}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Status</p>
                        <Badge className={`h-6 px-3 text-[10px] font-black uppercase ${selectedGasto.pagamento_status === 'pago' ? "bg-green-500" : "bg-yellow-500"}`}>
                          {selectedGasto.pagamento_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-muted/10 p-4 rounded-2xl border border-border/30 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Vencimento</span>
                        <span className="font-black">{selectedGasto.data_evento ? new Date(selectedGasto.data_evento).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Categoria</span>
                        <span className="font-black text-red-500">{selectedGasto.categoria}</span>
                      </div>
                      <div className="flex justify-between items-start text-xs pt-2 border-t border-border/30">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Descrição</span>
                        <span className="font-medium text-right max-w-[200px]">{selectedGasto.descricao}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className={`flex-1 h-12 rounded-xl font-black shadow-lg ${selectedGasto.pagamento_status === 'pago'
                          ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20'
                          : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                          }`}
                        onClick={handleToggleStatus}
                      >
                        {selectedGasto.pagamento_status === 'pago' ? '⏰ DESMARCAR PAGAMENTO' : '✅ MARCAR COMO PAGO'}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:bg-red-500/10 h-12 w-12 p-0 rounded-xl"
                        onClick={handleDelete}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}