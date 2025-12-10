import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MapPin, MessageCircle } from "lucide-react";
import { Aluno } from "@/types/alunos";

interface AlunoCardProps {
  aluno: Aluno;
  onEdit: (aluno: Aluno) => void;
  onDelete: (id: string) => void;
  onViewMap: (aluno: Aluno) => void;
  onSendWhatsApp: (whatsapp: string) => void;
}

export function AlunoCard({ aluno, onEdit, onDelete, onViewMap, onSendWhatsApp }: AlunoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatWhatsApp = (whatsapp: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = whatsapp.replace(/\D/g, '');
    
    // Formatar como (XX) XXXXX-XXXX
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return whatsapp;
  };

  const getTurnoColor = (turno: string) => {
    const colors = {
      manha: "bg-blue-500/10 text-blue-600 border-blue-200",
      tarde: "bg-orange-500/10 text-orange-600 border-orange-200", 
      integral: "bg-purple-500/10 text-purple-600 border-purple-200",
      noite: "bg-gray-500/10 text-gray-600 border-gray-200"
    };
    return colors[turno as keyof typeof colors] || colors.manha;
  };

  const getTurnoLabel = (turno: string) => {
    const labels = {
      manha: "Manhã",
      tarde: "Tarde",
      integral: "Integral",
      noite: "Noite"
    };
    return labels[turno as keyof typeof labels] || turno;
  };

  return (
    <Card className="bg-card border-border shadow-card hover:shadow-gold transition-all duration-300">
      <CardContent className="p-6">
        {/* Header com nome e ações */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{aluno.nome_completo}</h3>
            <p className="text-muted-foreground">Responsável: {aluno.nome_responsavel}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(aluno)}
              className="hover:bg-sidebar-accent"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(aluno.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Informações acadêmicas */}
        <div className="flex gap-3 mb-4">
          <Badge variant="outline" className={getTurnoColor(aluno.turno)}>
            {getTurnoLabel(aluno.turno)}
          </Badge>
          <Badge variant="outline" className="border-gold text-gold">
            {aluno.serie}
          </Badge>
        </div>

        {/* Endereço */}
        <div className="mb-4 p-3 bg-secondary rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Endereço</h4>
          <p className="text-sm text-muted-foreground">
            {aluno.endereco_rua}, {aluno.endereco_numero} - {aluno.endereco_bairro}
          </p>
          <p className="text-sm text-muted-foreground">
            {aluno.endereco_cidade}, {aluno.endereco_estado} - CEP: {aluno.endereco_cep}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            Tipo: {aluno.tipo_residencia}
          </p>
        </div>

        {/* Contato */}
        <div className="mb-4 p-3 bg-secondary rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground">WhatsApp</h4>
              <p className="text-sm text-muted-foreground">{formatWhatsApp(aluno.whatsapp_responsavel)}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSendWhatsApp(aluno.whatsapp_responsavel)}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-4 p-3 bg-secondary rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Financeiro</h4>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Mensalidade:</span>
            <span className="font-semibold text-gold">{formatCurrency(aluno.valor_mensalidade)}</span>
          </div>
          {aluno.valor_letalidade && aluno.valor_letalidade > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-muted-foreground">Letalidade:</span>
              <span className="font-semibold text-foreground">{formatCurrency(aluno.valor_letalidade)}</span>
            </div>
          )}
        </div>

        {/* Botão do mapa */}
        <Button
          variant="outline"
          className="w-full border-gold text-gold hover:bg-gold hover:text-black-primary"
          onClick={() => onViewMap(aluno)}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Visualizar no Mapa
        </Button>
      </CardContent>
    </Card>
  );
}