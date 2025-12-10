import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon, PencilIcon, TrashIcon } from '../../icons';

// --- TYPES ---
type PaymentStatus = 'Pago' | 'Agendado' | 'Falhou';

interface BoletoDetails {
  beneficiary: string;
  amount: number;
  dueDate: string;
  barcode: string;
}

interface PaymentRecord {
  id: string;
  date: string;
  details: BoletoDetails;
  paidFrom: string; // 'Caixa da Empresa' or Consultant Name
  status: PaymentStatus;
}

// --- MOCK DATA ---
const mockPaymentHistory: PaymentRecord[] = [
  {
    id: 'pay1',
    date: '2024-07-28',
    details: { beneficiary: 'Companhia de Luz Exemplo', amount: 150.75, dueDate: '2024-08-05', barcode: '...' },
    paidFrom: 'Caixa da Empresa',
    status: 'Pago',
  },
  {
    id: 'pay2',
    date: '2024-07-27',
    details: { beneficiary: 'Fornecedor de Matéria Prima', amount: 1250.00, dueDate: '2024-07-30', barcode: '...' },
    paidFrom: 'Caixa da Empresa',
    status: 'Pago',
  },
  {
    id: 'pay3',
    date: '2024-07-26',
    details: { beneficiary: 'Plano de Saúde Exemplo', amount: 350.00, dueDate: '2024-07-25', barcode: '...' },
    paidFrom: 'Ana Silva',
    status: 'Falhou',
  },
];

const statusClasses: Record<PaymentStatus, string> = {
  Pago: 'bg-green-600/20 text-green-400',
  Agendado: 'bg-blue-600/20 text-blue-400',
  Falhou: 'bg-red-600/20 text-red-400',
};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 disabled:opacity-50";

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-bold transition-colors rounded-t-lg border-b-2 ${active ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-white'}`}
    >
        {children}
    </button>
);


