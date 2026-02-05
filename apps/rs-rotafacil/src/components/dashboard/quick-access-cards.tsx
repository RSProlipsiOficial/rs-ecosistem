import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickAccessItems = [
  {
    id: "alunos",
    title: "Alunos",
    description: "Gerenciar alunos e informações",
    icon: Users,
    color: "hover:border-gold hover:shadow-gold",
  },
  {
    id: "financeiro",
    title: "Financeiro",
    description: "Controle seus ganhos e faturas",
    icon: DollarSign,
    color: "hover:border-gold hover:shadow-gold",
  },
  {
    id: "suporte",
    title: "Suporte",
    description: "Ajuda e atendimento",
    icon: Headphones,
    color: "hover:border-gold hover:shadow-gold",
  },
];

export function QuickAccessCards() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Acesso <span className="text-gold">Rápido</span></h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.id}
              onClick={() => {
                if (item.id === 'alunos') navigate('/alunos');
                if (item.id === 'financeiro') navigate('/financeiro');
                if (item.id === 'suporte') navigate('/suporte');
              }}
              className="bg-card/40 backdrop-blur-md border border-gold/10 shadow-elegant transition-all duration-500 cursor-pointer group hover:border-gold/40 hover:shadow-gold/10 hover:-translate-y-1 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center group-hover:animate-glow">
                    <Icon className="w-6 h-6 text-black-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-gold transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div >
  );
}