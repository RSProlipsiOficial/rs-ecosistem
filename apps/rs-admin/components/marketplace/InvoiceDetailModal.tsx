// FIX: Replaced placeholder content with a functional React component to resolve module and compilation errors.
import React from 'react';
import type { Invoice } from '../../types';
import { CloseIcon, PrinterIcon, ArrowDownTrayIcon } from '../icons';

interface ModalProps {
    isOpen: boolean;
    invoice: Invoice | null;
    onClose: () => void;
}

const InvoiceDetailModal: React.FC<ModalProps> = ({ isOpen, invoice, onClose }) => {
    if (!isOpen || !invoice) return null;

    const { orderData } = invoice;
    const subtotal = orderData.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (!invoice) return;
        const { orderData } = invoice;
        const subtotalCalc = orderData.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

        let content = `NOTA FISCAL - ${invoice.id}\n`;
        content += `========================================\n\n`;
        content += `DE:\n`;
        content += `RS Prólipsi\n`;
        content += `Rua Exemplo, 123, São Paulo, SP\n`;
        content += `CNPJ: 12.345.678/0001-99\n\n`;
        content += `----------------------------------------\n`;
        content += `PARA:\n`;
        content += `${orderData.customer.name}\n`;
        content += `${orderData.shipping.address.street}\n`;
        content += `${orderData.shipping.address.city}, ${orderData.shipping.address.state} - ${orderData.shipping.address.zip}\n`;
        content += `${orderData.customer.email}\n\n`;
        content += `----------------------------------------\n`;
        content += `Nº DO PEDIDO: ${invoice.orderId}\n`;
        content += `DATA DE EMISSÃO: ${new Date(invoice.issueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}\n\n`;
        content += `========================================\n`;
        content += `ITENS\n`;
        content += `----------------------------------------\n`;
        orderData.items.forEach(item => {
            const itemTotal = (item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            content += `${item.productName} (x${item.quantity})`.padEnd(40) + `${itemTotal}\n`;
        });
        content += `----------------------------------------\n\n`;
        content += `Subtotal:`.padEnd(30) + `${subtotalCalc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
        content += `Frete:`.padEnd(30) + `${orderData.shipping.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
        content += `TOTAL:`.padEnd(30) + `${invoice.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `NotaFiscal-${invoice.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 print:p-0" aria-modal="true" role="dialog">
            <style>{`
                @media print {
                    body > *:not(.printable-invoice):not(:has(.printable-invoice)) { display: none; }
                    .printable-invoice {
                        position: absolute; left: 0; top: 0; width: 100%; height: 100%;
                        border: none; box-shadow: none; border-radius: 0; max-height: none;
                        color: black; background-color: white !important;
                    }
                    .no-print { display: none; }
                    .print-bg-gray { background-color: #f9fafb !important; }
                    .print-text-black { color: black !important; }
                    .print-border-gray { border-color: #e5e7eb !important; }
                }
            `}</style>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col printable-invoice">
                <header className="flex items-center justify-between p-4 border-b border-gray-700 no-print">
                    <h2 className="text-xl font-bold text-white">Nota Fiscal <span className="font-mono text-yellow-500">{invoice.id}</span></h2>
                    <div className="flex items-center gap-2">
                         <button onClick={handleDownload} className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg px-3 py-2 hover:bg-gray-600 transition-colors">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Download (.txt)
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg px-3 py-2 hover:bg-gray-600 transition-colors">
                            <PrinterIcon className="w-5 h-5" />
                            Imprimir
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
                <main className="flex-grow p-8 overflow-y-auto bg-gray-800/50 print:bg-white print:p-12">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-yellow-400 print-text-black">NOTA FISCAL</h1>
                            <p className="text-gray-400 print-text-black">#{invoice.id}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-white print-text-black">RS Prólipsi</h2>
                            <p className="text-sm text-gray-400 print-text-black">Rua Exemplo, 123, São Paulo, SP</p>
                            <p className="text-sm text-gray-400 print-text-black">CNPJ: 12.345.678/0001-99</p>
                        </div>
                    </div>

                    {/* Customer Info and Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-y border-gray-700 py-6 print-border-gray">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 print-text-black">Cobrança para</h3>
                            <p className="font-bold text-white print-text-black">{orderData.customer.name}</p>
                            <p className="text-sm text-gray-300 print-text-black">{orderData.shipping.address.street}</p>
                            <p className="text-sm text-gray-300 print-text-black">{orderData.shipping.address.city}, {orderData.shipping.address.state} - {orderData.shipping.address.zip}</p>
                            <p className="text-sm text-gray-300 print-text-black">{orderData.customer.email}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider print-text-black">Nº do Pedido</p>
                                <p className="font-medium text-white print-text-black">{invoice.orderId}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider print-text-black">Data de Emissão</p>
                                <p className="font-medium text-white print-text-black">{new Date(invoice.issueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase print-text-black">
                                <tr className="border-b border-gray-700 print-border-gray">
                                    <th className="font-semibold px-4 py-3">Produto</th>
                                    <th className="font-semibold px-4 py-3 text-center">Qtd.</th>
                                    <th className="font-semibold px-4 py-3 text-right">Preço Unit.</th>
                                    <th className="font-semibold px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300 print-text-black">
                                {orderData.items.map(item => (
                                    <tr key={item.productId} className="border-b border-gray-800 print-border-gray last:border-b-0">
                                        <td className="px-4 py-4 font-medium text-white print-text-black">{item.productName}</td>
                                        <td className="px-4 py-4 text-center">{item.quantity}</td>
                                        <td className="px-4 py-4 text-right">{item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="px-4 py-4 text-right font-semibold">{(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Totals */}
                    <div className="flex justify-end mt-6">
                        <div className="w-full max-w-sm space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300 print-text-black"><span>Subtotal</span><span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            <div className="flex justify-between text-gray-300 print-text-black"><span>Frete</span><span>{orderData.shipping.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            <div className="flex justify-between font-bold text-xl border-t border-gray-600 pt-2 text-white print-border-gray print-text-black">
                                <span>Total</span>
                                <span className="text-yellow-400 print-text-black">{invoice.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default InvoiceDetailModal;