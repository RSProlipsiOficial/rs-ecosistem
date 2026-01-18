import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Aluno } from "@/types/alunos";
import { User, MapPin, Phone, CreditCard, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AlunoFormProps {
    open: boolean;
    onClose: () => void;
    aluno: Aluno | null;
    onSuccess?: () => void;
}

export function AlunoForm({ open, onClose, aluno, onSuccess }: AlunoFormProps) {
    const [formData, setFormData] = useState<Partial<Aluno>>({});
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (aluno) {
            setFormData(aluno);
        }
    }, [aluno]);

    if (!aluno) return null;

    const handleSave = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('alunos')
                .update({
                    nome_completo: formData.nome_completo,
                    serie: formData.serie,
                    turno: formData.turno,
                    nome_colegio: formData.nome_colegio,
                    nome_responsavel: formData.nome_responsavel,
                    whatsapp_responsavel: formData.whatsapp_responsavel,
                    cpf: formData.cpf,
                    email: formData.email,
                    endereco_rua: formData.endereco_rua,
                    endereco_numero: formData.endereco_numero,
                    endereco_bairro: formData.endereco_bairro,
                    endereco_cidade: formData.endereco_cidade,
                    endereco_cep: formData.endereco_cep,
                })
                .eq('id', aluno.id);

            if (error) throw error;

            toast({
                title: "Sucesso!",
                description: "Dados do aluno atualizados com sucesso.",
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Erro ao salvar aluno:", error);
            toast({
                title: "Erro ao salvar",
                description: error.message || "Não foi possível atualizar os dados.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof Aluno, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black-primary border-gold/20 text-white p-0 overflow-hidden">
                <div className="bg-gradient-gold h-1 w-full" />
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-3 text-gold italic uppercase text-2xl font-black">
                        <User className="w-6 h-6" /> Ficha do Aluno
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Informações Básicas */}
                    <Card className="bg-black-secondary border-gold/10 shadow-elegant">
                        <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gold flex items-center gap-2 italic">
                                <User className="w-4 h-4" /> Dados Pessoais
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Nome do Aluno</Label>
                                <Input
                                    value={formData.nome_completo || ''}
                                    onChange={(e) => handleChange('nome_completo', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Série</Label>
                                <Input
                                    value={formData.serie || ''}
                                    onChange={(e) => handleChange('serie', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Turno</Label>
                                <Input
                                    value={formData.turno || ''}
                                    onChange={(e) => handleChange('turno', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Colégio</Label>
                                <Input
                                    value={formData.nome_colegio || ''}
                                    onChange={(e) => handleChange('nome_colegio', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Responsável */}
                    <Card className="bg-black-secondary border-gold/10 shadow-elegant">
                        <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gold flex items-center gap-2 italic">
                                <Phone className="w-4 h-4" /> Dados do Responsável
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Nome do Responsável</Label>
                                <Input
                                    value={formData.nome_responsavel || ''}
                                    onChange={(e) => handleChange('nome_responsavel', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">WhatsApp</Label>
                                <Input
                                    value={formData.whatsapp_responsavel || ''}
                                    onChange={(e) => handleChange('whatsapp_responsavel', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">CPF</Label>
                                <Input
                                    value={formData.cpf || ''}
                                    onChange={(e) => handleChange('cpf', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Email</Label>
                                <Input
                                    value={formData.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereço */}
                    <Card className="bg-black-secondary border-gold/10 shadow-elegant">
                        <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gold flex items-center gap-2 italic">
                                <MapPin className="w-4 h-4" /> Endereço de Coleta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rua</Label>
                                <Input
                                    value={formData.endereco_rua || ''}
                                    onChange={(e) => handleChange('endereco_rua', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Nº</Label>
                                <Input
                                    value={formData.endereco_numero || ''}
                                    onChange={(e) => handleChange('endereco_numero', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Bairro</Label>
                                <Input
                                    value={formData.endereco_bairro || ''}
                                    onChange={(e) => handleChange('endereco_bairro', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Cidade</Label>
                                <Input
                                    value={formData.endereco_cidade || ''}
                                    onChange={(e) => handleChange('endereco_cidade', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">CEP</Label>
                                <Input
                                    value={formData.endereco_cep || ''}
                                    onChange={(e) => handleChange('endereco_cep', e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 text-white font-medium focus:border-gold/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financeiro - Read Only */}
                    <Card className="bg-black-primary/40 border-gold/20 border-dashed">
                        <CardHeader className="pb-2 border-b border-white/5 opacity-50">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gold flex items-center gap-2 italic">
                                <CreditCard className="w-4 h-4" /> Plano Financeiro (Inalterável)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 opacity-50">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold">Mensalidade</Label>
                                <div className="p-2.5 bg-gold/5 border border-gold/20 rounded-md text-gold font-black">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aluno.valor_mensalidade)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold">Dia de Vencimento</Label>
                                <Input value={aluno.dia_vencimento ? `Todo dia ${aluno.dia_vencimento}` : 'Não definido'} disabled className="bg-black/20 border-white/10" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter className="p-6 bg-white/[0.02] border-t border-white/5 gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-white hover:bg-white/5 font-bold uppercase tracking-widest"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-gradient-gold text-black font-black uppercase tracking-[0.2em] italic hover:scale-[1.02] transition-transform min-w-[150px]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Dados
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
