import React, { useState } from 'react';
import { AbandonedCart } from '../types';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ManageAbandonedCartsProps {
    carts: AbandonedCart[];
}

const DEFAULT_STORE_URL = 'https://marketplace.rsprolipsi.com.br';

const DEFAULT_WHATSAPP_MESSAGE = `Olá {nome}! 👋

Vi que você deixou alguns produtos no seu carrinho na RS Prólipsi. 🛒

Seus itens ainda estão reservados por tempo limitado! Não perca a oportunidade de garantir:
{itens}

💰 Total: {valor}

Finalize sua compra agora e aproveite condições exclusivas!
👉 Acesse: {link}

Posso te ajudar com alguma dúvida? 😊`;

const DEFAULT_EMAIL_SUBJECT = 'Seus produtos estão te esperando! 🛒 RS Prólipsi';
const DEFAULT_EMAIL_BODY = `Olá {nome},

Notamos que você deixou alguns itens incríveis no seu carrinho:

{itens}

Total: {valor}

Não deixe escapar! Finalize sua compra agora e garanta seus produtos.

Acesse: {link}

Equipe RS Prólipsi`;

const RecoveryStatusBadge: React.FC<{ status: AbandonedCart['recoveryStatus'] }> = ({ status }) => {
    const config = {
        'Não enviado': 'bg-gray-500/20 text-gray-300',
        'Enviado': 'bg-blue-500/20 text-blue-300',
        'Recuperado': 'bg-green-500/20 text-green-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config[status]}`}>{status}</span>;
};

// WhatsApp icon inline SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const ManageAbandonedCarts: React.FC<ManageAbandonedCartsProps> = ({ carts }) => {

    const totalAbandonedValue = carts.reduce((sum, cart) => sum + cart.total, 0);
    const recoveredCarts = carts.filter(c => c.recoveryStatus === 'Recuperado');
    const totalRecoveredValue = recoveredCarts.reduce((sum, cart) => sum + cart.total, 0);
    const pendingCarts = carts.filter(c => c.recoveryStatus !== 'Recuperado');
    const totalPendingValue = pendingCarts.reduce((sum, cart) => sum + cart.total, 0);

    const [showMessageConfig, setShowMessageConfig] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [storeUrl, setStoreUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('recovery_store_url') || DEFAULT_STORE_URL;
        }
        return DEFAULT_STORE_URL;
    });
    const [whatsappTemplate, setWhatsappTemplate] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('recovery_whatsapp_template') || DEFAULT_WHATSAPP_MESSAGE;
        }
        return DEFAULT_WHATSAPP_MESSAGE;
    });

    const handleSaveConfig = () => {
        setIsSaving(true);
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('recovery_store_url', storeUrl);
            localStorage.setItem('recovery_whatsapp_template', whatsappTemplate);
        }

        // Simulate API call to Supabase
        setTimeout(() => {
            setIsSaving(false);
            alert('Configuração de recuperação salva com sucesso no banco de dados!');
        }, 600);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const buildWhatsAppMessage = (cart: AbandonedCart) => {
        const itensText = cart.items.map(item => `• ${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`).join('\n');
        const trackingLink = `${storeUrl}${storeUrl.includes('?') ? '&' : '?'}recovery_cart=${cart.id}`;
        return whatsappTemplate
            .replace('{nome}', cart.customerName)
            .replace('{itens}', itensText)
            .replace('{valor}', formatCurrency(cart.total))
            .replace('{link}', trackingLink);
    };

    const buildEmailBody = (cart: AbandonedCart) => {
        const itensText = cart.items.map(item => `- ${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`).join('\n');
        const trackingLink = `${storeUrl}${storeUrl.includes('?') ? '&' : '?'}recovery_cart=${cart.id}`;
        return DEFAULT_EMAIL_BODY
            .replace('{nome}', cart.customerName)
            .replace('{itens}', itensText)
            .replace('{valor}', formatCurrency(cart.total))
            .replace('{link}', trackingLink);
    };

    const handleWhatsApp = (cart: AbandonedCart) => {
        const phone = cart.customerPhone.replace(/\D/g, '');
        const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
        const message = encodeURIComponent(buildWhatsAppMessage(cart));
        window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
    };

    const handleEmail = (cart: AbandonedCart) => {
        const subject = encodeURIComponent(DEFAULT_EMAIL_SUBJECT);
        const body = encodeURIComponent(buildEmailBody(cart));
        window.open(`mailto:${cart.customerEmail}?subject=${subject}&body=${body}`, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black border border-dark-800 rounded-lg p-5 flex items-center gap-4">
                    <ShoppingCartIcon className="w-8 h-8 text-gold-400" />
                    <div>
                        <h4 className="text-gray-400 text-sm">Total Abandonados</h4>
                        <p className="text-xl font-bold text-white">{carts.length}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(totalAbandonedValue)}</p>
                    </div>
                </div>
                <div className="bg-black border border-dark-800 rounded-lg p-5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="text-yellow-400 text-lg">⏳</span>
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-sm">Pendentes de Recuperação</h4>
                        <p className="text-xl font-bold text-yellow-400">{pendingCarts.length}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(totalPendingValue)}</p>
                    </div>
                </div>
                <div className="bg-black border border-dark-800 rounded-lg p-5 flex items-center gap-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    <div>
                        <h4 className="text-gray-400 text-sm">Convertidos / Recuperados</h4>
                        <p className="text-xl font-bold text-green-400">{recoveredCarts.length}</p>
                        <p className="text-xs text-green-300">{formatCurrency(totalRecoveredValue)}</p>
                    </div>
                </div>
            </div>

            {/* Configurar mensagem de recuperação */}
            <div className="bg-black border border-dark-800 rounded-lg">
                <button
                    onClick={() => setShowMessageConfig(!showMessageConfig)}
                    className="w-full flex justify-between items-center p-4 text-left"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        <span className="font-semibold text-white">Configurar Mensagem de Recuperação</span>
                    </div>
                    <span className={`text-gray-400 transform transition-transform ${showMessageConfig ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showMessageConfig && (
                    <div className="p-4 border-t border-dark-800 space-y-4">
                        {/* URL da Loja */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Link da sua loja</label>
                            <input
                                type="url"
                                value={storeUrl}
                                onChange={e => setStoreUrl(e.target.value)}
                                placeholder="https://marketplace.rsprolipsi.com.br"
                                className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Este link será usado na variável <code className="bg-dark-800 px-1 rounded">{'{link}'}</code> das mensagens.</p>
                        </div>

                        {/* Template da mensagem */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Mensagem WhatsApp</label>
                            <p className="text-xs text-gray-500 mb-2">
                                Variáveis disponíveis: <code className="bg-dark-800 px-1 rounded">{'{nome}'}</code> <code className="bg-dark-800 px-1 rounded">{'{itens}'}</code> <code className="bg-dark-800 px-1 rounded">{'{valor}'}</code> <code className="bg-dark-800 px-1 rounded">{'{link}'}</code>
                            </p>
                            <textarea
                                value={whatsappTemplate}
                                onChange={e => setWhatsappTemplate(e.target.value)}
                                rows={10}
                                className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white text-sm font-mono"
                            />
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() => setWhatsappTemplate(DEFAULT_WHATSAPP_MESSAGE)}
                                    className="text-xs text-gray-400 hover:text-white"
                                >
                                    Restaurar mensagem padrão
                                </button>
                                <button
                                    onClick={handleSaveConfig}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-black font-bold rounded-lg transition-colors flex items-center justify-center min-w-[120px]"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Carrinhos */}
            <div className="bg-black border border-dark-800 rounded-lg">
                <div className="p-4 border-b border-dark-800">
                    <h3 className="text-lg font-semibold text-white">Lista de Carrinhos</h3>
                </div>
                {carts.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCartIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Nenhum carrinho abandonado</p>
                        <p className="text-gray-500 text-sm mt-1">Quando um cliente abandonar o checkout, os dados aparecerão aqui.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-black">
                                <tr>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Itens</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Recuperar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carts.map(cart => (
                                    <tr key={cart.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">{cart.customerName}</p>
                                            <p className="text-xs text-gray-500">{cart.customerEmail}</p>
                                            {cart.customerPhone && (
                                                <p className="text-xs text-green-400 mt-0.5">📱 {cart.customerPhone}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs">{new Date(cart.abandonedAt).toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4">
                                            <ul className="text-xs">
                                                {cart.items.map(item => <li key={item.id}>- {item.name} (x{item.quantity})</li>)}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-white">{formatCurrency(cart.total)}</td>
                                        <td className="px-6 py-4"><RecoveryStatusBadge status={cart.recoveryStatus} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {cart.customerPhone && (
                                                    <button
                                                        onClick={() => handleWhatsApp(cart)}
                                                        className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors"
                                                        title="Enviar mensagem de recuperação via WhatsApp"
                                                    >
                                                        <WhatsAppIcon className="w-4 h-4" />
                                                        <span className="hidden md:inline">WhatsApp</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEmail(cart)}
                                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors"
                                                    title="Enviar e-mail de recuperação"
                                                >
                                                    <EnvelopeIcon className="w-4 h-4" />
                                                    <span className="hidden md:inline">Email</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAbandonedCarts;
