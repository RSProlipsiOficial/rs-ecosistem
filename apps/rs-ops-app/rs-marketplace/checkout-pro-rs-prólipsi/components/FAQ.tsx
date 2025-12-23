
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const QUESTIONS = [
  {
    question: "O pagamento é seguro?",
    answer: "Sim, utilizamos criptografia de ponta a ponta (AES-256). Seus dados financeiros não são armazenados em nossos servidores e a transação é processada por gateways certificados."
  },
  {
    question: "Como recebo meu acesso?",
    answer: "Para produtos digitais, o acesso é enviado imediatamente para o seu e-mail após a aprovação do pagamento. Para produtos físicos, você receberá o código de rastreio assim que postado."
  },
  {
    question: "Tem garantia?",
    answer: "Sim! Todos os produtos RS Prólipsi possuem garantia incondicional de 7 dias. Se não estiver satisfeito, devolvemos 100% do seu dinheiro."
  },
  {
    question: "Posso parcelar no boleto?",
    answer: "O parcelamento está disponível apenas para cartões de crédito em até 12x. Boletos e PIX são para pagamento à vista."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-8 pt-8 border-t border-rs-border/50 animate-in fade-in slide-in-from-bottom-6">
      <h3 className="text-sm font-bold text-rs-muted uppercase tracking-wider mb-4 flex items-center gap-2">
        <HelpCircle className="w-4 h-4" /> Dúvidas Frequentes
      </h3>
      
      <div className="space-y-3">
        {QUESTIONS.map((item, index) => (
          <div 
            key={index} 
            className="border border-rs-border/50 rounded-lg overflow-hidden bg-[#161920]/50"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-3 text-left text-sm font-medium text-rs-text hover:text-rs-gold transition-colors"
            >
              {item.question}
              {openIndex === index ? <ChevronUp className="w-4 h-4 text-rs-gold" /> : <ChevronDown className="w-4 h-4 text-rs-muted" />}
            </button>
            
            {openIndex === index && (
              <div className="p-3 pt-0 text-xs text-rs-muted leading-relaxed border-t border-rs-border/30 bg-[#161920]">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
