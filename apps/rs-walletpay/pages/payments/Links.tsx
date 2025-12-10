
import React, { useState } from 'react';
import Modal from '../../components/Modal';
import { MOCK_PAYMENT_LINKS } from '../../constants';
import { walletAPI } from '../../src/services/api';
import ActionMenu from '../../components/ActionMenu';

const formatCurrency = (value: number | null) => {
    if (value === null) return "Aberto";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
};

const LinkCard: React.FC<{ link: typeof MOCK_PAYMENT_LINKS[0]; onAction: (action: string, link: any) => void; }> = ({ link, onAction }) => {
    const actions = [
        { label: 'Copiar Link', onClick: () => onAction('copy', link) },
        { label: 'Ver QR Code', onClick: () => onAction('qr', link) },
        { label: link.status === 'active' ? 'Desativar' : 'Ativar', onClick: () => onAction('toggle', link) },
    ];

    return (
        <div className="bg-card p-5 rounded-2xl border border-border flex items-center justify-between gap-4">
            <div className="flex-1">
                <p className="font-bold text-text-title">{link.name}</p>
                <p className={`text-xl font-semibold ${link.amount === null ? 'text-info' : 'text-text-body'}`}>{formatCurrency(link.amount)}</p>
                <div className="flex items-center text-sm text-text-soft mt-2">
                    <span className={`w-2 h-2 rounded-full mr-2 ${link.status === 'active' ? 'bg-success' : 'bg-danger'}`}></span>
                    <span>{link.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                    <span className="mx-2">•</span>
                    <span>Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
            <ActionMenu actions={actions} />
        </div>
    );
};


const Links: React.FC = () => {
    const [links, setLinks] = useState(MOCK_PAYMENT_LINKS);
    const [modal, setModal] = useState<{ type: 'create' | 'share' | null; data: any }>({ type: null, data: null });
    const [isFixedAmount, setIsFixedAmount] = useState(true);

    const handleAction = (action: string, link: any) => {
        if (action === 'copy') {
            navigator.clipboard.writeText(link.url);
            alert('Link copiado!');
        }
        if (action === 'qr') {
            setModal({ type: 'share', data: link });
        }
        if (action === 'toggle') {
            setLinks(prevLinks => prevLinks.map(l => l.id === link.id ? { ...l, status: l.status === 'active' ? 'inactive' : 'active' } : l));
        }
    };

    const handleCreateLink = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userId = localStorage.getItem('userId') || 'demo-user';
        try {
            const name = String(formData.get('name') || 'Link');
            const amountCents = isFixedAmount ? parseInt(String(formData.get('amount') || '').replace(/\D/g, ''), 10) : null;
            const res = await walletAPI.createDeposit({ user_id: userId, amount: amountCents, description: name });
            const url = res?.data?.payment_link || res?.data?.url || `https://rs.wallet/pay/${name.toLowerCase().replace(/\s/g, '-')}`;
            const newLink = {
                id: res?.data?.id || `link_${Date.now()}`,
                name,
                amount: amountCents,
                status: 'active' as 'active' | 'inactive',
                url,
                createdAt: new Date().toISOString()
            };
            setLinks([newLink, ...links]);
            setModal({ type: 'share', data: newLink });
        } catch (err) {
            alert('Falha ao criar link. Usando fallback local.');
            const newLink = {
                id: `link_${Date.now()}`,
                name: String(formData.get('name') || 'Link'),
                amount: isFixedAmount ? parseInt(String(formData.get('amount') || '').replace(/\D/g, ''), 10) : null,
                status: 'active' as 'active' | 'inactive',
                url: `https://rs.wallet/pay/${String(formData.get('name') || 'link').toLowerCase().replace(/\s/g, '-')}`,
                createdAt: new Date().toISOString()
            };
            setLinks([newLink, ...links]);
            setModal({ type: 'share', data: newLink });
        }
    };

    const renderShareModal = () => (
        <div className="text-center">
            <h3 className="text-lg font-bold text-text-title mb-2">Link Gerado com Sucesso!</h3>
            <p className="text-text-soft mb-4">Compartilhe o QR Code ou o link abaixo com seu cliente.</p>
            <div className="flex justify-center my-4">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(modal.data.url)}&bgcolor=1E1E1E&color=E5E7EB&qzone=1`} alt="QR Code" className="rounded-lg border-4 border-surface" />
            </div>
            <div className="relative my-4">
                <input readOnly value={modal.data.url} className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-text-body focus:outline-none" />
                <button onClick={() => { navigator.clipboard.writeText(modal.data.url); alert('Copiado!'); }} className="absolute top-2 right-2 p-2 rounded-md bg-card hover:bg-border transition-colors" title="Copiar link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>
            <button onClick={() => setModal({ type: null, data: null })} className="w-full text-center py-3 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200">
                Fechar
            </button>
        </div>
    );

    const renderCreateModal = () => (
        <form onSubmit={handleCreateLink}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-body mb-2">Nome do Link</label>
                    <input type="text" id="name" name="name" placeholder="Ex: Kit Essencial" required className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                </div>
                <div className="flex gap-2 p-1 bg-surface rounded-lg">
                    <button type="button" onClick={() => setIsFixedAmount(true)} className={`w-full py-2 rounded-md text-sm font-semibold transition-colors ${isFixedAmount ? 'bg-card' : 'hover:bg-border'}`}>Valor Fixo</button>
                    <button type="button" onClick={() => setIsFixedAmount(false)} className={`w-full py-2 rounded-md text-sm font-semibold transition-colors ${!isFixedAmount ? 'bg-card' : 'hover:bg-border'}`}>Valor Aberto</button>
                </div>
                {isFixedAmount && (
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-text-body mb-2">Valor</label>
                        <input type="text" id="amount" name="amount" placeholder="R$ 0,00" required className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                    </div>
                )}
            </div>
            <button type="submit" className="mt-6 w-full text-center py-3 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200">
                Criar Link
            </button>
        </form>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-text-title">Meus Links de Pagamento</h2>
                    <p className="text-text-soft mt-1">Crie e gerencie links para receber pagamentos de seus clientes.</p>
                </div>
                <button onClick={() => setModal({ type: 'create', data: null })} className="w-full sm:w-auto text-center py-2 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap">
                    Criar Novo Link
                </button>
            </div>
            <div className="space-y-4">
                {links.map(link => <LinkCard key={link.id} link={link} onAction={handleAction} />)}
            </div>

            <Modal isOpen={!!modal.type} onClose={() => setModal({ type: null, data: null })} title={modal.type === 'create' ? 'Novo Link de Pagamento' : 'Compartilhar Link'}>
                {modal.type === 'create' && renderCreateModal()}
                {modal.type === 'share' && renderShareModal()}
            </Modal>
        </div>
    );
};

export default Links;
