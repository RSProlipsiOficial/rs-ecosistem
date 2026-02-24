import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, School } from "lucide-react";
import { ColegioFormData, Colegio } from "@/types/colegios";
import { Van } from "@/types/alunos";

interface ColegioFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ColegioFormData) => Promise<void>;
    vans: Van[];
    editingColegio?: Colegio | null;
    initialVanIds?: string[];
}

export function ColegioForm({ open, onClose, onSubmit, vans, editingColegio, initialVanIds }: ColegioFormProps) {
    const [formData, setFormData] = useState<ColegioFormData>({
        nome: editingColegio?.nome ?? "",
        van_ids: initialVanIds ?? []
    });
    const [loading, setLoading] = useState(false);

    // Atualizar formData quando editingColegio mudar
    useEffect(() => {
        if (editingColegio) {
            setFormData({
                nome: editingColegio.nome || "",
                van_ids: initialVanIds || []
            });
        } else {
            setFormData({
                nome: "",
                van_ids: []
            });
        }
    }, [editingColegio, initialVanIds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit(formData);
            onClose();
            setFormData({ nome: "", van_ids: [] });
        } catch (error) {
            console.error('Erro ao salvar colégio:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleVan = (vanId: string) => {
        setFormData(prev => ({
            ...prev,
            van_ids: prev.van_ids?.includes(vanId)
                ? prev.van_ids.filter(id => id !== vanId)
                : [...(prev.van_ids || []), vanId]
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121212] border-white/10 text-white rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-foreground">
                        <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                            <School className="w-5 h-5 text-black-primary" />
                        </div>
                        {editingColegio ? "Editar Colégio" : "Adicionar Novo Colégio"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-lg text-gold font-bold uppercase italic">Informações do Colégio</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 pt-6">
                            <div>
                                <Label htmlFor="nome" className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nome do Colégio *</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Colégio São Lucas"
                                    required
                                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-gold/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vans que atendem este colégio */}
                    <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-lg text-gold font-bold uppercase italic">Vans que Atendem</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-xs text-gray-500 mb-4">Selecione quais vans fazem rota para este colégio:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {vans.length > 0 ? vans.map((van) => (
                                    <div key={van.id} className="flex items-center space-x-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-gold/30 transition-all">
                                        <Checkbox
                                            id={`van-${van.id}`}
                                            checked={formData.van_ids?.includes(van.id) ?? false}
                                            onCheckedChange={() => toggleVan(van.id)}
                                            className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                                        />
                                        <Label
                                            htmlFor={`van-${van.id}`}
                                            className="text-sm font-medium text-white cursor-pointer flex-1"
                                        >
                                            {van.nome}
                                        </Label>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 col-span-2">Nenhuma van cadastrada. Cadastre uma van primeiro.</p>
                                )}
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
                            <Plus className="w-4 h-4 mr-2" />
                            {loading ? "Salvando..." : editingColegio ? "Atualizar" : "Adicionar"} Colégio
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
