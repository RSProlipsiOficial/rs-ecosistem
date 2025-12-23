
import React, { useState } from 'react';
import { Order } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface OrderLookupViewProps {
  orders: Order[];
  onOrderFound: (order: Order) => void;
}

const OrderLookupView: React.FC<OrderLookupViewProps> = ({ orders, onOrderFound }) => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const foundOrder = orders.find(
        o => o.id.toLowerCase() === orderId.toLowerCase().trim() &&
             o.customerEmail.toLowerCase() === email.toLowerCase().trim()
      );
      
      if (foundOrder) {
        onOrderFound(foundOrder);
      } else {
        setError('Pedido não encontrado. Verifique os dados e tente novamente.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-[rgb(var(--color-brand-dark))] py-12">
      <div className="w-full max-w-lg p-8 space-y-8 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gold))]/[.30] rounded-lg shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold text-center font-display text-[rgb(var(--color-brand-gold))]">
            Acompanhe seu Pedido
          </h2>
          <p className="mt-2 text-center text-[rgb(var(--color-brand-text-dim))]">
            Insira os dados abaixo para ver o status da sua entrega.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">Número do Pedido</label>
              <input
                id="orderId"
                name="orderId"
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] rounded-md focus:outline-none focus:ring-[rgb(var(--color-brand-gold))] focus:border-[rgb(var(--color-brand-gold))] sm:text-sm"
                placeholder="Ex: #2024-001"
              />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--color-brand-text-light))] mb-2">E-mail da Compra</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] rounded-md focus:outline-none focus:ring-[rgb(var(--color-brand-gold))] focus:border-[rgb(var(--color-brand-gold))] sm:text-sm"
                placeholder="seuemail@exemplo.com"
              />
            </div>
          </div>

          {error && (
            <p className="text-[rgb(var(--color-error))] text-sm text-center !mt-4">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-[rgb(var(--color-brand-dark))] bg-[rgb(var(--color-brand-gold))] hover:bg-[rgb(var(--color-warning))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-brand-dark))] focus:ring-[rgb(var(--color-brand-gold))] transition-colors mt-6 disabled:opacity-50 disabled:cursor-wait"
            >
                {isLoading ? <SpinnerIcon className="w-5 h-5"/> : <SearchIcon className="w-5 h-5"/>}
              <span className="ml-2">{isLoading ? 'Buscando...' : 'Rastrear Pedido'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderLookupView;
