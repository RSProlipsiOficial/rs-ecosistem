import React, { useState, useEffect } from 'react';
import { walletAPI } from '../../src/services/api';
import { PaperAirplaneIcon, CogIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, WhatsAppIcon, CloseIcon } from '../icons';
import type { Consultant } from '../../types';
import ConsultantDetailModal from '../ConsultantDetailModal';

// --- TYPES AND MOCK DATA ---

type WithdrawalStatus = 'Pendente' | 'Pago' | 'Recusado';
type PixKeyType = 'CPF' | 'Email' | 'Telefone' | 'Aleatória';

interface WithdrawalRequest {
    id: string;
    consultant: Consultant;
    amount: number;
    pixKeyType: PixKeyType;
    pixKey: string;
    requestDate: string;
    status: WithdrawalStatus;
}

// Cleared mock data
const mockConsultantsForPage: Consultant[] = [];
const mockWithdrawalRequests: WithdrawalRequest[] = [];

const statusClasses: Record<WithdrawalStatus, string> = {
  'Pendente': 'bg-yellow-500/20 text-yellow-400',
  'Pago': 'bg-green-600/20 text-green-400',
  'Recusado': 'bg-red-600/20 text-red-400',
};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

const validatePixKey = (request: WithdrawalRequest): boolean => {
    const { consultant, pixKeyType, pixKey } = request;
    if (!consultant) return false;
    switch (pixKeyType) {
        case 'CPF': return consultant.cpfCnpj.replace(/\D/g, '') === pixKey.replace(/\D/g, '');
        case 'Email': return consultant.contact.email.toLowerCase() === pixKey.toLowerCase();
        case 'Telefone': return consultant.contact.phone.replace(/\D/g, '') === pixKey.replace(/\D/g, '');
        default: return true; // Aleatória keys can't be validated against data
    }
};

const ActionModal: React.FC<{
    request: WithdrawalRequest | null;
    onClose: () => void;
    onConfirm: (id: string, newStatus: WithdrawalStatus) => void;
}> = ({ request, onClose, onConfirm }) => {
    if (!request) return null;

    const handleConfirm = (newStatus: WithdrawalStatus) => {
        onConfirm(request.id, newStatus);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Gerenciar Solicitação</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-400">Consultor</p>
                        <p className="text-lg font-semibold text-white">{request.consultant.name}</p>
                        <p className="text-sm text-gray-500">ID: {request.consultant.id}</p>
                    </div>
                    <div className="p-3 bg-black/50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Valor Solicitado:</span><span className="font-bold text-lg text-yellow-400">{request.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Chave PIX:</span><span className="font-mono text-xs">{request.pixKey}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Tipo:</span><span>{request.pixKeyType}</span></div>
                    </div>
                     <p className="text-sm text-center text-gray-300">Selecione uma ação para esta solicitação.</p>
                </main>
                <footer className="p-4 grid grid-cols-2 gap-3 bg-black/50 border-t border-gray-700 rounded-b-2xl">
                    <button onClick={() => handleConfirm('Recusado')} className="w-full bg-red-600/80 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors">Recusar Saque</button>
                    <button onClick={() => handleConfirm('Pago')} className="w-full bg-green-600/80 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">Aprovar Pagamento</button>
                </footer>
            </div>
        </div>
    );
};


