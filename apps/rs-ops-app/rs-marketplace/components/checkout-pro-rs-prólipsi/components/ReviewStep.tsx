import React from 'react';
import { User, MapPin, Truck, Edit } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { CheckoutStep } from '../types';
import { Button } from './ui/Button';

export const ReviewStep: React.FC = () => {
    const { customer, selectedShippingQuote, setStep, product } = useCheckout();
    const isPhysical = product.type === 'PHYSICAL';

    const handleEdit = () => {
        setStep(CheckoutStep.IDENTIFICATION);
    };

    return (
        <div className="bg-rs-card p-6 md:p-8 rounded-2xl border border-rs-border space-y-8 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-rs-border pb-6">
                <h2 className="text-xl font-semibold text-rs-text flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rs-gold text-rs-dark text-sm font-bold shadow-[0_0_10px_rgba(200,167,78,0.3)]">2</span>
                    Revisão e Confirmação
                </h2>
            </div>

            <div className="space-y-6">
                {/* Personal Data Section */}
                <div className="p-4 bg-[#161920] rounded-lg border border-rs-border/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-rs-text uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4 text-rs-gold" /> Dados Pessoais</h3>
                        <button onClick={handleEdit} className="text-xs flex items-center gap-1 text-rs-muted hover:text-rs-gold transition-colors"><Edit className="w-3 h-3" /> Editar</button>
                    </div>
                    <div className="text-sm text-rs-muted space-y-2 text-left">
                        <p><strong className="text-rs-text/80 font-medium">Nome:</strong> {customer.name}</p>
                        <p><strong className="text-rs-text/80 font-medium">E-mail:</strong> {customer.email}</p>
                        <p><strong className="text-rs-text/80 font-medium">CPF:</strong> {customer.cpf}</p>
                    </div>
                </div>

                {/* Shipping Address Section */}
                {isPhysical && customer.address && (
                    <div className="p-4 bg-[#161920] rounded-lg border border-rs-border/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-rs-text uppercase tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4 text-rs-gold" /> Endereço de Entrega</h3>
                            <button onClick={handleEdit} className="text-xs flex items-center gap-1 text-rs-muted hover:text-rs-gold transition-colors"><Edit className="w-3 h-3" /> Editar</button>
                        </div>
                        <div className="text-sm text-rs-muted space-y-1 text-left">
                            <p>{customer.address.street}, {customer.address.number}{customer.address.complement ? ` - ${customer.address.complement}` : ''}</p>
                            <p>{customer.address.neighborhood}, {customer.address.city} - {customer.address.state}</p>
                            <p className="font-bold">{customer.address.zipCode}</p>
                        </div>
                    </div>
                )}
                
                {/* Shipping Method Section */}
                {isPhysical && selectedShippingQuote && (
                     <div className="p-4 bg-[#161920] rounded-lg border border-rs-border/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-rs-text uppercase tracking-wider flex items-center gap-2"><Truck className="w-4 h-4 text-rs-gold" /> Método de Envio</h3>
                             <button onClick={handleEdit} className="text-xs flex items-center gap-1 text-rs-muted hover:text-rs-gold transition-colors"><Edit className="w-3 h-3" /> Editar</button>
                        </div>
                        <div className="flex justify-between items-center text-sm text-rs-muted">
                            <div>
                                <p className="font-bold text-rs-text">{selectedShippingQuote.name}</p>
                                <p className="text-xs capitalize">{selectedShippingQuote.arrivalDate}</p>
                            </div>
                            <p className="font-mono font-bold text-rs-text">R$ {selectedShippingQuote.price.toFixed(2)}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-rs-border/50">
                <Button fullWidth onClick={() => setStep(CheckoutStep.PAYMENT)} className="py-4 text-base font-extrabold tracking-wide uppercase">
                    Confirmar e Ir para Pagamento
                </Button>
            </div>
        </div>
    );
};