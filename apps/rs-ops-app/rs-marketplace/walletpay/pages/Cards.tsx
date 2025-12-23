
import React, { useState, useMemo } from 'react';
import { MOCK_USER_PROFILE, MOCK_LEDGER_ENTRIES } from '../constants';
import { LedgerEntry, LedgerEventType } from '../walletpay-types';
import Modal from '../components/Modal';

// --- Helper Components & Icons ---

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const IconLock = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconUnlock = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>;
const IconEye = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEyeOff = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>;
const IconSliders = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" y1="14" x2="6" y2="14"></line><line x1="10" y1="8" x2="14" y2="8"></line><line x1="18" y1="16" x2="22" y2="16"></line></svg>;
const IconList = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconChip = ({ className = "w-10 h-10" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="6" width="6" height="8" rx="1"></rect><path d="M12 6h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5Z"></path><path d="M3 10h6"></path><path d="M12 10h6"></path><path d="M15 6v8"></path></svg>;

const CardDisplay: React.FC<{ isBlocked: boolean }> = ({ isBlocked }) => (
    <div className="w-full max-w-sm mx-auto aspect-[1.586] bg-gradient-to-br from-card to-surface rounded-2xl p-6 flex flex-col justify-between text-white shadow-custom-lg relative overflow-hidden transition-all duration-300">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full"></div>
        <div className="absolute -bottom-16 -left-12 w-48 h-48 bg-gold/5 rounded-full"></div>
        
        {isBlocked && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 backdrop-blur-sm">
                <div className="text-center">
                    <IconLock className="w-10 h-10 mx-auto text-danger" />
                    <p className="text-2xl font-bold text-danger mt-2 tracking-widest">BLOQUEADO</p>
                </div>
            </div>
        )}

        <div className="flex justify-between items-start z-10">
            <h3 className="font-bold text-xl text-gold">RS WalletPay</h3>
            <IconChip className="text-gold/50" />
        </div>
        
        <div className="z-10">
            <p className="text-2xl font-mono tracking-widest">**** **** **** 1234</p>
        </div>

        <div className="flex justify-between items-end z-10">
            <div>
                <p className="text-xs uppercase text-text-soft">Titular</p>
                <p className="font-semibold">{MOCK_USER_PROFILE.name.toUpperCase()}</p>
                <p className="text-xs text-text-soft">ID: {MOCK_USER_PROFILE.id}</p>
            </div>
            <div>
                <p className="text-xs uppercase text-text-soft">Validade</p>
                <p className="font-semibold">12/28</p>
            </div>
        </div>
    </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; }> = ({ icon, label, onClick, disabled }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className="flex flex-col items-center justify-center gap-2 p-4 bg-card rounded-2xl border border-border hover:bg-surface hover:border-gold transition-all duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border"
    >
        <div className={`p-3 bg-surface rounded-full transition-colors ${disabled ? 'text-text-soft' : 'text-gold'}`}>
            {icon}
        </div>
        <span className="text-sm font-semibold text-text-body">{label}</span>
    </button>
);

const Cards: React.FC = () => {
    const [isCardBlocked, setIsCardBlocked] = useState(false);
    const [modal, setModal] = useState<{ type: 'viewPin' | 'limits' | 'statement' | 'blockConfirm' | null; data?: any }>({ type: null });
    const [showPin, setShowPin] = useState(false);
    const [cardLimits, setCardLimits] = useState({
        transaction: 0,
        daily: 0,
        monthly: 0
    });
    
    const cardPin = "";

    const cardTransactions = useMemo(() => 
        MOCK_LEDGER_ENTRIES.filter(e => e.type === LedgerEventType.PURCHASE), 
    []);
    
    const recentTransactions = useMemo(() => cardTransactions.slice(0, 5), [cardTransactions]);

    const handleCloseModal = () => {
        setModal({ type: null });
        setShowPin(false); // Reset pin visibility on any modal close
    };

    const handleBlockToggle = () => {
        setIsCardBlocked(!isCardBlocked);
        handleCloseModal();
    };

    const handleLimitChange = (limitType: keyof typeof cardLimits, value: string) => {
        const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
        setCardLimits(prev => ({ ...prev, [limitType]: numericValue }));
    };

    const getModalTitle = () => {
        switch (modal.type) {
            case 'blockConfirm': return isCardBlocked ? "Desbloquear Cartão" : "Bloquear Cartão";
            case 'viewPin': return "Senha do Cartão";
            case 'limits': return "Gerenciar Limites";
            case 'statement': return "Extrato do Cartão";
            default: return "";
        }
    };

    const renderModalContent = () => {
        switch (modal.type) {
            case 'blockConfirm':
                return (
                    <div className="text-center">
                        <p className="text-text-body mb-6">
                            {isCardBlocked ? "Você tem certeza que deseja desbloquear seu cartão? Ele poderá ser usado para compras novamente." : "Ao bloquear, seu cartão não poderá ser usado para novas compras até que seja desbloqueado."}
                        </p>
                        <div className="flex gap-4">
                            <button onClick={handleCloseModal} className="w-full py-2 px-4 bg-surface text-text-body hover:bg-border rounded-lg transition-colors">Cancelar</button>
                            <button onClick={handleBlockToggle} className={`w-full py-2 px-4 text-card font-semibold rounded-lg transition-colors ${isCardBlocked ? 'bg-success hover:bg-success/80' : 'bg-danger hover:bg-danger/80'}`}>
                                {isCardBlocked ? "Sim, Desbloquear" : "Sim, Bloquear"}
                            </button>
                        </div>
                    </div>
                );

            case 'viewPin':
                return (
                     <div className="text-center">
                        <p className="text-text-body mb-6">Esta é a senha de 4 dígitos para suas compras presenciais. Mantenha-a segura.</p>
                        <div className="bg-surface p-4 rounded-lg flex items-center justify-center gap-4">
                             <p className="text-4xl font-bold font-mono tracking-[0.5em] text-text-title">
                                {showPin ? cardPin : '****'}
                            </p>
                            <button onClick={() => setShowPin(!showPin)} className="p-2 text-text-body hover:text-gold transition-colors">
                                {showPin ? <IconEyeOff className="w-6 h-6" /> : <IconEye className="w-6 h-6" />}
                            </button>
                        </div>
                         <button onClick={handleCloseModal} className="mt-6 w-full py-3 px-4 bg-gold text-card font-semibold rounded-lg hover:bg-gold-hover transition-colors">
                           Entendido
                        </button>
                    </div>
                );

            case 'limits':
                return (
                    <div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-text-body">Limite por transação</label>
                                <input type="text" value={formatCurrency(cardLimits.transaction)} onChange={(e) => handleLimitChange('transaction', e.target.value)} className="w-full mt-1 px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-body">Limite diário</label>
                                <input type="text" value={formatCurrency(cardLimits.daily)} onChange={(e) => handleLimitChange('daily', e.target.value)} className="w-full mt-1 px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-body">Limite mensal</label>
                                <input type="text" value={formatCurrency(cardLimits.monthly)} onChange={(e) => handleLimitChange('monthly', e.target.value)} className="w-full mt-1 px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                            </div>
                        </div>
                         <button onClick={handleCloseModal} className="mt-6 w-full py-3 px-4 bg-gold text-card font-semibold rounded-lg hover:bg-gold-hover transition-colors">
                           Salvar Limites
                        </button>
                    </div>
                );
                
            case 'statement':
                return (
                     <div>
                        <div className="space-y-2">
                             {cardTransactions.length > 0 ? cardTransactions.map(item => (
                                <div key={item.seq} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface">
                                    <div>
                                        <p className="font-semibold text-text-title">{item.description}</p>
                                        <p className="text-sm text-text-soft">{new Date(item.occurredAt).toLocaleString('pt-BR')}</p>
                                    </div>
                                    <p className="font-bold text-danger">{formatCurrency(item.amount)}</p>
                                </div>
                            )) : (
                                <p className="text-text-soft text-center py-8">Nenhuma transação com cartão encontrada.</p>
                            )}
                        </div>
                    </div>
                );
            default: return null;
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Meus Cartões</h1>
                <p className="text-text-body mt-1">Gerencie seu cartão físico e virtual.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Card and Actions */}
                <div className="space-y-6">
                    <CardDisplay isBlocked={isCardBlocked} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <ActionButton 
                            icon={isCardBlocked ? <IconUnlock className="w-5 h-5" /> : <IconLock className="w-5 h-5" />} 
                            label={isCardBlocked ? "Desbloquear" : "Bloquear"} 
                            onClick={() => setModal({ type: 'blockConfirm' })} 
                        />
                        <ActionButton icon={<IconEye className="w-5 h-5" />} label="Ver Senha" onClick={() => setModal({ type: 'viewPin' })} disabled={isCardBlocked} />
                        <ActionButton icon={<IconSliders className="w-5 h-5" />} label="Limites" onClick={() => setModal({ type: 'limits' })} disabled={isCardBlocked} />
                        <ActionButton icon={<IconList className="w-5 h-5" />} label="Extrato" onClick={() => setModal({ type: 'statement' })} />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                    <h3 className="text-lg font-bold text-text-title mb-4">Atividade Recente do Cartão</h3>
                    <div className="space-y-2">
                        {recentTransactions.length > 0 ? recentTransactions.map(item => (
                            <div key={item.seq} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface">
                                <div>
                                    <p className="font-semibold text-text-title">{item.description}</p>
                                    <p className="text-sm text-text-soft">{new Date(item.occurredAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <p className="font-bold text-danger">{formatCurrency(item.amount)}</p>
                            </div>
                        )) : (
                            <p className="text-text-soft text-center py-8">Nenhuma transação com cartão encontrada.</p>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={!!modal.type} onClose={handleCloseModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default Cards;


