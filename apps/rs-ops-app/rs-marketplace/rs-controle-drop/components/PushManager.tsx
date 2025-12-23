import React, { useState, useEffect } from 'react';
import { PushNotificationLog, CustomerWithMetrics, CustomerSegment } from '../types';
import { Bell, Send, BellRing, BellOff, CheckCircle, XCircle, Users } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';

interface PushManagerProps {
    logs: PushNotificationLog[];
    onAddLog: (log: PushNotificationLog) => void;
    customerMetrics: CustomerWithMetrics[];
}

const SEGMENTS: (CustomerSegment | 'Todos')[] = ['Todos', 'VIPs', 'Campeões', 'Leais', 'Em Risco', 'Hibernando', 'Novos', 'Potencial'];

export const PushManager: React.FC<PushManagerProps> = ({ logs, onAddLog, customerMetrics }) => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [formData, setFormData] = useState({ title: '', body: '', segment: 'Todos' });

    useEffect(() => {
        setPermission(Notification.permission);
    }, []);

    const handleRequestPermission = async () => {
        const result = await notificationService.requestPermission();
        setPermission(result);
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        const { title, body, segment } = formData;
        const success = await notificationService.sendNotification(title, body);
        
        onAddLog({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            title,
            body,
            segment,
            status: success ? 'Sent' : 'Failed',
        });

        if (success) {
            setFormData({ title: '', body: '', segment: 'Todos' });
        } else {
            alert('Falha ao enviar notificação. Verifique se a permissão foi concedida.');
        }
    };
    
    const table = useDataTable({ initialData: logs, searchKeys: ['title', 'body', 'segment']});

    const columns: Column<PushNotificationLog>[] = [
        { header: 'Data', accessor: 'date', sortable: true, render: l => new Date(l.date).toLocaleString('pt-BR') },
        { header: 'Título', accessor: 'title', render: l => <span className="font-bold text-slate-200">{l.title}</span> },
        { header: 'Mensagem', accessor: 'body', render: l => <p className="text-xs max-w-sm truncate">{l.body}</p> },
        { header: 'Segmento', accessor: 'segment' },
        { header: 'Status', accessor: 'status', render: l => l.status === 'Sent' 
            ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={14}/> Enviado</span>
            : <span className="text-red-400 flex items-center gap-1"><XCircle size={14}/> Falhou</span>
        },
    ];

    const PermissionStatus = () => {
        if (permission === 'granted') {
            return <div className="status-box bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><BellRing size={16}/> Permissão Concedida</div>;
        }
        if (permission === 'denied') {
            return <div className="status-box bg-red-500/10 text-red-400 border-red-500/20"><BellOff size={16}/> Permissão Negada</div>;
        }
        return (
            <div className="status-box bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <Bell size={16}/> Permissão Pendente
                <button onClick={handleRequestPermission} className="ml-4 text-xs bg-rs-gold text-rs-black font-bold px-2 py-1 rounded">Solicitar Permissão</button>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Bell /> Notificações Push</h2>
                    <p className="text-sm text-slate-400">Envie campanhas e alertas para seus clientes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20 space-y-4">
                    <h3 className="font-bold text-slate-200">Criar Campanha</h3>
                    <PermissionStatus />
                    <form onSubmit={handleSendNotification} className="space-y-4">
                        <div>
                            <label className="label-text">Título</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" required/>
                        </div>
                        <div>
                            <label className="label-text">Mensagem</label>
                            <textarea value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} className="input-field" rows={3} required/>
                        </div>
                         <div>
                            <label className="label-text flex items-center gap-2"><Users size={14}/> Segmento de Clientes</label>
                            <select value={formData.segment} onChange={e => setFormData({...formData, segment: e.target.value})} className="input-field">
                               {SEGMENTS.map(s => <option key={s} value={s}>{s} ({s === 'Todos' ? customerMetrics.length : customerMetrics.filter(c => c.segment === s).length})</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={permission !== 'granted'}>
                            <Send size={16}/> Enviar Notificação
                        </button>
                    </form>
                </div>
                <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20">
                     <h3 className="font-bold text-slate-200">Histórico de Envios</h3>
                     <div className="h-96 mt-4">
                        <DataTable {...table} columns={columns} data={table.paginatedData} onSort={() => {}} onSearch={() => {}} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={() => {}} />
                     </div>
                </div>
            </div>
            <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.status-box{display:flex;align-items:center;gap:0.5rem;padding:0.75rem;border-radius:0.5rem;font-size:0.875rem;font-weight:500;}`}</style>
        </div>
    );
};
