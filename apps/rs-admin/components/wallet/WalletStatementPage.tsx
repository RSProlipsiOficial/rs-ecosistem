import React, { useState, useEffect } from 'react';
import { walletAPI } from '../../src/services/api';
import { ClipboardDocumentListIcon, CloseIcon, WhatsAppIcon, UsersIcon } from '../icons';
import type { Consultant } from '../../types';
import ConsultantDetailModal from '../ConsultantDetailModal';

// --- TYPES AND MOCK DATA ---
// A more detailed consultant type for our mock data
interface DetailedConsultant extends Consultant {
    upline: number | null; // ID of the sponsor
}

type CommissionStatus = 'Pago' | 'Pendente' | 'Estornado';
type CommissionSourceType = 'Venda de Produto' | 'Bônus de Ciclo' | 'Bônus de Fidelidade' | 'Bônus de Carreira' | 'Bônus Top SIGME';

// Represents a single commission payment to one person
interface CommissionEntry {
    id: string; // Unique ID for this specific commission entry (e.g., eventId + recipientId)
    eventId: string; // Groups all commissions from the same event
    date: string;
    sourceType: CommissionSourceType;
    sourceDescription: string; // e.g., "Matriz 1 (2x5)", "PIN Ouro", "Pedido #12345"
    
    // Details about the origin of the event
    origin: {
        consultant: DetailedConsultant; // The consultant who made the purchase or completed a cycle
        consultantDepth: number;
        product?: {
            sku: string;
            name: string;
            value: number;
        };
    };

    // This specific line in the report is for one recipient
    recipient: DetailedConsultant;
    commissionAmount: number;
    recipientLevel: number; // What level this recipient is in the upline from the origin consultant.
    status: CommissionStatus;
    
    // Summary of the entire payout for this single event (shared across all entries with the same eventId)
    payoutSummary: {
        totalCommissionPaid: number;
        levelsPaid: number;
        recipients: {
            consultant: DetailedConsultant;
            level: number;
            amount: number;
        }[];
    };
}

// Cleared mock data
const mockCommissionEntries: CommissionEntry[] = [];

// --- COMPONENTS ---
const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";
const statusClasses: Record<CommissionStatus, string> = {
  'Pago': 'bg-green-600/20 text-green-400',
  'Pendente': 'bg-yellow-500/20 text-yellow-400',
  'Estornado': 'bg-red-600/20 text-red-400',
};

