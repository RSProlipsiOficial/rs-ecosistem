import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { marketplaceAPI } from '../src/services/api';
import { getWalletUserId } from '../src/utils/walletSession';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-border/50 text-sm items-center">
        <span className="text-text-soft capitalize">{label}</span>
        <span className="font-semibold text-text-title text-right">{value || 'N/A'}</span>
    </div>
);

const Purchases: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);
                const userId = getWalletUserId();
                console.log('[DEBUG_PURCHASES] UserId carregado:', userId);
                
                if (!userId) {
                    setErrorMsg('Sessão expirada. Por favor, faça login novamente.');
                    return;
                }

                const response = await marketplaceAPI.getUserOrders(userId);
                console.log('[DEBUG_PURCHASES] Resposta da API:', response.data);

                if (response?.data?.success) {
                    const ordersFound = response.data.orders || [];
                    setOrders(ordersFound);
                    
                    if (ordersFound.length === 0) {
                        console.warn('[DEBUG_PURCHASES] Nenhuma ordem encontrada para ID:', userId);
                        // Apenas para debug visual do desenvolvedor no ambiente do usuário
                        (window as any).__LAST_QUERY_ID = userId;
                    }
                } else {
                    setErrorMsg(response.data?.error || 'Erro desconhecido ao carregar pedidos.');
                }
            } catch (error: any) {
                console.error('[DEBUG_PURCHASES] Erro crítico de conexão:', {
                    message: error.message,
                    code: error.code,
                    config: error.config,
                    response: error.response?.data
                });
                setErrorMsg(`Erro de conexão (${error.code || 'Network Error'}). A API está offline ou bloqueou o acesso.`);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const columns = useMemo(() => [
        {
            header: 'Data',
            accessor: 'created_at',
            render: (item: any) => (
                <div className="text-sm">
                    <p className="text-text-title font-medium">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                    <p className="text-text-body">{new Date(item.created_at).toLocaleTimeString('pt-BR')}</p>
                </div>
            )
        },
        {
            header: 'ID Conta',
            accessor: 'buyer_short_id',
            render: (item: any) => <span className="text-xs font-mono text-gold font-bold">#{item.buyer_short_id || 'N/A'}</span>
        },
        {
            header: 'Comprador',
            accessor: 'buyer_name',
            render: (item: any) => <span className="text-sm text-text-body">{item.buyer_name || 'Consultor RS'}</span>
        },
        {
            header: 'Nº Pedido',
            accessor: 'short_id',
            render: (item: any) => <span className="text-xs font-mono text-text-soft">#{item.short_id || 'N/A'}</span>
        },
        {
            header: 'Resumo',
            accessor: 'items',
            render: (item: any) => {
                const count = item.items?.length || 0;
                const firstItem = item.items?.[0];
                return (
                    <div>
                        <p className="text-sm font-medium text-text-title">
                            {firstItem ? firstItem.product?.name || 'Produto' : 'Sem itens'}
                        </p>
                        {count > 1 && <p className="text-xs text-gold">+ {count - 1} outros itens</p>}
                    </div>
                );
            }
        },
        {
            header: 'Total',
            accessor: 'total_amount',
            render: (item: any) => (
                <span className="font-semibold text-text-title">
                    {formatCurrency(item.total_amount)}
                </span>
            )
        },
        {
            header: 'Origem',
            accessor: 'origin_cd_name',
            render: (item: any) => (
                <span className="text-xs text-text-soft bg-surface px-2 py-1 rounded-md border border-border/50">
                    {item.origin_cd_name || 'Sede'}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status_display',
            render: (item: any) => <StatusBadge status={item.status_display || item.status} />
        }
    ], []);

    const renderModalContent = () => {
        if (!selectedOrder) return null;

        return (
            <div className="space-y-4">
                <div className="bg-surface rounded-xl p-4 border border-border">
                    <DetailRow label="Fonte / CD" value={<span className="text-gold font-bold">{selectedOrder.origin_cd_name || 'Sede RS (Matriz)'}</span>} />
                    <DetailRow label="Nº do Pedido" value={<span className="font-mono text-xs font-bold text-gold">#{selectedOrder.short_id}</span>} />
                    <DetailRow label="Comprador" value={selectedOrder.buyer_name} />
                    <DetailRow label="ID da Conta" value={<span className="font-mono text-xs font-bold text-gold">#{selectedOrder.buyer_short_id}</span>} />
                    <DetailRow label="Data" value={new Date(selectedOrder.created_at).toLocaleString('pt-BR')} />
                    <DetailRow label="Método de Pagamento" value={selectedOrder.payment_method_display || selectedOrder.payment_method || 'N/A'} />
                    <DetailRow label="Total" value={formatCurrency(selectedOrder.total_amount)} />
                    <DetailRow label="Status" value={<StatusBadge status={selectedOrder.status_display || selectedOrder.status} />} />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-text-title mb-3 px-1 uppercase tracking-wider">Itens do Pedido</h3>
                    <div className="space-y-2">
                        {selectedOrder.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-text-title">{item.product?.name || 'Produto'}</p>
                                    <p className="text-xs text-text-soft">SKU: {item.product?.sku || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-text-title">x{item.quantity}</p>
                                    <p className="text-xs text-text-soft">{formatCurrency(item.price_final)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {(selectedOrder.shipping_address || selectedOrder.endereco) && (
                    <div>
                        <h3 className="text-sm font-bold text-text-title mb-3 px-1 uppercase tracking-wider">Endereço de Entrega</h3>
                        <div className="p-3 bg-surface rounded-xl border border-border text-sm text-text-body">
                            {(() => {
                                const addr = selectedOrder.shipping_address || selectedOrder.endereco;
                                if (typeof addr === 'string') return <p>{addr}</p>;
                                
                                const street = addr.street || addr.logradouro || addr.address;
                                const number = addr.number || addr.numero || '';
                                const neighborhood = addr.neighborhood || addr.bairro || '';
                                const city = addr.city || addr.cidade || '';
                                const state = addr.state || addr.uf || '';
                                const zip = addr.zipCode || addr.cep || addr.zip_code || 'N/A';

                                if (!street && !city) return <p className="italic text-text-soft">Informações de endereço incompletas.</p>;

                                return (
                                    <>
                                        <p>{street}{number ? `, ${number}` : ''}</p>
                                        <p>{neighborhood}{neighborhood && city ? ' - ' : ''}{city}{city && state ? '/' : ''}{state}</p>
                                        <p>CEP: {zip}</p>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Minhas Compras</h1>
                <p className="text-text-body mt-1">Acompanhe seus pedidos e o status de entrega dos seus produtos.</p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                    {errorMsg}
                </div>
            )}

            {loading ? (
                <div className="bg-card rounded-2xl border border-border py-12 text-center text-text-body">
                    Carregando pedidos...
                </div>
            ) : orders.length === 0 && !errorMsg ? (
                <div className="bg-card rounded-2xl border border-border py-20 text-center">
                    <p className="text-text-soft">Você ainda não realizou nenhuma compra no marketplace.</p>
                </div>
            ) : (
                <DataTable columns={columns} data={orders} onRowClick={(order) => setSelectedOrder(order)} />
            )}

            <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Detalhes da Compra">
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default Purchases;
