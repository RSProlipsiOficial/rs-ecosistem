

import React, { useState } from 'react';
import { PaymentMethodConfig, ShippingConfig, AuditLog, MessageTemplate } from '../types';
import { Settings, Save, X, Plus, Edit2, Trash2, CreditCard, Truck, ShieldCheck, Search, Clock, MessageSquare, Info, User, RefreshCw } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface SettingsManagerProps {
  paymentConfigs: PaymentMethodConfig[];
  onAddPaymentConfig: (config: Omit<PaymentMethodConfig, 'id' | 'userId'>) => void;
  onUpdatePaymentConfig: (config: PaymentMethodConfig) => void;
  onDeletePaymentConfig: (id: string) => void;

  shippingConfigs: ShippingConfig[];
  onAddShippingConfig: (config: Omit<ShippingConfig, 'id' | 'userId'>) => void;
  onUpdateShippingConfig: (config: ShippingConfig) => void;
  onDeleteShippingConfig: (id: string) => void;

  auditLogs?: AuditLog[];

  whatsAppTemplates: MessageTemplate[];
  onWhatsAppTemplatesChange: (templates: MessageTemplate[]) => void;
}

const EMPTY_PAYMENT_CONFIG: Omit<PaymentMethodConfig, 'id' | 'userId'> = { name: '', defaultFeePercent: 0, defaultFeeFixed: 0 };
const EMPTY_SHIPPING_CONFIG: Omit<ShippingConfig, 'id' | 'userId'> = { name: '', defaultCost: 0 };
const EMPTY_TEMPLATE: Omit<MessageTemplate, 'id'> = { name: '', content: '' };

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  paymentConfigs, onAddPaymentConfig, onUpdatePaymentConfig, onDeletePaymentConfig,
  shippingConfigs, onAddShippingConfig, onUpdateShippingConfig, onDeleteShippingConfig,
  auditLogs = [],
  whatsAppTemplates, onWhatsAppTemplatesChange
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'templates' | 'audit'>('general');
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPaymentConfig, setEditingPaymentConfig] = useState<PaymentMethodConfig | null>(null);

  const [isShippingModalOpen, setShippingModalOpen] = useState(false);
  const [editingShippingConfig, setEditingShippingConfig] = useState<ShippingConfig | null>(null);

  // State for Template Modal
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const handleOpenPaymentModal = (config?: PaymentMethodConfig) => {
    setEditingPaymentConfig(config || null);
    setPaymentModalOpen(true);
  };

  const handleOpenShippingModal = (config?: ShippingConfig) => {
    setEditingShippingConfig(config || null);
    setShippingModalOpen(true);
  };

  const handleOpenTemplateModal = (template?: MessageTemplate) => {
    setEditingTemplate(template || null);
    setTemplateModalOpen(true);
  };

  const handleSavePayment = (config: Omit<PaymentMethodConfig, 'id' | 'userId'>) => {
    if (editingPaymentConfig) {
      onUpdatePaymentConfig({ ...config, id: editingPaymentConfig.id, userId: editingPaymentConfig.userId });
    } else {
      onAddPaymentConfig(config);
    }
    setPaymentModalOpen(false);
  };

  const handleSaveShipping = (config: Omit<ShippingConfig, 'id' | 'userId'>) => {
    if (editingShippingConfig) {
      onUpdateShippingConfig({ ...config, id: editingShippingConfig.id, userId: editingShippingConfig.userId });
    } else {
      onAddShippingConfig(config);
    }
    setShippingModalOpen(false);
  };

  const handleSaveTemplate = (template: Omit<MessageTemplate, 'id'>) => {
    if (editingTemplate) {
      onWhatsAppTemplatesChange(whatsAppTemplates.map(t => t.id === editingTemplate.id ? { ...template, id: t.id } : t));
    } else {
      onWhatsAppTemplatesChange([...whatsAppTemplates, { ...template, id: crypto.randomUUID() }]);
    }
    setTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo de mensagem?')) {
      onWhatsAppTemplatesChange(whatsAppTemplates.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Settings size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Configurações do Sistema</h2>
            <p className="text-sm text-slate-500">Gerencie taxas, fretes e segurança</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-rs-dark rounded-xl border border-white/10 w-fit">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'general' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>Geral</button>
        <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'templates' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>Templates</button>
        <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'audit' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>Auditoria</button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-8 animate-fade-in">
          {/* NOVO: Dados do Consultor / Sync */}
          <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-rs-gold flex items-center justify-center text-rs-gold overflow-hidden shrink-0">
              <User size={40} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-rs-gold mb-1">Perfil do Consultor</h3>
              <p className="text-sm text-slate-400 mb-4">Sincronize seus dados cadastrais, endereço e documentos diretamente da plataforma oficial.</p>
              <button
                onClick={async () => {
                  const { syncService } = await import('../services/syncService');
                  const result = await syncService.syncProfile();
                  alert(result.message);
                  if (result.success) window.location.reload();
                }}
                className="px-6 py-2.5 bg-rs-gold text-rs-black font-bold rounded-lg hover:bg-rs-gold/80 transition-all flex items-center gap-2 mx-auto md:mx-0 shadow-lg shadow-rs-gold/10"
              >
                <RefreshCw size={18} />
                Sincronizar com RS Prólipsi
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <ConfigSection
            title="Métodos de Pagamento"
            icon={<CreditCard size={20} />}
            onAddNew={() => handleOpenPaymentModal()}
          >
            <ConfigTable
              headers={['Nome', 'Taxa %', 'Taxa Fixa', 'Ações']}
              data={paymentConfigs}
              renderRow={(config: PaymentMethodConfig) => (
                <>
                  <td className="p-4 font-medium text-slate-200">{config.name}</td>
                  <td className="p-4 text-center text-emerald-400">{config.defaultFeePercent.toFixed(2)}%</td>
                  <td className="p-4 text-center text-slate-300">R$ {config.defaultFeeFixed.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenPaymentModal(config)} className="p-2 hover:text-blue-400"><Edit2 size={16} /></button>
                      <button onClick={() => onDeletePaymentConfig(config.id)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
            />
          </ConfigSection>

          {/* Shipping Methods */}
          <ConfigSection
            title="Configuração de Frete"
            icon={<Truck size={20} />}
            onAddNew={() => handleOpenShippingModal()}
          >
            <ConfigTable
              headers={['Método de Envio', 'Custo Padrão', 'Ações']}
              data={shippingConfigs}
              renderRow={(config: ShippingConfig) => (
                <>
                  <td className="p-4 font-medium text-slate-200">{config.name}</td>
                  <td className="p-4 text-center text-slate-300">R$ {config.defaultCost.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenShippingModal(config)} className="p-2 hover:text-blue-400"><Edit2 size={16} /></button>
                      <button onClick={() => onDeleteShippingConfig(config.id)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
            />
          </ConfigSection>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="animate-fade-in">
          <ConfigSection
            title="Templates de Mensagem (WhatsApp)"
            icon={<MessageSquare size={20} />}
            onAddNew={() => handleOpenTemplateModal()}
          >
            <ConfigTable
              headers={['Nome do Modelo', 'Conteúdo (Preview)', 'Ações']}
              data={whatsAppTemplates}
              renderRow={(template: MessageTemplate) => (
                <>
                  <td className="p-4 font-medium text-slate-200">{template.name}</td>
                  <td className="p-4 text-xs text-slate-400 italic max-w-md truncate">"{template.content}"</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenTemplateModal(template)} className="p-2 hover:text-blue-400"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
            />
          </ConfigSection>
        </div>
      )}

      {activeTab === 'audit' && (
        <AuditLogViewer logs={auditLogs} />
      )}

      {isPaymentModalOpen &&
        <PaymentConfigModal
          config={editingPaymentConfig}
          onSave={handleSavePayment}
          onClose={() => setPaymentModalOpen(false)}
        />
      }
      {isShippingModalOpen &&
        <ShippingConfigModal
          config={editingShippingConfig}
          onSave={handleSaveShipping}
          onClose={() => setShippingModalOpen(false)}
        />
      }
      {isTemplateModalOpen &&
        <TemplateModal
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setTemplateModalOpen(false)}
        />
      }
    </div>
  );
};

// --- AUDIT LOG VIEWER COMPONENT ---
const AuditLogViewer = ({ logs }: { logs: AuditLog[] }) => {
  const table = useDataTable({ initialData: logs, searchKeys: ['userName', 'details', 'entity', 'entityId'] });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Criação</span>;
      case 'UPDATE': return <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Edição</span>;
      case 'DELETE': return <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Exclusão</span>;
      default: return <span className="bg-slate-700 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{action}</span>;
    }
  };

  const columns: Column<AuditLog>[] = [
    { header: 'Data/Hora', accessor: 'date', sortable: true, render: (l) => <span className="text-xs text-slate-400">{new Date(l.date).toLocaleString('pt-BR')}</span> },
    { header: 'Usuário', accessor: 'userName', sortable: true, render: (l) => <span className="text-sm font-medium text-slate-200">{l.userName}</span> },
    { header: 'Ação', accessor: 'action', sortable: true, render: (l) => getActionBadge(l.action) },
    {
      header: 'Entidade', accessor: 'entity', sortable: true, render: (l) => (
        <div>
          <div className="text-sm text-slate-300">{l.entity}</div>
          <div className="text-[10px] text-slate-500 font-mono">{l.entityId}</div>
        </div>
      )
    },
    {
      header: 'Detalhes', accessor: 'details', sortable: true, render: (l) => (
        <div>
          <div className="text-sm text-slate-300">{l.details}</div>
          {l.changes && l.changes.length > 0 && (
            <div className="mt-1 space-y-1">
              {l.changes.map((c, idx) => (
                <div key={idx} className="text-[10px] bg-black/30 p-1 rounded border border-white/5 flex gap-2">
                  <span className="text-rs-gold font-bold">{c.field}:</span>
                  <span className="text-red-400 line-through">{String(c.old)}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-emerald-400">{String(c.new)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-rs-card p-4 rounded-xl border border-rs-goldDim/20 flex items-center gap-3 text-slate-300">
        <ShieldCheck size={24} className="text-rs-gold" />
        <div>
          <h3 className="font-bold">Log de Auditoria</h3>
          <p className="text-xs text-slate-500">Histórico de ações críticas e alterações sensíveis no sistema.</p>
        </div>
      </div>

      <DataTable
        {...table}
        columns={columns}
        data={table.paginatedData}
        onSort={table.requestSort}
        onSearch={table.setSearchTerm}
        onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        searchPlaceholder="Buscar logs por usuário, entidade ou detalhes..."
      />
    </div>
  );
};

// --- SHARED CONFIG COMPONENTS ---
const ConfigSection = ({ title, icon, onAddNew, children, hideAddButton = false }: any) => (
  <div className="bg-rs-card rounded-xl border border-rs-goldDim/20 overflow-hidden shadow-lg">
    <div className="p-4 border-b border-white/5 flex justify-between items-center">
      <h3 className="font-semibold text-rs-gold flex items-center gap-2">{icon} {title}</h3>
      {!hideAddButton && <button onClick={onAddNew} className="btn-primary-sm flex items-center gap-1"><Plus size={16} /> Adicionar</button>}
    </div>
    {children}
    <style>{`.btn-primary-sm { background-color: #d4af37; color: #0a0a0a; font-weight: 600; padding: 0.3rem 0.8rem; border-radius: 0.5rem; font-size: 0.8rem; }`}</style>
  </div>
);

const ConfigTable = ({ headers, data, renderRow }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="bg-white/5 text-slate-400 uppercase text-xs">
        <tr>{headers.map((h: string) => <th key={h} className={`p-4 ${h === 'Ações' && 'text-center'}`}>{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-white/5 text-slate-400">
        {data.map((item: any) => <tr key={item.id} className="hover:bg-white/5">{renderRow(item)}</tr>)}
      </tbody>
    </table>
  </div>
);

// --- Modals ---

const PaymentConfigModal = ({ config, onSave, onClose }: any) => {
  const [formData, setFormData] = useState(config || EMPTY_PAYMENT_CONFIG);
  const isEditing = !!config;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose} title={`${isEditing ? 'Editar' : 'Novo'} Método de Pagamento`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div><label className="label-text">Nome do Método</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Ex: Cartão - Mercado Pago" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-text">Taxa Padrão (%)</label><input type="number" step="0.01" value={formData.defaultFeePercent} onChange={e => setFormData({ ...formData, defaultFeePercent: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
          <div><label className="label-text">Taxa Fixa (R$)</label><input type="number" step="0.01" value={formData.defaultFeeFixed} onChange={e => setFormData({ ...formData, defaultFeeFixed: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
        </div>
        <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancelar</button><button type="submit" className="flex-1 btn-primary">Salvar</button></div>
      </form>
      <style>{`.label-text{display:block;font-size:0.75rem;font-weight:500;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem}`}</style>
    </ModalWrapper>
  );
};

const ShippingConfigModal = ({ config, onSave, onClose }: any) => {
  const [formData, setFormData] = useState(config || EMPTY_SHIPPING_CONFIG);
  const isEditing = !!config;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose} title={`${isEditing ? 'Editar' : 'Novo'} Método de Envio`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div><label className="label-text">Nome do Método de Envio</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Ex: Correios - SEDEX" /></div>
        <div><label className="label-text">Custo Padrão de Frete (R$)</label><input type="number" step="0.01" value={formData.defaultCost} onChange={e => setFormData({ ...formData, defaultCost: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
        <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancelar</button><button type="submit" className="flex-1 btn-primary">Salvar</button></div>
      </form>
      <style>{`.label-text{display:block;font-size:0.75rem;font-weight:500;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem}`}</style>
    </ModalWrapper>
  );
};

const TemplateModal = ({ template, onSave, onClose }: { template: MessageTemplate | null, onSave: (t: Omit<MessageTemplate, 'id'>) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState(template || EMPTY_TEMPLATE);
  const isEditing = !!template;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose} title={`${isEditing ? 'Editar' : 'Novo'} Modelo de Mensagem`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div><label className="label-text">Nome do Modelo</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Ex: Lembrete Rápido" /></div>
        <div>
          <label className="label-text">Conteúdo da Mensagem</label>
          <textarea
            rows={6}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-slate-200 resize-none focus:border-rs-gold outline-none"
          />
        </div>
        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Info size={14} /> Placeholders Disponíveis</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <code className="bg-slate-700 text-slate-300 px-2 py-1 rounded">{'{nome}'}</code>
            <code className="bg-slate-700 text-slate-300 px-2 py-1 rounded">{'{lista_produtos}'}</code>
            <code className="bg-slate-700 text-slate-300 px-2 py-1 rounded">{'{valor_total}'}</code>
            <code className="bg-slate-700 text-slate-300 px-2 py-1 rounded">{'{link_checkout}'}</code>
          </div>
        </div>
        <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar Modelo</button></div>
      </form>
      <style>{`.label-text{display:block;font-size:0.75rem;font-weight:500;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem}`}</style>
    </ModalWrapper>
  );
};