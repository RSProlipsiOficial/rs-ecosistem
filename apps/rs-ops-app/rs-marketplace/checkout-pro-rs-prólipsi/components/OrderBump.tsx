
import React from 'react';
import { useCheckout } from '../context/CheckoutContext';
import { ArrowBigDown, CheckSquare, Square, Ticket, Award } from 'lucide-react';
import { POINTS_MULTIPLIER } from '../constants';

export const OrderBump: React.FC = () => {
  const { isOrderBumpSelected, toggleOrderBump, orderBumpProduct } = useCheckout();

  // Calculate potential points for this item
  const pointsGain = Math.floor(orderBumpProduct.price * POINTS_MULTIPLIER);

  return (
    <div 
      onClick={toggleOrderBump}
      className={`
        relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all duration-300 group select-none transform hover:scale-[1.01]
        ${isOrderBumpSelected 
          ? 'bg-rs-gold/10 border-rs-gold shadow-[0_0_20px_rgba(200,167,78,0.15)]' 
          : 'bg-[#161920] border-rs-border hover:border-rs-gold/50 hover:bg-[#1A1D23]'}
      `}
    >
      {/* Label Badge */}
      <div className={`
        absolute -top-3 left-4 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded flex items-center gap-1 transition-colors
        ${isOrderBumpSelected 
          ? 'bg-rs-gold text-black border-rs-gold' 
          : 'bg-[#0F1115] text-rs-gold border-rs-gold/30'}
      `}>
         <Ticket className="w-3 h-3" /> Oferta Especial
      </div>

      <div className="flex items-start gap-4">
        {/* Checkbox Visual */}
        <div className={`mt-1 flex-shrink-0 transition-all duration-300 ${isOrderBumpSelected ? 'text-rs-gold scale-110' : 'text-rs-muted group-hover:text-rs-gold/70'}`}>
           {isOrderBumpSelected 
             ? <CheckSquare className="w-6 h-6" /> 
             : <Square className="w-6 h-6" />}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
             <h4 className={`text-sm font-bold uppercase transition-colors duration-300 ${isOrderBumpSelected ? 'text-rs-gold' : 'text-rs-text group-hover:text-rs-gold/80'}`}>
                {isOrderBumpSelected ? 'Adicionado ao pedido!' : 'Adicionar ao seu pedido?'}
             </h4>
             
             {/* Price Block */}
             <div className="text-right flex flex-col items-end">
                {orderBumpProduct.originalPrice && (
                    <span className="text-[10px] text-rs-muted line-through opacity-70">
                        De R$ {orderBumpProduct.originalPrice.toFixed(2)}
                    </span>
                )}
                <div className="flex items-center gap-2">
                    {orderBumpProduct.originalPrice && (
                        <span className="bg-green-500/10 text-green-400 text-[9px] px-1.5 py-0.5 rounded border border-green-500/20 font-bold hidden sm:inline-block">
                            -{Math.round(((orderBumpProduct.originalPrice - orderBumpProduct.price) / orderBumpProduct.originalPrice) * 100)}%
                        </span>
                    )}
                    <span className={`font-bold text-sm block transition-colors ${isOrderBumpSelected ? 'text-rs-gold' : 'text-rs-text'}`}>
                        por R$ {orderBumpProduct.price.toFixed(2)}
                    </span>
                </div>
                
                {/* Points Incentive */}
                <span className={`text-[10px] flex items-center justify-end gap-1 mt-0.5 transition-colors ${isOrderBumpSelected ? 'text-rs-gold font-bold' : 'text-rs-muted'}`}>
                    <Award className="w-3 h-3" />
                    +{pointsGain} pts
                </span>
             </div>
          </div>
          
          <p className="text-sm font-bold text-white mt-1 group-hover:text-rs-gold/90 transition-colors">
             {orderBumpProduct.name}
          </p>
          
          <p className="text-xs text-rs-muted mt-1 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
             {orderBumpProduct.description}
          </p>
        </div>
      </div>
      
      {/* Blinking Arrow Animation for Attention (Only when NOT selected) */}
      {!isOrderBumpSelected && (
         <div className="absolute -right-2 -bottom-2 text-rs-gold/60 animate-bounce hidden sm:block">
            <ArrowBigDown className="w-6 h-6 rotate-45 filter drop-shadow-lg" />
         </div>
      )}
    </div>
  );
};