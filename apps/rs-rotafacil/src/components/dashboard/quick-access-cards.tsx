import { Card, CardContent } from "@/components/ui/card";
import { Users, Brain, Headphones } from "lucide-react";

const quickAccessItems = [
  {
    id: "alunos",
    title: "Alunos",
    description: "Gerenciar alunos e informações",
    icon: Users,
    color: "hover:border-gold hover:shadow-gold",
  },
  {
    id: "ia",
    title: "IA / RSA",
    description: "Mensagens automáticas e inteligentes",
    icon: Brain,
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
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">Acesso Rápido</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Card 
              key={item.id}
              className={`bg-card border-border shadow-card transition-all duration-300 cursor-pointer group ${item.color}`}
            >
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
    </div>
  );
}