import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Van } from "@/types/alunos";

interface VanSelectorProps {
  vans: Van[];
  selectedVan: string | null;
  onVanSelect: (vanId: string) => void;
  onAddVan: () => void;
  alunosCount: number;
}

export function VanSelector({ vans, selectedVan, onVanSelect, onAddVan, alunosCount }: VanSelectorProps) {
  const selectedVanData = vans.find(van => van.id === selectedVan);

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-black-primary" />
          </div>
          Seleção de Van
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Select value={selectedVan || ""} onValueChange={onVanSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma van..." />
              </SelectTrigger>
              <SelectContent>
                {vans.map((van) => (
                  <SelectItem key={van.id} value={van.id}>
                    {van.nome} (Capacidade: {van.capacidade_maxima} alunos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={onAddVan}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-black-primary"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {selectedVanData && (
          <div className="p-4 bg-secondary rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{selectedVanData.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  Capacidade máxima: {selectedVanData.capacidade_maxima} alunos
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gold">{alunosCount}</div>
                <div className="text-sm text-muted-foreground">Alunos cadastrados</div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-gold h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((alunosCount / selectedVanData.capacidade_maxima) * 100, 100)}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {alunosCount > selectedVanData.capacidade_maxima && (
                  <span className="text-destructive">Atenção: Capacidade excedida!</span>
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}