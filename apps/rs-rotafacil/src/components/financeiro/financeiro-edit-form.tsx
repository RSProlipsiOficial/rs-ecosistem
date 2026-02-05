import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, X, DollarSign, Calendar, FileText, Tag, Wallet, CreditCard, CheckCircle2 } from "lucide-react";

interface FinanceiroEditFormProps {
    initialData: any;
    tipo: 'receita' | 'despesa';
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function FinanceiroEditForm({ initialData, tipo, onSave, onCancel, loading }: FinanceiroEditFormProps) {
    const [formData, setFormData] = useState({
        ...initialData,
        valor: initialData.valor.toString(),
        data_evento: initialData.data_evento ? new Date(initialData.data_evento).toISOString().split('T')[0] : "",
        alocacao: initialData.alocacao || "empresa",
        pagamento_status: initialData.pagamento_status || "pago",
        categoria: initialData.categoria || (tipo === 'receita' ? "EXTRA" : "OUTROS"),
        descricao: initialData.descricao || "",
        observacoes: initialData.observacoes || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh] animate-in fade-in zoom-in duration-300">
            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-gold" /> Valor do Lançamento
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold font-bold">R$</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor}
                                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                    className="pl-10 h-12 bg-muted/20 border-border/50 font-black text-lg text-gold focus:border-gold/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" /> Data Efetiva
                            </Label>
                            <Input
                                type="date"
                                value={formData.data_evento}
                                onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                                className="h-12 bg-muted/20 border-border/50 font-bold focus:border-gold/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <Tag className="w-3 h-3 text-muted-foreground" /> Categoria
                            </Label>
                            <Select
                                value={formData.categoria}
                                onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                            >
                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 font-bold">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent translate="no">
                                    {tipo === 'receita' ? (
                                        <>
                                            <SelectItem value="MENSALIDADE">Mensalidade</SelectItem>
                                            <SelectItem value="FRETE">Frete</SelectItem>
                                            <SelectItem value="EXCURSÃO">Excursão</SelectItem>
                                            <SelectItem value="EXTRA">Ganho Extra</SelectItem>
                                            <SelectItem value="AJUSTE">Ajuste de Saldo</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="COMBUSTÍVEL">Combustível</SelectItem>
                                            <SelectItem value="MANUTENÇÃO">Manutenção</SelectItem>
                                            <SelectItem value="SALÁRIOS">Salários/Diárias</SelectItem>
                                            <SelectItem value="PNEUS">Pneus</SelectItem>
                                            <SelectItem value="MULTAS">Multas</SelectItem>
                                            <SelectItem value="IMPOSTOS">Impostos</SelectItem>
                                            <SelectItem value="RETIRADA">Retirada Dono</SelectItem>
                                            <SelectItem value="OUTROS">Outros</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <Wallet className="w-3 h-3 text-muted-foreground" /> Alocação (Destino)
                            </Label>
                            <Select
                                value={formData.alocacao}
                                onValueChange={(v: any) => setFormData({ ...formData, alocacao: v })}
                            >
                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 font-bold border-l-4 border-l-gold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="empresa">Empresa (Geral)</SelectItem>
                                    <SelectItem value="dono">Prólipsi Glow (Dono)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-muted-foreground" /> Status do Pagamento
                        </Label>
                        <Select
                            value={formData.pagamento_status}
                            onValueChange={(v: any) => setFormData({ ...formData, pagamento_status: v })}
                        >
                            <SelectTrigger className="h-12 bg-muted/20 border-border/50 font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pago">✅ Pago (Concluído)</SelectItem>
                                <SelectItem value="pendente">⏳ Pendente (A Vencer)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <FileText className="w-3 h-3 text-muted-foreground" /> Descrição Principal
                        </Label>
                        <Input
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            className="h-12 bg-muted/20 border-border/50 font-bold focus:border-gold/50"
                            placeholder="O que é este lançamento?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <FileText className="w-3 h-3 text-muted-foreground" /> Observações Internas
                        </Label>
                        <Textarea
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="bg-muted/20 border-border/50 h-24 text-sm resize-none focus:border-gold/50"
                            placeholder="Notas adicionais..."
                        />
                    </div>
                </div>
            </ScrollArea>

            <div className="flex gap-4 pt-4 border-t border-border/50 mt-auto">
                <Button
                    type="submit"
                    className="flex-1 h-14 bg-gold text-black font-black rounded-xl shadow-xl shadow-gold/20 hover:scale-[1.02] transition-transform"
                    disabled={loading}
                >
                    <Save className="w-5 h-5 mr-2" /> {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    className="h-14 px-8 rounded-xl font-bold hover:bg-muted"
                    onClick={onCancel}
                    disabled={loading}
                >
                    <X className="w-5 h-5 mr-2" /> CANCELAR
                </Button>
            </div>
        </form>
    );
}

