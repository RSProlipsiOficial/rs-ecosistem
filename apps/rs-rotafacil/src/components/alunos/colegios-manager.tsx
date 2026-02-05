import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, School } from "lucide-react";
import { ColegioForm } from "@/components/alunos/colegio-form";
import { ColegiosList } from "@/components/alunos/colegios-list";
import { useColegios } from "@/hooks/useColegios";
import { useVans } from "@/hooks/useVans";
import { Colegio, ColegioFormData } from "@/types/colegios";

export function ColegiosManager() {
    const [showColegioForm, setShowColegioForm] = useState(false);
    const [editingColegio, setEditingColegio] = useState<Colegio | null>(null);
    const [editingVanIds, setEditingVanIds] = useState<string[]>([]);

    const { colegios, loading, createColegio, updateColegio, deleteColegio, getVansByColegio, refetch } = useColegios();
    const { vans, loading: vansLoading } = useVans();

    const handleAddColegio = () => {
        setEditingColegio(null);
        setEditingVanIds([]);
        setShowColegioForm(true);
    };

    const handleEditColegio = async (colegio: Colegio, vanIds: string[]) => {
        setEditingColegio(colegio);
        setEditingVanIds(vanIds);
        setShowColegioForm(true);
    };

    const handleColegioSubmit = async (data: ColegioFormData) => {
        try {
            if (editingColegio) {
                await updateColegio(editingColegio.id, data);
            } else {
                await createColegio(data);
            }
            setShowColegioForm(false);
            setEditingColegio(null);
            setEditingVanIds([]);
            refetch();
        } catch (error) {
            // Error handling is done in the hooks
        }
    };

    const handleDeleteColegio = async (id: string) => {
        await deleteColegio(id);
        refetch();
    };

    if (loading || vansLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando colégios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <School className="w-6 h-6 text-gold" />
                        Gerenciar <span className="text-gold">Colégios</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Cadastre os colégios que você atende e associe às suas vans
                    </p>
                </div>
                <Button
                    onClick={handleAddColegio}
                    className="bg-gradient-gold text-black-primary hover:opacity-90"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Colégio
                </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 font-bold uppercase">Total de Colégios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gold">{colegios.length}</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 font-bold uppercase">Vans Cadastradas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gold">{vans.length}</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#1A1A1A] border-white/5 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 font-bold uppercase">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-500">{colegios.length > 0 ? "Ativo" : "Aguardando"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Colégios */}
            <ColegiosList
                colegios={colegios}
                vans={vans}
                onEdit={handleEditColegio}
                onDelete={handleDeleteColegio}
                getVansByColegio={getVansByColegio}
            />

            {/* Form */}
            <ColegioForm
                open={showColegioForm}
                onClose={() => {
                    setShowColegioForm(false);
                    setEditingColegio(null);
                    setEditingVanIds([]);
                }}
                onSubmit={handleColegioSubmit}
                vans={vans}
                editingColegio={editingColegio}
                initialVanIds={editingVanIds}
            />
        </div>
    );
}