const PayoutDetailsModal: React.FC<{ event: CommissionEntry | null, onClose: () => void }> = ({ event, onClose }) => {
    if (!event) return null;

    const { origin, sourceType, sourceDescription, payoutSummary, product } = event;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Detalhes do Evento de Comissão</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-4">
                    <div className="p-4 bg-black/50 rounded-lg">
                        <h3 className="font-semibold text-yellow-500 mb-2">Origem do Evento</h3>
                        <p><strong className="text-gray-400">Tipo:</strong> {sourceType}</p>
                        <p><strong className="text-gray-400">Descrição:</strong> {sourceDescription}</p>
                        <p><strong className="text-gray-400">Gerado por:</strong> {origin.consultant.name} (ID: {origin.consultant.id})</p>
                        <p><strong className="text-gray-400">Profundidade na Rede:</strong> Nível {origin.consultantDepth}</p>
                        {origin.product && (
                             <div className="mt-2 pt-2 border-t border-gray-700">
                                <p><strong className="text-gray-400">Produto:</strong> {origin.product.name} (SKU: {origin.product.sku})</p>
                                <p><strong className="text-gray-400">Valor do Produto:</strong> {origin.product.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                             </div>
                        )}
                    </div>
                     <div className="p-4 bg-black/50 rounded-lg">
                        <h3 className="font-semibold text-yellow-500 mb-2">Distribuição de Bônus</h3>
                        <p><strong className="text-gray-400">Comissão Total Gerada:</strong> <span className="font-bold text-green-400">{payoutSummary.totalCommissionPaid.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                        <p><strong className="text-gray-400">Níveis de Upline Pagos:</strong> {payoutSummary.levelsPaid}</p>
                         <ul className="mt-2 space-y-1 text-sm">
                            {payoutSummary.recipients.map(r => (
                                <li key={r.consultant.id} className="flex justify-between p-2 rounded bg-gray-800/50">
                                    <span><strong className="text-gray-400">Nível {r.level}:</strong> {r.consultant.name}</span>
                                    <span className="font-semibold">{r.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">Nota: A distribuição considera a compressão dinâmica, se aplicável.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};


const WalletStatementPage: React.FC = () => {
    const [transactions, setTransactions] = useState(mockCommissionEntries);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [entries] = useState<CommissionEntry[]>(mockCommissionEntries);
    const [isConsultantModalOpen, setConsultantModalOpen] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CommissionEntry | null>(null);

    useEffect(() => { loadTransactions(); }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const res = await walletAPI.getAllTransactions();
            if (res?.data?.success) setTransactions(res.data.transactions || mockCommissionEntries);
        } catch (err) {
            setError('Erro ao carregar extrato');
        } finally {
            setLoading(false);
        }
    };

    const openConsultantModal = (consultant: Consultant) => {
        setSelectedConsultant(consultant);
        setConsultantModalOpen(true);
    };
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <ClipboardDocumentListIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Extrato Financeiro e Relatório de Comissões</h1>
            </header>

            <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <input type="text" placeholder="Buscar por consultor, pedido, SKU..." className={baseInputClasses} />
                    <select className={baseInputClasses}><option>Todos os Bônus</option><option>Venda de Produto</option><option>Bônus de Ciclo</option><option>Bônus de Carreira</option></select>
                    <div className="flex items-center gap-2">
                        <input type="date" className={baseInputClasses} />
                        <span className="text-gray-400">a</span>
                        <input type="date" className={baseInputClasses} />
                    </div>
                    <button className="bg-yellow-500 text-black font-bold py-2.5 px-5 rounded-lg hover:bg-yellow-600 transition-colors w-full">Filtrar</button>
                </div>
            </div>

            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-4 py-4">Data</th>
                                <th className="px-4 py-4">Descrição / Origem</th>
                                <th className="px-4 py-4">Gerador da Comissão</th>
                                <th className="px-4 py-4">Recebedor da Comissão</th>
                                <th className="px-4 py-4 text-center">Nível</th>
                                <th className="px-4 py-4 text-right">Valor (R$)</th>
                                <th className="px-4 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length > 0 ? entries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(entry.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{entry.sourceType}</p>
                                        <p className="text-xs text-gray-400">{entry.sourceDescription} {entry.origin.product ? `(${entry.origin.product.sku})` : ''}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <a href="#" onClick={(e) => {e.preventDefault(); openConsultantModal(entry.origin.consultant);}} className="hover:text-yellow-400 transition-colors">{entry.origin.consultant.name}</a>
                                        <p className="text-xs text-gray-400">Profundidade: Nível {entry.origin.consultantDepth}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <a href="#" onClick={(e) => {e.preventDefault(); openConsultantModal(entry.recipient);}} className="font-semibold hover:text-yellow-400 transition-colors">{entry.recipient.name}</a>
                                            <a href={`https://wa.me/${entry.recipient.contact.phone}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400">
                                                <WhatsAppIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <p className="text-xs text-gray-400">ID: {entry.recipient.id}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">{entry.recipientLevel}</td>
                                    <td className={`px-4 py-3 text-right font-semibold text-green-400`}>
                                        {entry.commissionAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                         <button onClick={() => setSelectedEvent(entry)} className="font-medium text-yellow-500 hover:text-yellow-400 transition-colors">Ver Detalhes</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">Nenhum registro de comissão encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isConsultantModalOpen && (
                <ConsultantDetailModal 
                    isOpen={isConsultantModalOpen}
                    consultant={selectedConsultant}
                    onClose={() => setConsultantModalOpen(false)}
                    onSave={() => setConsultantModalOpen(false)} // Read-only for this view
                />
            )}

            <PayoutDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
    );
};

export default WalletStatementPage;