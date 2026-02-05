import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Wallet, CreditCard, CheckCircle2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { toast } from "@/hooks/use-toast";

const NovoLancamento = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { onCriarLancamento, loading: hookLoading } = useFinanceiro();
    const tipoParam = searchParams.get('tipo') === 'despesa' ? 'despesa' : 'receita';

    const [formData, setFormData] = useState({
        tipo: tipoParam as 'receita' | 'despesa',
        descricao: "",
        valor: "",
        categoria: tipoParam === 'receita' ? "EXTRA" : "OUTROS",
        data_evento: new Date().toISOString().split('T')[0],
        status: "realizado" as 'realizado' | 'previsto',
        pagamento_status: "pago" as 'pago' | 'pendente',
        alocacao: "empresa" as const,
        observacoes: "",
        origem: "manual" as const
    });

    const [loading, setLoading] = useState(false);

    const formatCurrency = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    const sugestoes = tipoParam === 'receita' ? [
        { label: "Frete", cat: "FRETE" },
        { label: "Excursão", cat: "EXCURSÃO" },
        { label: "Ajuda", cat: "EXTRA" },
        { label: "Presente", cat: "EXTRA" },
        { label: "Ajuste Saldo", cat: "AJUSTE" },
    ] : [
        { label: "Combustível", cat: "COMBUSTÍVEL", aloc: "empresa" },
        { label: "Manutenção", cat: "MANUTENÇÃO", aloc: "empresa" },
        { label: "Salário Monitor", cat: "SALÁRIOS", aloc: "empresa" },
        { label: "Pneus", cat: "PNEUS", aloc: "empresa" },
        { label: "Retirada Dono", cat: "RETIRADA", aloc: "dono" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Iniciando submissão do formulário:", formData);

        if (!formData.descricao || !formData.valor) {
            toast({ title: "Erro", description: "Preencha a descrição e o valor.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Sanitizar valor (remover pontos de milhar e trocar virgula por ponto se necessário)
            const valorLimpo = formData.valor.replace(/\./g, '').replace(',', '.');
            const valorNum = parseFloat(valorLimpo);

            if (isNaN(valorNum)) {
                throw new Error("Valor numérico inválido.");
            }

            // Calcular competência (YYYY-MM) com base na data do evento
            const dataEvento = new Date(formData.data_evento);
            if (isNaN(dataEvento.getTime())) {
                throw new Error("Data inválida.");
            }
            const competencia = `${dataEvento.getFullYear()}-${(dataEvento.getMonth() + 1).toString().padStart(2, '0')}`;

            const finalData = {
                ...formData,
                valor: valorNum,
                competencia
            };

            console.log("Enviando dados para o banco:", finalData);

            await onCriarLancamento(finalData);

            toast({ title: "Sucesso", description: "Lançamento registrado com sucesso!" });
            navigate('/financeiro');
        } catch (error: any) {
            console.error("Erro CRÍTICO ao salvar lançamento manual:", error);
            toast({
                title: "Falha ao Salvar",
                description: `Erro: ${error.message || 'Erro desconhecido.'}. Verifique se todos os campos estão corretos.`,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" translate="no">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/financeiro')}
                    className="text-muted-foreground hover:text-gold"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Hub
                </Button>

                <Card className="bg-card border-border shadow-2xl overflow-hidden border-t-4 border-t-gold">
                    <CardHeader className="bg-muted/30 pb-6 border-b border-border">
                        <CardTitle className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${formData.tipo === 'receita' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                {formData.tipo === 'receita' ? <Wallet className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Novo Lançamento</h2>
                                <p className="text-sm text-muted-foreground">Registre uma nova {formData.tipo} no Livro Caixa.</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="p-4 bg-gold/5 rounded-xl border border-gold/20 mb-6">
                                <Label className="mb-3 block text-gold font-bold text-xs uppercase tracking-wider">Sugestões Rápidas</Label>
                                <div className="flex flex-wrap gap-2">
                                    {sugestoes.map((sug) => (
                                        <Button
                                            key={sug.label}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                descricao: sug.label,
                                                categoria: sug.cat,
                                                alocacao: (sug as any).aloc || prev.alocacao
                                            }))}
                                            className="text-[10px] h-8 border-gold/30 hover:bg-gold hover:text-black transition-all"
                                        >
                                            {sug.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo de Movimentação</Label>
                                    <Select
                                        value={formData.tipo}
                                        onValueChange={(v: any) => setFormData(prev => ({ ...prev, tipo: v, categoria: v === 'receita' ? 'EXTRA' : 'OUTROS' }))}
                                    >
                                        <SelectTrigger className="h-12 border-border/50 bg-muted/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent translate="no">
                                            <SelectItem value="receita">Dinheiro Entrando (Receita)</SelectItem>
                                            <SelectItem value="despesa">Dinheiro Saindo (Despesa)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="valor">Valor (R$)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                                        <Input
                                            id="valor"
                                            type="number"
                                            step="0.01"
                                            value={formData.valor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                                            className="pl-10 h-12 text-lg font-bold border-border/50 bg-muted/20 focus:border-gold"
                                            placeholder="0,00"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descricao">O que é este lançamento?</Label>
                                <Input
                                    id="descricao"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                    className="h-12 border-border/50 bg-muted/20"
                                    placeholder="Ex: Pagamento Extra Maria, Conserto da Van, Almoço..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoria Auditável</Label>
                                    <Select
                                        key={formData.tipo}
                                        value={formData.categoria}
                                        onValueChange={(v: any) => setFormData(prev => ({ ...prev, categoria: v }))}
                                    >
                                        <SelectTrigger className="h-12 border-border/50 bg-muted/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent translate="no">
                                            {formData.tipo === 'receita' ? (
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
                                    <Label htmlFor="data_evento">Data Efetiva</Label>
                                    <Input
                                        id="data_evento"
                                        type="date"
                                        value={formData.data_evento}
                                        onChange={(e) => setFormData(prev => ({ ...prev, data_evento: e.target.value }))}
                                        className="h-12 border-border/50 bg-muted/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="alocacao">Quem paga? (Alocação)</Label>
                                    <Select
                                        value={formData.alocacao}
                                        onValueChange={(v: any) => setFormData(prev => ({ ...prev, alocacao: v }))}
                                    >
                                        <SelectTrigger className="h-12 border-border/50 bg-muted/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="empresa">Empresa (Rota Fácil)</SelectItem>
                                            <SelectItem value="dono">Dono (Pessoal/Retirada)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground italic">Isso ajuda a calcular o lucro real da empresa separadamente das suas retiradas.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pagamento_status">Status do Pagamento</Label>
                                    <Select
                                        value={formData.pagamento_status}
                                        onValueChange={(v: any) => setFormData(prev => ({ ...prev, pagamento_status: v, status: v === 'pago' ? 'realizado' : 'previsto' }))}
                                    >
                                        <SelectTrigger className="h-12 border-border/50 bg-muted/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pago">✅ Pago (Baixado na Conta)</SelectItem>
                                            <SelectItem value="pendente">⏳ Pendente (A Vencer)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground italic">Marca se o dinheiro já entrou/saiu ou se está agendado.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações Internas</Label>
                                <Textarea
                                    id="observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                                    className="bg-muted/20 border-border/50"
                                    placeholder="Ex: Nota fiscal enviada, ajuste feito via pix..."
                                />
                            </div>

                            <div className="pt-6 border-t border-border flex flex-col md:flex-row gap-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-14 bg-gold text-black hover:opacity-90 text-lg font-bold shadow-xl"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2"><ArrowLeft className="animate-spin w-4 h-4" /> Salvando...</span>
                                    ) : (
                                        <span className="flex items-center gap-2 transition-transform hover:scale-105"><CheckCircle2 className="w-5 h-5" /> Confirmar Lançamento</span>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/financeiro')}
                                    className="h-14 border-border hover:bg-muted font-bold text-muted-foreground"
                                >
                                    Cancelar
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default NovoLancamento;
