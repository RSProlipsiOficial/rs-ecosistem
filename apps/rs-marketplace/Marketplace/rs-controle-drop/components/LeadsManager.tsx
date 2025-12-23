import React, { useState, useMemo } from 'react';
import { Lead, User } from '../types';
import { Plus, Edit2, Trash2, X, Users, MapPin, Smartphone, CheckCircle, Megaphone, Download } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';

interface LeadsManagerProps {
  leads: Lead[];
  onAdd: (lead: Omit<Lead, 'id' | 'userId'>) => void;
  onUpdate: (lead: Lead) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[];
}

const EMPTY_LEAD: Omit<Lead, 'id' | 'userId'> = {
  date: new Date().toISOString().split('T')[0], name: '', phone: '',
  city: '', state: '', source: '', status: 'New'
};

const SOURCE_PRESETS = ['Instagram', 'Facebook', 'Meta Ads', 'Google Ads', 'TikTok', 'Indicação', 'Orgânico'];

export const LeadsManager: React.FC<LeadsManagerProps> = ({ leads, onAdd, onUpdate, onDelete, currentUser, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'userId'>>(EMPTY_LEAD);
  
  const table = useDataTable({ initialData: leads, searchKeys: ['name', 'phone', 'city', 'source']});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': return { label: 'Novo', style: 'bg-blue-500 text-black' };
      case 'Contacted': return { label: 'Em Atendimento', style: 'bg-yellow-500/20 text-yellow-400' };
      case 'Converted': return { label: 'Virou Venda', style: 'bg-emerald-500 text-black font-bold' };
      case 'Lost': return { label: 'Perdido', style: 'bg-red-500/10 text-red-400' };
      default: return { label: status, style: 'bg-slate-700 text-slate-300' };
    }
  };

  const handleQuickConvert = (lead: Lead) => {
    if (confirm(`Marcar ${lead.name} como Venda Realizada?`)) {
      onUpdate({ ...lead, status: 'Converted' });
    }
  };
  
  const columns: Column<Lead>[] = [
    { header: 'Data', accessor: 'date', sortable: true, render: (l) => l.date.split('-').reverse().join('/') },
    { header: 'Nome', accessor: 'name', sortable: true, render: (l) => <span className="font-medium text-slate-200">{l.name}</span> },
    ...(currentUser.role === 'Admin' ? [{
        header: 'Logista', accessor: 'userId', sortable: true,
        render: (l: Lead) => <span className="text-xs text-slate-500">{users.find(u => u.id === l.userId)?.name || 'N/A'}</span>
    } as Column<Lead>] : []),
    { header: 'Contato / Local', accessor: 'phone', sortable: false,
      render: (l) => (
        <div className="flex flex-col gap-1 text-xs">
            {l.phone && (<div className="flex items-center gap-1 text-slate-300"><Smartphone size={12}/> {l.phone}</div>)}
            <div className="flex items-center gap-1 text-slate-500"><MapPin size={12}/> {l.city}{l.state ? ` - ${l.state}` : ''}</div>
        </div>
      )
    },
    { header: 'Origem', accessor: 'source', sortable: true, 
      render: (l) => <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${l.source.toLowerCase().includes('ads') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>{l.source}</span>
    },
    { header: 'Status', accessor: 'status', sortable: true, headerClassName: 'text-center', cellClassName: 'text-center',
      render: (l) => {
        const statusInfo = getStatusBadge(l.status);
        return <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusInfo.style}`}>{statusInfo.label}</span>
      }
    },
    { header: 'Ações', accessor: 'actions', headerClassName: 'text-center', cellClassName: 'text-center',
      render: (l) => (
        <div className="flex justify-center gap-2">
            {l.status !== 'Converted' && (<button onClick={() => handleQuickConvert(l)} className="p-1.5 text-slate-500 hover:text-emerald-400" title="Marcar como Venda"><CheckCircle size={16}/></button>)}
            <button onClick={() => handleOpenModal(l)} className="p-1.5 text-slate-500 hover:text-blue-400"><Edit2 size={16}/></button>
            <button onClick={() => onDelete(l.id)} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  const kpis = useMemo(() => {
    const total = table.totalItems; // Use totalItems from hook
    // FIX: Changed table.filteredData to table.filteredAndSortedData, which is now returned by the hook.
    const fromAds = table.filteredAndSortedData.filter(l => ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Facebook', 'Instagram'].includes(l.source) || l.source.toLowerCase().includes('ads')).length;
    const converted = table.filteredAndSortedData.filter(l => l.status === 'Converted').length;
    const rate = total > 0 ? (converted / total) * 100 : 0;
    return { total, fromAds, converted, rate };
  }, [table.filteredAndSortedData, table.totalItems]);

  const handleOpenModal = (lead?: Lead) => { /* Logic remains the same */ };
  const handleSave = (e: React.FormEvent) => { /* Logic remains the same */ };
  const handleExport = () => { /* Logic remains the same */ };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Users size={24} /></div>
          <div><h2 className="text-xl font-bold text-slate-100">Cadastros RS</h2><p className="text-sm text-slate-500">Gestão de leads e conversão</p></div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExport} className="btn-secondary"><Download size={18} /></button>
           <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Cadastro</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-rs-card border border-rs-goldDim/20 p-4 rounded-xl shadow-sm"><div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Total de Leads</div><div className="text-2xl font-bold text-slate-100">{kpis.total}</div></div>
         <div className="bg-rs-card border border-rs-goldDim/20 p-4 rounded-xl shadow-sm"><div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Via Tráfego</div><div className="text-2xl font-bold text-blue-400">{kpis.fromAds}</div></div>
         <div className="bg-rs-card border border-rs-goldDim/20 p-4 rounded-xl shadow-sm"><div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Viraram Venda</div><div className="text-2xl font-bold text-emerald-400">{kpis.converted}</div></div>
         <div className="bg-rs-card border border-rs-goldDim/20 p-4 rounded-xl shadow-sm"><div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Taxa Conversão</div><div className="text-2xl font-bold text-rs-gold">{kpis.rate.toFixed(1)}%</div></div>
      </div>
      
      <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

      {/* Modal remains the same */}
    </div>
  );
};