const WalletTransfersPage: React.FC = () => {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [requests, setRequests] = useState(mockWithdrawalRequests);
    const [modalRequest, setModalRequest] = useState<WithdrawalRequest | null>(null);
    const [isConsultantModalOpen, setConsultantModalOpen] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

    useEffect(() => { loadTransfers(); }, []);

    const loadTransfers = async () => {
        try {
            setLoading(true);
            const res = await walletAPI.getAllTransfers();
            if (res?.data?.success) setTransfers(res.data.transfers || []);
        } catch (err) {
            setError('Erro ao carregar transferências');
        } finally {
            setLoading(false);
        }
    };

    const openConsultantModal = (consultant: Consultant) => {
        setSelectedConsultant(consultant);
        setConsultantModalOpen(true);
    };
    
    const closeConsultantModal = () => {
        setConsultantModalOpen(false);
        setSelectedConsultant(null);
    };

    const handleConsultantSave = (updatedConsultant: Consultant) => {
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.consultant.id === updatedConsultant.id 
                    ? { ...req, consultant: updatedConsultant } 
                    : req
            )
        );
        closeConsultantModal();
    };
    
    const handleAction = (id: string, newStatus: WithdrawalStatus) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <PaperAirplaneIcon className="w-8 h-8 text-yellow-500 -rotate-45" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Gestão de Transferências e Saques</h1>
            </header>

            <div className="space-y-8">
                {/* Admin Transfer Form */}
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg">
                    <header className="p-4 bg-black/30 border-b border-gray-800"><h2 className="text-xl font-semibold text-white">Transferência Manual (Crédito/Débito)</h2></header>
                    <div className="p-6 space-y-4">
                        <div><label className="block text-xs font-medium text-gray-400 mb-1">Consultor (ID ou Nome)</label><input type="text" placeholder="Buscar..." className={baseInputClasses} /></div>
                        <div><label className="block text-xs font-medium text-gray-400 mb-1">Valor (R$)</label><input type="number" placeholder="0,00" className={baseInputClasses} /></div>
                        <div><label className="block text-xs font-medium text-gray-400 mb-1">Tipo</label><select className={baseInputClasses}><option>Crédito (Adicionar Saldo)</option><option>Débito (Remover Saldo)</option></select></div>
                        <div><label className="block text-xs font-medium text-gray-400 mb-1">Motivo/Descrição</label><input type="text" placeholder="Ex: Adiantamento de bônus..." className={baseInputClasses} /></div>
                        <button className="bg-yellow-500 text-black font-bold py-2.5 px-5 rounded-lg hover:bg-yellow-600 transition-colors w-full">Confirmar Transação</button>
                    </div>
                </div>

                {/* Withdrawal Requests Table */}
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                     <header className="flex items-center justify-between p-4 bg-black/30 border-b border-gray-800">
                        <h2 className="text-xl font-semibold text-white">Solicitações de Saque</h2>
                         <button className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm">Processar Lote</button>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                                <tr>
                                    <th className="px-4 py-4">Consultor</th>
                                    <th className="px-4 py-4">Chave PIX</th>
                                    <th className="px-4 py-4">Validação PIX</th>
                                    <th className="px-4 py-4 text-right">Valor (R$)</th>
                                    <th className="px-4 py-4 text-center">Status</th>
                                    <th className="px-4 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length > 0 ? requests.map(req => {
                                    const isPixValid = validatePixKey(req);
                                    return (
                                        <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={req.consultant.avatar} alt={req.consultant.name} className="w-10 h-10 rounded-full object-cover" />
                                                    <div>
                                                        <div className="font-semibold text-white flex items-center">
                                                            <button onClick={() => openConsultantModal(req.consultant)} className="hover:text-yellow-400 hover:underline transition-colors cursor-pointer text-left">
                                                                {req.consultant.name}
                                                            </button>
                                                            <a href={`https://wa.me/${req.consultant.contact.phone}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-green-500 hover:text-green-400">
                                                                <WhatsAppIcon className="w-5 h-5" />
                                                            </a>
                                                        </div>
                                                        <p className="text-xs text-gray-400">ID: {req.consultant.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-mono text-xs">{req.pixKey}</p>
                                                <p className="text-xs text-gray-500">{req.pixKeyType}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isPixValid ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
                                                        <CheckCircleIcon className="w-4 h-4" /> Verificado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400">
                                                        <ExclamationTriangleIcon className="w-4 h-4" /> Inconsistente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-lg">{req.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[req.status]}`}>{req.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {req.status === 'Pendente' ? (
                                                     <button onClick={() => setModalRequest(req)} className="font-medium text-yellow-500 hover:text-yellow-400 transition-colors">
                                                        Gerenciar
                                                    </button>
                                                ) : <span className="text-gray-500">-</span>}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-500">Nenhuma solicitação de saque.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <p className="text-sm text-yellow-300">
                    <strong className="font-semibold">Lembrete de Segurança:</strong> O sistema bloqueia a aprovação de saques para chaves PIX que não correspondem aos dados cadastrais do consultor. Instrua sua equipe a manter os dados sempre atualizados.
                </p>
            </div>

            <ActionModal request={modalRequest} onClose={() => setModalRequest(null)} onConfirm={handleAction} />

            <ConsultantDetailModal
                isOpen={isConsultantModalOpen}
                consultant={selectedConsultant}
                onClose={closeConsultantModal}
                onSave={handleConsultantSave}
            />
        </div>
    );
};

export default WalletTransfersPage;