
import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Package, Search, Filter, Eye, X, Calendar, DollarSign, Clock, Truck, ChevronRight } from 'lucide-react';

interface ReplenishmentOrdersProps {
    cdId: string;
}

const ReplenishmentOrders: React.FC<ReplenishmentOrdersProps> = ({ cdId }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // Form states for Payment Proof
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentProofBase64, setPaymentProofBase64] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('PIX');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        const data = await dataService.getReplenishmentOrders(cdId);
        setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, [cdId]);

    const handleUploadProof = async () => {
        if (!paymentProofBase64 || !selectedOrder) {
            alert('Por favor, selecione um arquivo de comprovante.');
            return;
        }
        setIsSubmitting(true);
        const success = await dataService.uploadPaymentProof(selectedOrder.id, paymentProofBase64, paymentMethod);
        if (success) {
            alert('Comprovante enviado com sucesso!');
            setIsPaymentModalOpen(false);
            setPaymentProofBase64(null);
            setSelectedOrder(null);
            await loadOrders();
        } else {
            alert('Erro ao enviar comprovante. Tente novamente.');
        }
        setIsSubmitting(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProofBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const openProof = (url: string) => {
        if (!url) return;
        if (url.startsWith('data:')) {
            try {
                const [meta, data] = url.split(',');
                const mimeMatch = meta.match(/data:([^;]+)/);
                const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
                const byteChars = atob(data);
                const byteArrays: Uint8Array[] = [];
                for (let i = 0; i < byteChars.length; i += 512) {
                    const slice = byteChars.slice(i, i + 512);
                    const bytes = new Uint8Array(slice.length);
                    for (let j = 0; j < slice.length; j++) bytes[j] = slice.charCodeAt(j);
                    byteArrays.push(bytes);
                }
                const blob = new Blob(byteArrays, { type: mime });
                window.open(URL.createObjectURL(blob), '_blank');
            } catch {
                window.open(url, '_blank');
            }
        } else {
            window.open(url, '_blank');
        }
    };

    const handleConfirmDelivery = async () => {
        if (!selectedOrder) return;
        if (confirm('Confirma o recebimento deste pedido?')) {
            setIsSubmitting(true);
            const success = await dataService.completeOrder(selectedOrder.id);
            if (success) {
                alert('Recebimento confirmado!');
                setSelectedOrder(null);
                await loadOrders();
            }
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDENTE':
            case 'PAGAMENTO PENDENTE':
            case 'PENDENTE PAGAMENTO':
            case 'AGUARDANDO PAGAMENTO': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
            case 'COMPROVANTE ENVIADO': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
            case 'PAGO': return 'bg-green-500/20 text-green-500 border-green-500/20';
            case 'EM SEPARAÇÃO': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
            case 'ENVIADO':
            case 'SAIU PARA ENTREGA': return 'bg-purple-500/20 text-purple-500 border-purple-500/20';
            case 'ENTREGUE': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
            case 'CANCELADO': return 'bg-red-500/20 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
        }
    };

    const getTrackingSteps = (status: string) => {
        const defaultSteps = [
            { label: 'Pedido Realizado', completed: true },
            { label: 'Pagamento Aprovado', completed: false },
            { label: 'Em Separação', completed: false },
            { label: 'Em Transporte', completed: false },
            { label: 'Entregue', completed: false }
        ];

        const s = status.toUpperCase();
        if (s === 'CANCELADO') return [{ label: 'Pedido Cancelado', completed: true, isError: true }];

        if (s === 'PAGO' || s === 'EM SEPARAÇÃO' || s === 'ENVIADO' || s === 'SAIU PARA ENTREGA' || s === 'ENTREGUE') {
            defaultSteps[1].completed = true;
        }
        if (s === 'EM SEPARAÇÃO' || s === 'ENVIADO' || s === 'SAIU PARA ENTREGA' || s === 'ENTREGUE') {
            defaultSteps[2].completed = true;
        }
        if (s === 'ENVIADO' || s === 'SAIU PARA ENTREGA' || s === 'ENTREGUE') {
            defaultSteps[3].completed = true;
        }
        if (s === 'ENTREGUE') {
            defaultSteps[4].completed = true;
        }

        return defaultSteps;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Sincronizando Histórico...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="text-gold-400" />
                        Meus Abastecimentos
                    </h2>
                    <p className="text-gray-400 text-sm">Acompanhe as suas solicitações de reposição de estoque à Sede.</p>
                </div>
            </div>

            <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-800 text-gray-200 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Data / Hora</th>
                                <th className="px-6 py-4">ID do Pedido</th>
                                <th className="px-6 py-4">Itens</th>
                                <th className="px-6 py-4 text-right">Valor Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500 italic">
                                        Nenhuma solicitação de abastecimento encontrada.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-dark-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-white font-medium">
                                                    <Calendar size={12} className="text-gold-400" />
                                                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                                    <Clock size={10} />
                                                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-300 bg-dark-950 px-2 py-1 rounded border border-dark-800">
                                                AC-{order.id.split('-')[0].toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package size={12} className="text-blue-400" />
                                                <span className="text-white text-xs font-medium">{order.items?.length || order.items_count || 0} volumes</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gold-400 font-bold">
                                            R$ {Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X size={20} />
                        </button>

                        <div className="mb-6 pb-4 border-b border-dark-800">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Truck className="text-gold-400" />
                                Detalhes do Abastecimento
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Pedido <span className="text-white font-mono font-bold">#AC-{selectedOrder.id.split('-')[0].toUpperCase()}</span> • Solicitado em {new Date(selectedOrder.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Status Atual</span>
                                    <p className={`font-bold ${getStatusColor(selectedOrder.status).split(' ')[1]}`}>{selectedOrder.status}</p>
                                </div>
                                <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Total do Pedido</span>
                                    <p className="text-gold-400 font-black text-xl">R$ {Number(selectedOrder.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                {selectedOrder.tracking_code && (
                                    <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 col-span-2">
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Código de Rastreio</span>
                                        <p className="text-white font-mono font-bold text-lg">{selectedOrder.tracking_code}</p>
                                    </div>
                                )}
                                {selectedOrder.payment_proof_url && (
                                    <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 col-span-2">
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Visualização do Comprovante</span>
                                        {selectedOrder.payment_proof_url.startsWith('data:image') ? (
                                            <div className="mt-2 text-center bg-black/50 p-2 rounded-lg border border-dark-800">
                                                <img
                                                    src={selectedOrder.payment_proof_url}
                                                    alt="Comprovante de Pagamento"
                                                    className="max-h-64 object-contain mx-auto rounded"
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openProof(selectedOrder.payment_proof_url)}
                                                className="text-blue-400 font-mono text-sm underline truncate block text-left hover:text-blue-300 transition-colors flex items-center gap-2"
                                            >
                                                📄 Ver Comprovante Anexado
                                            </button>
                                        )}
                                        <p className="text-gray-500 text-xs mt-3">Status do Comprovante: <span className="text-white font-bold">{selectedOrder.payment_proof_status || 'PENDENTE'}</span></p>
                                    </div>
                                )}
                            </div>

                            {/* Tracking Timeline */}
                            <div className="bg-dark-950 p-6 rounded-xl border border-dark-800">
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-6 flex items-center gap-2">
                                    <Truck size={16} />
                                    Acompanhamento em Tempo Real
                                </h4>
                                <div className="relative pl-2">
                                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-dark-700"></div>
                                    <div className="space-y-6 relative">
                                        {getTrackingSteps(selectedOrder.status).map((step, idx) => (
                                            <div key={idx} className="relative flex items-center gap-4">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center z-10 
                                                    ${step.isError ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                        step.completed ? 'bg-gold-500 shadow-[0_0_10px_rgba(255,215,0,0.5)] ' : 'bg-dark-800 border-[2px] border-dark-600'}`
                                                }>
                                                    {step.completed && !step.isError && <div className="w-1.5 h-1.5 bg-dark-950 rounded-full" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${step.isError ? 'text-red-500' : step.completed ? 'text-gold-400' : 'text-gray-500'}`}>{step.label}</p>
                                                    {step.completed && !step.isError && idx === 0 && <p className="text-[10px] text-gray-500">{new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <Package size={16} />
                                    Itens Solicitados
                                </h4>
                                <div className="space-y-2">
                                    {selectedOrder.items?.length > 0 ? (
                                        selectedOrder.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center bg-dark-800/30 p-3 rounded border border-dark-800">
                                                <div>
                                                    <p className="text-white text-sm font-medium">{item.product_name}</p>
                                                    <p className="text-[10px] text-gray-500">Cód: {item.sku || item.product_id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-bold text-sm">
                                                        {item.quantity}x <span className="text-gray-400 font-normal text-xs">R$ {Number(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    </p>
                                                    <p className="text-gold-400 text-xs font-bold">R$ {(item.quantity * Number(item.unit_price)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center italic text-gray-500 py-4">Nenhum item detalhado neste pedido.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-dark-800 flex justify-between items-center">
                            <div className="flex gap-3">
                                {selectedOrder.status !== 'CANCELADO' &&
                                    selectedOrder.status !== 'PAGO' &&
                                    !selectedOrder.payment_proof_url && (
                                        <button
                                            onClick={() => setIsPaymentModalOpen(true)}
                                            className="px-6 py-2 bg-gold-400 text-dark-900 font-bold rounded-lg hover:bg-gold-500 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                                        >
                                            INFORMAR PAGAMENTO
                                        </button>
                                    )}
                                {(selectedOrder.status === 'ENVIADO' || selectedOrder.status === 'SAIU PARA ENTREGA') && (
                                    <button
                                        onClick={handleConfirmDelivery}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    >
                                        CONFIRMAR RECEBIMENTO
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-2 bg-dark-800 text-white font-bold rounded-lg hover:bg-dark-700 transition-all border border-dark-700"
                            >
                                FECHAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Proof Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <DollarSign className="text-gold-400" />
                            Informar Pagamento
                        </h3>
                        <p className="text-sm text-gray-400 mb-6 font-medium">Anexe uma foto ou PDF do seu comprovante de pagamento para validação pela Sede.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Forma de Pagamento</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full bg-dark-950 border border-dark-800 text-white rounded-lg px-4 py-3 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                                >
                                    <option value="PIX">Pix</option>
                                    <option value="TED">TED / Transferência</option>
                                    <option value="BOLETO">Boleto (Dinheiro)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Upload do Comprovante (Imagem/PDF)</label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-dark-800 file:text-gold-400 hover:file:bg-dark-700 cursor-pointer"
                                />
                                {paymentProofBase64 && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-green-500 font-bold">
                                        <Package size={12} /> Arquivo selecionado com sucesso
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleUploadProof}
                                disabled={!paymentProofBase64 || isSubmitting}
                                className="w-full bg-gold-400 text-dark-900 font-bold px-6 py-3 rounded-xl disabled:opacity-50 hover:bg-gold-500 transition-all mt-4 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                            >
                                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR COMPROVANTE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReplenishmentOrders;
