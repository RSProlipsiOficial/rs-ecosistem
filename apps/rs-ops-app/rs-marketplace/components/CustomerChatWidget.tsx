

import React, { useState } from 'react';
import { Order } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';

interface CustomerChatWidgetProps {
    orders: Order[];
}

const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({ orders }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [message, setMessage] = useState('Olá! Para rastrear seu pedido, por favor, insira o número do pedido abaixo (ex: #2024-001).');
    const [searched, setSearched] = useState(false);

    const handleSearch = () => {
        setSearched(true);
        const foundOrder = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
        if (foundOrder) {
            if (foundOrder.trackingCode) {
                setMessage(`Pedido encontrado! Seu código de rastreamento é: ${foundOrder.trackingCode}`);
            } else {
                setMessage('Seu pedido foi encontrado, mas o código de rastreamento ainda não está disponível. Por favor, tente novamente mais tarde.');
            }
        } else {
            setMessage('Pedido não encontrado. Por favor, verifique o número e tente novamente.');
        }
    };
    
    const handleReset = () => {
        setOrderId('');
        setSearched(false);
        setMessage('Olá! Para rastrear seu pedido, por favor, insira o número do pedido abaixo (ex: #2024-001).');
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-30 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] p-4 rounded-full shadow-lg hover:bg-[rgb(var(--color-brand-secondary))] transition-all transform hover:scale-110"
                aria-label="Abrir chat de rastreamento"
            >
                <ChatIcon className="h-8 w-8" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 z-30 w-80 h-[400px] bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gold))]/[0.30] rounded-lg shadow-2xl flex flex-col font-sans">
            <header className="flex-1/2 flex items-center justify-between p-3 bg-[rgb(var(--color-brand-gray))]/[.50] border-b border-[rgb(var(--color-brand-gray-light))]">
                <h3 className="font-bold text-[rgb(var(--color-brand-text-light))]">Rastrear Pedido</h3>
                <button onClick={() => setIsOpen(false)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto text-sm">
                <div className="bg-[rgb(var(--color-brand-gray))] p-3 rounded-lg text-[rgb(var(--color-brand-text-light))]">
                   <p>{message}</p>
                </div>
                {searched && (
                    <div className="text-center mt-2">
                         <button onClick={handleReset} className="text-xs text-[rgb(var(--color-brand-gold))] hover:underline">Fazer nova consulta</button>
                    </div>
                )}
            </div>
            <footer className="flex-shrink-0 p-3 border-t border-[rgb(var(--color-brand-gray-light))]">
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Nº do pedido..."
                        disabled={searched}
                        className="flex-1 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-full py-2 px-4 text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))] disabled:opacity-50"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={searched}
                        className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] p-2 rounded-full hover:bg-[rgb(var(--color-brand-secondary))] disabled:bg-[rgb(var(--color-brand-gray-light))]"
                        aria-label="Buscar pedido"
                    >
                        <SearchIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CustomerChatWidget;