const WalletPaymentsPage: React.FC = () => {
    // Component State
    const [activeTab, setActiveTab] = useState<'payment' | 'history'>('payment');
    const [history, setHistory] = useState(mockPaymentHistory);
    
    // Form State
    const [barcode, setBarcode] = useState('');
    const [boletoDetails, setBoletoDetails] = useState<BoletoDetails | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<'success' | 'error' | null>(null);

    // Editable Table State
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editableRowData, setEditableRowData] = useState<PaymentRecord | null>(null);


    const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        setBarcode(value);
        if (boletoDetails) {
            setBoletoDetails(null);
            setPaymentResult(null);
            setError(null);
        }
    };

    const handleVerifyBoleto = () => {
        setError(null);
        if (barcode.length < 47) {
            setError('Código de barras inválido. Verifique a numeração.');
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setBoletoDetails({
                beneficiary: 'Beneficiário de Exemplo S/A',
                amount: parseFloat((Math.random() * 500 + 50).toFixed(2)),
                dueDate: '2024-08-15',
                barcode: barcode,
            });
            setIsVerifying(false);
        }, 1500);
    };

    const handleConfirmPayment = () => {
        if (!boletoDetails) return;
        setIsPaying(true);
        setPaymentResult(null);
        setTimeout(() => {
            const success = Math.random() > 0.2;
            if (success) {
                setPaymentResult('success');
                const newRecord: PaymentRecord = {
                    id: `pay${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    details: boletoDetails,
                    paidFrom: 'Caixa da Empresa',
                    status: 'Pago',
                };
                setHistory(prev => [newRecord, ...prev]);
                // Switch to history tab after a short delay to show the success message
                setTimeout(() => {
                    resetForm();
                    setActiveTab('history');
                }, 1500);
            } else {
                setPaymentResult('error');
                setIsPaying(false);
            }
        }, 2000);
    };

    const resetForm = () => {
        setBarcode('');
        setBoletoDetails(null);
        setPaymentResult(null);
        setError(null);
        setIsPaying(false);
    };
    
    // --- Editable Table Handlers ---
    const handleEditClick = (record: PaymentRecord) => {
        setEditingRowId(record.id);
        setEditableRowData(JSON.parse(JSON.stringify(record))); // Deep copy to avoid mutating state directly
    };

    const handleCancelEdit = () => {
        setEditingRowId(null);
        setEditableRowData(null);
    };

    const handleSaveEdit = () => {
        if (!editableRowData) return;
        setHistory(prev => prev.map(item => item.id === editingRowId ? editableRowData : item));
        handleCancelEdit();
    };
    
    const handleEditableDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableRowData(prev => {
            if (!prev) return null;
            // Handle nested details object
            if (['beneficiary', 'amount'].includes(name)) {
                return {
                    ...prev,
                    details: {
                        ...prev.details,
                        [name]: name === 'amount' ? parseFloat(value) : value,
                    },
                };
            }
            return { ...prev, [name]: value as any };
        });
    };
    
     const handleDeleteRow = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este registro de pagamento?")) {
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    };


    const renderPaymentForm = () => (
        <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg">
            <div className="p-6 space-y-4">
                {!paymentResult ? (
                    <>
                        <div>
                            <label htmlFor="barcode" className="block text-sm font-medium text-gray-300 mb-1">Linha Digitável do Boleto</label>
                            <textarea id="barcode" rows={2} value={barcode} onChange={handleBarcodeChange} placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000" className={`${baseInputClasses} font-mono resize-none`} disabled={isVerifying || !!boletoDetails} />
                            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                        </div>
                        {!boletoDetails ? (
                            <button onClick={handleVerifyBoleto} disabled={isVerifying || barcode.length < 47} className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-wait">
                                {isVerifying ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> Verificando...</> : 'Verificar Boleto'}
                            </button>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div className="p-4 bg-gray-900/50 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm"><span className="text-gray-400">Beneficiário:</span><span className="font-semibold text-right">{boletoDetails.beneficiary}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-400">Vencimento:</span><span>{new Date(boletoDetails.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span></div>
                                    <div className="flex justify-between items-baseline text-lg font-bold border-t border-gray-700 pt-2 mt-2"><span className="text-white">Valor a Pagar:</span><span className="text-yellow-400">{boletoDetails.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Pagar com</label>
                                    <select className={baseInputClasses}><option>Caixa da Empresa</option><option disabled>Saldo do Consultor (Em breve)</option></select>
                                </div>
                                <button onClick={handleConfirmPayment} disabled={isPaying} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-wait">
                                    {isPaying ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> Pagando...</> : 'Confirmar Pagamento'}
                                </button>
                            </div>
                        )}
                    </>
                ) : paymentResult === 'success' ? (
                    <div className="text-center py-8 animate-fade-in">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-xl font-bold text-white">Pagamento Realizado!</h3>
                        <p className="text-gray-400 mt-1">Adicionado ao histórico. Mudando de aba...</p>
                    </div>
                ) : (
                    <div className="text-center py-8 animate-fade-in">
                        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
                        <h3 className="mt-4 text-xl font-bold text-white">Falha no Pagamento</h3>
                        <p className="text-gray-400 mt-1">Não foi possível processar. Tente novamente.</p>
                        <button onClick={resetForm} className="mt-6 bg-yellow-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-yellow-600">Tentar Novamente</button>
                    </div>
                )}
            </div>
        </div>
    );
    
     const renderHistoryTable = () => (
        <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                        <tr>
                            <th className="px-4 py-3">Data</th><th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(p => {
                            const isEditing = editingRowId === p.id;
                            const data = isEditing ? editableRowData : p;
                            if (!data) return null;

                            return (
                                <tr key={p.id} className={`border-b border-gray-800 ${isEditing ? 'bg-yellow-500/5' : 'hover:bg-gray-800/50'}`}>
                                    <td className="px-4 py-2">{isEditing ? <input type="date" name="date" value={data.date} onChange={handleEditableDataChange} className={`${baseInputClasses} p-1`} /> : new Date(data.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="px-4 py-2">{isEditing ? <input type="text" name="beneficiary" value={data.details.beneficiary} onChange={handleEditableDataChange} className={`${baseInputClasses} p-1`} /> : data.details.beneficiary}</td>
                                    <td className="px-4 py-2 text-right">{isEditing ? <input type="number" name="amount" value={data.details.amount} onChange={handleEditableDataChange} className={`${baseInputClasses} p-1 text-right`} /> : <span className="font-semibold">{data.details.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>}</td>
                                    <td className="px-4 py-2 text-center">{isEditing ? <select name="status" value={data.status} onChange={handleEditableDataChange} className={`${baseInputClasses} p-1`}><option>Pago</option><option>Agendado</option><option>Falhou</option></select> : <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[data.status]}`}>{data.status}</span>}</td>
                                    <td className="px-4 py-2 text-center">
                                        {isEditing ? (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={handleSaveEdit} className="text-green-400 font-bold hover:text-green-300">Salvar</button>
                                                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white">Cancelar</button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEditClick(p)} className="p-1 text-gray-400 hover:text-yellow-400 transition-colors" title="Editar"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteRow(p.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Excluir"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Pagamento de Contas (Boletos)</h1>
            </header>
            
            <div className="border-b border-gray-800 mb-6">
                <nav className="-mb-px flex space-x-4">
                    <TabButton active={activeTab === 'payment'} onClick={() => setActiveTab('payment')}>Pagar Novo Boleto</TabButton>
                    <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Histórico de Pagamentos</TabButton>
                </nav>
            </div>
            
            <div className="animate-fade-in">
                {activeTab === 'payment' ? renderPaymentForm() : renderHistoryTable()}
            </div>
        </div>
    );
};

export default WalletPaymentsPage;
