import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, School, Bus } from "lucide-react";
import { Colegio } from "@/types/colegios";
import { Van } from "@/types/alunos";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ColegiosListProps {
    colegios: Colegio[];
    vans: Van[];
    onEdit: (colegio: Colegio, vanIds: string[]) => void;
    onDelete: (id: string) => void;
    getVansByColegio: (colegioId: string) => Promise<string[]>;
}

export function ColegiosList({ colegios, vans, onEdit, onDelete, getVansByColegio }: ColegiosListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [colegioVans, setColegioVans] = useState<Record<string, string[]>>({});

    const loadColegioVans = async (colegioId: string) => {
        const vanIds = await getVansByColegio(colegioId);
        setColegioVans(prev => ({ ...prev, [colegioId]: vanIds }));
    };

    const handleEdit = async (colegio: Colegio) => {
        const vanIds = await getVansByColegio(colegio.id);
        onEdit(colegio, vanIds);
    };

    // Carregar vans de cada colégio quando a lista é montada
    useState(() => {
        colegios.forEach(colegio => {
            if (!colegioVans[colegio.id]) {
                loadColegioVans(colegio.id);
            }
        });
    });

    const getVanNames = (colegioId: string): string[] => {
        const vanIds = colegioVans[colegioId] || [];
        return vanIds
            .map(vanId => vans.find(v => v.id === vanId)?.nome)
            .filter(Boolean) as string[];
    };

    if (colegios.length === 0) {
        return (
            <Card className="bg-card border-border shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <School className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum colégio cadastrado
                    </h3>
                    <p className="text-muted-foreground text-center">
                        Comece adicionando os colégios que você atende.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colegios.map((colegio) => {
                    const vanNames = getVanNames(colegio.id);

                    return (
                        <Card key={colegio.id} className="bg-[#1A1A1A] border-white/5 hover:border-gold/30 transition-all shadow-xl">
                            <CardHeader className="border-b border-white/5 pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
                                            <School className="w-5 h-5 text-black" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base text-white font-bold truncate">
                                                {colegio.nome}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {/* Vans que atendem */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Vans que Atendem:</p>
                                    {vanNames.length > 0 ? (
                                        <div className="flex flex-wrap gap-booleanfalse2">
                                            {vanNames.map((vanName, index) => (
                                                <Badge key={index} variant="outline" className="bg-gold/10 border-gold/30 text-gold text-xs">
                                                    <Bus className="w-3 h-3 mr-1" />
                                                    {vanName}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">Nenhuma van associada</p>
                                    )}
                                </div>

                                {/* Ações */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(colegio)}
                                        className="flex-1 border-white/10 hover:border-gold/50 hover:bg-gold/5"
                                    >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeletingId(colegio.id)}
                                        className="flex-1 border-red-500/20 text-red-500 hover:border-red-500/50 hover:bg-red-500/5"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Excluir
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Dialog de confirmação de exclusão */}
            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover este colégio? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deletingId) {
                                    onDelete(deletingId);
                                    setDeletingId(null);
                                }
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Remover Colégio
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
