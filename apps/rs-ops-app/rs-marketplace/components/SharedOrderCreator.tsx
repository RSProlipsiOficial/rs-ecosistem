import React, { useState } from 'react';
import { ShippingAddress, View } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface SharedOrderCreatorProps {
    currentCustomer: any;
    onBack: () => void;
    onCreateSharedOrder: (address: ShippingAddress, expiresInHours: number) => Promise<{ id: string; shareLink: string }>;
}

const SharedOrderCreator: React.FC<SharedOrderCreatorProps> = ({ currentCustomer, onBack, onCreateSharedOrder }) => {
    const [formData, setFormData] = useState<ShippingAddress>({
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    });
    const [expiresInHours, setExpiresInHours] = useState<number>(24);
    const [isLoading, setIsLoading] = useState(false);
    const [shareLink, setShareLink] = useState<string>('');
    const [linkCopied, setLinkCopied] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
            } else {
                alert('CEP não encontrado.');
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleCreateSharedOrder = async () => {
        if (!formData.zipCode || !formData.street || !formData.number || !formData.city || !formData.state) {
            alert('Por favor, preencha todos os campos obrigatórios do endereço.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await onCreateSharedOrder(formData, expiresInHours);
            setShareLink(result.shareLink);
        } catch (error) {
            console.error('Erro ao criar pedido compartilhado:', error);
            alert('Erro ao criar pedido compartilhado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    if (shareLink) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-8 border border-[rgb(var(--color-brand-gold))]">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[rgb(var(--color-brand-gold))] mb-2">
                            Pedido Compartilhado Criado!
                        </h2>
                        <p className="text-[rgb(var(--color-brand-text-dim))]">
                            Compartilhe o link abaixo com sua equipe
                        </p>
                    </div>

                    <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg mb-4">
                        <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mb-2">Link do Pedido:</p>
                        <p className="text-sm text-[rgb(var(--color-brand-text-light))] break-all">{shareLink}</p>
                    </div>

                    <button 
                        onClick={handleCopyLink}
                        className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 rounded-md hover:bg-gold-400 flex items-center justify-center gap-2 mb-4"
                    >
                        {linkCopied ? (
                            <>
                                <ClipboardDocumentCheckIcon className="w-5 h-5"/>
                                Link Copiado!
                            </>
                        ) : (
                            <>
                                <CopyIcon className="w-5 h-5"/>
                                Copiar Link
                            </>
                        )}
                    </button>

                    <div className="text-center text-sm text-[rgb(var(--color-brand-text-dim))] space-y-2">
                        <p>⏰ Válido por {expiresInHours} horas</p>
                        <p>📦 Todos os pedidos serão entregues no mesmo endereço</p>
                        <p>💰 Cada pessoa paga apenas sua parte</p>
                    </div>

                    <button 
                        onClick={onBack}
                        className="w-full mt-6 bg-[rgb(var(--color-brand-gray-light))] text-[rgb(var(--color-brand-text-light))] font-semibold py-3 rounded-md hover:bg-gray-600"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))] mb-6"
            >
                <ArrowLeftIcon className="w-4 h-4"/>
                Voltar
            </button>

            <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <UserGroupIcon className="w-8 h-8 text-[rgb(var(--color-brand-gold))]"/>
                    <div>
                        <h1 className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))]">
                            Criar Pedido Compartilhado
                        </h1>
                        <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">
                            Sua equipe faz pedidos separados, entrega em um único endereço
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Informações do Coordenador */}
                    <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg">
                        <p className="text-sm text-[rgb(var(--color-brand-text-dim))] mb-1">Coordenador:</p>
                        <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">{currentCustomer?.name || 'Você'}</p>
                    </div>

                    {/* Endereço de Entrega */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPinIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]"/>
                            <h3 className="text-lg font-semibold">Endereço de Entrega Único</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    onBlur={handleCepBlur}
                                    placeholder="CEP"
                                    className="col-span-1 bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                                />
                            </div>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                placeholder="Rua"
                                className="bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    placeholder="Número"
                                    className="bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                                />
                                <input
                                    type="text"
                                    name="complement"
                                    value={formData.complement}
                                    onChange={handleInputChange}
                                    placeholder="Complemento (opcional)"
                                    className="bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                                />
                            </div>
                            <input
                                type="text"
                                name="neighborhood"
                                value={formData.neighborhood}
                                onChange={handleInputChange}
                                placeholder="Bairro"
                                className="bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Cidade"
                                    className="bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                                />
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="Estado"
                                    maxLength={2}
                                    className="bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Validade do Link */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Validade do Link</label>
                        <select
                            value={expiresInHours}
                            onChange={(e) => setExpiresInHours(Number(e.target.value))}
                            className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                        >
                            <option value={12}>12 horas</option>
                            <option value={24}>24 horas (1 dia)</option>
                            <option value={48}>48 horas (2 dias)</option>
                            <option value={72}>72 horas (3 dias)</option>
                            <option value={168}>1 semana</option>
                        </select>
                    </div>

                    {/* Como Funciona */}
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-400 mb-2">Como funciona:</h4>
                        <ul className="space-y-2 text-sm text-[rgb(var(--color-brand-text-dim))]">
                            <li>✓ Você cria o pedido e recebe um link único</li>
                            <li>✓ Compartilha o link com sua equipe</li>
                            <li>✓ Cada pessoa escolhe seus produtos</li>
                            <li>✓ Cada um paga apenas sua parte</li>
                            <li>✓ Todos os produtos são entregues no mesmo endereço</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleCreateSharedOrder}
                        disabled={isLoading}
                        className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 rounded-md hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:bg-[rgb(var(--color-brand-gray-light))] disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="w-5 h-5"/>
                                Criando...
                            </>
                        ) : (
                            <>
                                <ShareIcon className="w-5 h-5"/>
                                Criar Pedido Compartilhado
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharedOrderCreator;
