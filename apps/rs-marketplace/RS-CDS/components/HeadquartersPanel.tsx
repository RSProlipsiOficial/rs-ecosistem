

import React, { useState } from 'react';
import { CDRegistry, FranchiseRule, ReplenishmentOrder, ExternalConsultant, GlobalSalesOrder } from '../types';
import { Shield, Building2, Users, DollarSign, Plus, Search, Edit, Lock, Unlock, Save, FileText, CheckCircle, Package, Truck, Eye, X, Send, History, Filter, ShoppingBag, BarChart2, Calendar, MapPin } from 'lucide-react';
import { mockCDRegistry, mockFranchiseRules, mockExternalConsultants, mockReplenishmentOrders, mockGlobalSales } from '../services/mockData';

const HeadquartersPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REQUESTS' | 'RULES' | 'SALES'>('OVERVIEW');
  const [cdList, setCdList] = useState<CDRegistry[]>(mockCDRegistry);
  const [rules, setRules] = useState<FranchiseRule>(mockFranchiseRules);
  const [replenishmentOrders, setReplenishmentOrders] = useState<ReplenishmentOrder[]>(mockReplenishmentOrders);
  const [globalSales, setGlobalSales] = useState<GlobalSalesOrder[]>(mockGlobalSales);
  
  // --- STATES FOR ADD CD MODAL (CONSULTANT LOOKUP) ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [consultantSearchId, setConsultantSearchId] = useState('');
  const [foundConsultant, setFoundConsultant] = useState<ExternalConsultant | null>(null);
  const [searchError, setSearchError] = useState('');
  const [newCDType, setNewCDType] = useState('FRANQUIA');
  const [newCDCity, setNewCDCity] = useState('');
  const [newCDState, setNewCDState] = useState('');
  const [newCDName, setNewCDName] = useState('');

  // --- STATES FOR REPLENISHMENT ORDER DETAIL ---
  const [selectedOrder, setSelectedOrder] = useState<ReplenishmentOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // --- STATES FOR GLOBAL SALES HISTORY ---
  const [selectedGlobalSale, setSelectedGlobalSale] = useState<GlobalSalesOrder | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalDateFilter, setGlobalDateFilter] = useState('');
  const [globalStatusFilter, setGlobalStatusFilter] = useState('ALL');

  // Cálculos de KPI
  const totalCDs = cdList.length;
  const activeCDs = cdList.filter(cd => cd.status === 'ATIVO').length;
  const pendingRequests = replenishmentOrders.filter(o => o.status === 'PENDENTE').length;

  // Cálculos de Vendas Globais
  const filteredSales = globalSales.filter(sale => {
      const matchSearch = 
        sale.cdName.toLowerCase().includes(globalSearch.toLowerCase()) || 
        sale.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
        sale.consultantName.toLowerCase().includes(globalSearch.toLowerCase());
      const matchDate = globalDateFilter ? sale.date === globalDateFilter : true;
      const matchStatus = globalStatusFilter === 'ALL' || sale.status === globalStatusFilter;
      return matchSearch && matchDate && matchStatus;
  });

  const totalGlobalRevenue = filteredSales.reduce((acc, curr) => acc + curr.total, 0);
  const totalGlobalPoints = filteredSales.reduce((acc, curr) => acc + curr.totalPoints, 0);


  // --- HANDLERS FOR ADD CD ---
  const handleSearchConsultant = () => {
      setSearchError('');
      setFoundConsultant(null);
      
      const consultant = mockExternalConsultants.find(c => c.id === consultantSearchId || c.cpf === consultantSearchId);
      
      if (consultant) {
          if (consultant.status === 'INATIVO') {
              setSearchError('Consultor encontrado, mas está INATIVO no sistema RS Prólipsi.');
              return;
          }
          setFoundConsultant(consultant);
          setNewCDName(`CD ${consultant.name.split(' ')[0]}`); // Sugestão de nome
      } else {
          setSearchError('Consultor não encontrado na base de dados.');
      }
  };

  const handleAddCD = () => {
    if (!foundConsultant || !newCDName || !newCDCity || !newCDState) return;
    
    const cd: CDRegistry = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCDName,
        managerName: foundConsultant.name,
        managerId: foundConsultant.id,
        email: foundConsultant.email,
        phone: foundConsultant.phone,
        city: newCDCity,
        state: newCDState,
        type: newCDType as any,
        status: 'PENDENTE_APROVACAO',
        joinDate: new Date().toISOString().split('T')[0]
    };

    setCdList([...cdList, cd]);
    
    // Reset form
    setShowAddModal(false);
    setFoundConsultant(null);
    setConsultantSearchId('');
    setNewCDCity('');
    setNewCDState('');
    setNewCDName('');
  };

  const toggleStatus = (id: string) => {
      setCdList(cdList.map(cd => {
          if (cd.id === id) {
              return { ...cd, status: cd.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO' };
          }
          return cd;
      }));
  };

  // --- HANDLERS FOR ORDER MANAGEMENT ---
  const handleOpenOrder = (order: ReplenishmentOrder) => {
      setSelectedOrder(order);
      setTrackingInput(order.trackingCode || '');
  };

  const handleDispatchOrder = () => {
      if (!selectedOrder) return;
      
      const updatedOrders = replenishmentOrders.map(o => {
          if (o.id === selectedOrder.id) {
              return { 
                  ...o, 
                  status: 'ENVIADO' as const, 
                  trackingCode: trackingInput 
              };
          }
          return o;
      });

      setReplenishmentOrders(updatedOrders);
      setSelectedOrder(null);
  };

  const handleSaveRules = () => {
    alert("Regras de Franquia atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-gold-400" />
            Administrador Master
          </h2>
          <p className="text-gray-400 text-sm">Gestão Centralizada de CDs e Regras de Negócio.</p>
        </div>
      </div>

      {/* Navegação Interna */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-dark-800 mb-6 scrollbar-hide">
        <button
             onClick={() => setActiveTab('OVERVIEW')}
             className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
               activeTab === 'OVERVIEW' 
               ? 'bg-dark-900 text-gold-400 border-b-2 border-gold-400' 
               : 'text-gray-400 hover:text-white hover:bg-dark-800'
             }`}
           >
             <Building2 size={18}/> Rede de CDs
        </button>
        <button
             onClick={() => setActiveTab('REQUESTS')}
             className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
               activeTab === 'REQUESTS' 
               ? 'bg-dark-900 text-gold-400 border-b-2 border-gold-400' 
               : 'text-gray-400 hover:text-white hover:bg-dark-800'
             }`}
           >
             <Truck size={18}/> Abastecimento CDs
             {pendingRequests > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests}</span>}
        </button>
        <button
             onClick={() => setActiveTab('SALES')}
             className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
               activeTab === 'SALES' 
               ? 'bg-dark-900 text-gold-400 border-b-2 border-gold-400' 
               : 'text-gray-400 hover:text-white hover:bg-dark-800'
             }`}
           >
             <BarChart2 size={18}/> Vendas da Rede
        </button>
        <button
             onClick={() => setActiveTab('RULES')}
             className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
               activeTab === 'RULES' 
               ? 'bg-dark-900 text-gold-400 border-b-2 border-gold-400' 
               : 'text-gray-400 hover:text-white hover:bg-dark-800'
             }`}
           >
             <FileText size={18}/> Regras de Franquia
        </button>
      </div>

      {/* --- TAB: OVERVIEW (GESTÃO CDS) --- */}
      {activeTab === 'OVERVIEW' && (
        <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Total de Unidades</p>
                        <h3 className="text-3xl font-bold text-white">{totalCDs}</h3>
                    </div>
                    <div className="p-3 bg-gold-500/10 text-gold-400 rounded-lg">
                        <Building2 size={24} />
                    </div>
                </div>
                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">CDs Ativos</p>
                        <h3 className="text-3xl font-bold text-green-500">{activeCDs}</h3>
                    </div>
                    <div className="p-3 bg-green-900/20 text-green-500 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Pedidos Pendentes</p>
                        <h3 className="text-3xl font-bold text-yellow-500">{pendingRequests}</h3>
                    </div>
                    <div className="p-3 bg-yellow-900/20 text-yellow-500 rounded-lg">
                        <Package size={24} />
                    </div>
                </div>
            </div>

            {/* Tabela de CDs */}
            <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-dark-800 flex justify-between items-center">
                    <h3 className="font-bold text-white">CDs Credenciados</h3>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-colors"
                    >
                        <Plus size={16} /> Novo CD (Consultor)
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-950 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Nome do CD</th>
                                <th className="px-6 py-4">Gerente (Consultor)</th>
                                <th className="px-6 py-4">Localização</th>
                                <th className="px-6 py-4 text-center">Tipo</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {cdList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center italic text-gray-500">
                                        Nenhum Centro de Distribuição cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                cdList.map(cd => (
                                    <tr key={cd.id} className="hover:bg-dark-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">{cd.name}</td>
                                        <td className="px-6 py-4">
                                            <div>{cd.managerName}</div>
                                            <div className="text-xs text-gray-600 font-mono">ID: {cd.managerId}</div>
                                        </td>
                                        <td className="px-6 py-4">{cd.city}/{cd.state}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] px-2 py-1 rounded border ${cd.type === 'PROPRIO' ? 'border-purple-800 bg-purple-900/20 text-purple-400' : 'border-blue-800 bg-blue-900/20 text-blue-400'}`}>
                                                {cd.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                             <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                                cd.status === 'ATIVO' ? 'bg-green-900/20 text-green-500' :
                                                cd.status === 'PENDENTE_APROVACAO' ? 'bg-yellow-900/20 text-yellow-500' :
                                                'bg-red-900/20 text-red-500'
                                            }`}>
                                                {cd.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button 
                                                onClick={() => toggleStatus(cd.id)}
                                                className={`p-2 rounded-lg transition-colors ${cd.status === 'ATIVO' ? 'bg-red-900/20 text-red-500 hover:bg-red-900/40' : 'bg-green-900/20 text-green-500 hover:bg-green-900/40'}`}
                                                title={cd.status === 'ATIVO' ? "Bloquear" : "Ativar"}
                                            >
                                                {cd.status === 'ATIVO' ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                            <button className="p-2 bg-dark-800 hover:bg-dark-700 text-gold-400 rounded-lg">
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}

      {/* --- TAB: SALES HISTORY (VENDAS GERAIS DE TODOS OS CDS) --- */}
      {activeTab === 'SALES' && (
          <div className="space-y-6 animate-fade-in">
              {/* KPIs de Venda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-xs font-bold uppercase">Volume Total Vendido (R$)</p>
                          <h3 className="text-3xl font-bold text-white">R$ {totalGlobalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                          <p className="text-xs text-gray-500 mt-1">Soma de todos os CDs filtrados</p>
                      </div>
                      <div className="p-3 bg-green-900/20 text-green-500 rounded-lg">
                          <DollarSign size={24} />
                      </div>
                  </div>
                  <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-xs font-bold uppercase">Total Pontos (VP)</p>
                          <h3 className="text-3xl font-bold text-blue-400">{totalGlobalPoints.toLocaleString('pt-BR')} VP</h3>
                          <p className="text-xs text-gray-500 mt-1">Pontuação gerada para a rede</p>
                      </div>
                      <div className="p-3 bg-blue-900/20 text-blue-500 rounded-lg">
                          <CheckCircle size={24} />
                      </div>
                  </div>
              </div>

              {/* Filtros e Tabela */}
              <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-dark-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-dark-950/50">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <History className="text-gold-400" />
                          Histórico de Vendas da Rede
                      </h3>
                      
                      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                          <div className="relative">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                               <input 
                                   type="text" 
                                   placeholder="Buscar CD, Pedido ou Consultor..." 
                                   className="bg-dark-900 border border-dark-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:border-gold-400 w-full md:w-64 outline-none"
                                   value={globalSearch}
                                   onChange={(e) => setGlobalSearch(e.target.value)}
                               />
                          </div>
                          <div className="relative">
                               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                               <input 
                                   type="date" 
                                   className="bg-dark-900 border border-dark-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:border-gold-400 outline-none"
                                   value={globalDateFilter}
                                   onChange={(e) => setGlobalDateFilter(e.target.value)}
                               />
                          </div>
                          <select 
                             className="bg-dark-900 border border-dark-700 text-white rounded-lg px-3 py-2 text-sm focus:border-gold-400 outline-none"
                             value={globalStatusFilter}
                             onChange={(e) => setGlobalStatusFilter(e.target.value)}
                          >
                              <option value="ALL">Status: Todos</option>
                              <option value="CONCLUIDO">Concluído</option>
                              <option value="PENDENTE">Pendente</option>
                              <option value="EM_TRANSPORTE">Em Transporte</option>
                          </select>
                      </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-950 text-gray-500 uppercase font-bold text-xs sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">CD Origem</th>
                                <th className="px-6 py-4">ID Venda</th>
                                <th className="px-6 py-4">Comprador (Consultor)</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 text-right">Pontos</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center italic text-gray-500">
                                        Nenhuma venda encontrada com os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-dark-800/50 transition-colors">
                                        <td className="px-6 py-4 text-white">{sale.date.split('-').reverse().join('/')}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{sale.cdName}</div>
                                            <div className="text-[10px] text-gray-500">{sale.cdRegion}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{sale.id}</td>
                                        <td className="px-6 py-4">
                                            <div>{sale.consultantName}</div>
                                            <div className="text-[10px] text-gray-500">PIN: {sale.consultantPin}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gold-400">R$ {sale.total.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-blue-400 font-bold">{sale.totalPoints}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                                sale.status === 'CONCLUIDO' ? 'bg-green-900/20 text-green-500' :
                                                sale.status === 'PENDENTE' ? 'bg-yellow-900/20 text-yellow-500' :
                                                'bg-blue-900/20 text-blue-500'
                                            }`}>
                                                {sale.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setSelectedGlobalSale(sale)}
                                                className="p-2 hover:bg-dark-700 text-gray-400 hover:text-white rounded-lg"
                                            >
                                                <Eye size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                     </table>
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: REQUESTS (PEDIDOS DE ABASTECIMENTO DOS CDS) --- */}
      {activeTab === 'REQUESTS' && (
          <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
             <div className="p-4 border-b border-dark-800">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Truck className="text-gold-400" />
                    Histórico de Solicitações de Estoque
                </h3>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-950 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">ID Pedido</th>
                            <th className="px-6 py-4">CD Solicitante</th>
                            <th className="px-6 py-4 text-center">Itens</th>
                            <th className="px-6 py-4 text-right">Total (Custo)</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800">
                        {replenishmentOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center italic text-gray-500">
                                    Nenhum pedido de abastecimento registrado.
                                </td>
                            </tr>
                        ) : (
                            replenishmentOrders.map(order => (
                                <tr key={order.id} className="hover:bg-dark-800/50 transition-colors">
                                    <td className="px-6 py-4">{order.date.split('-').reverse().join('/')}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                    <td className="px-6 py-4 text-white font-medium">{order.cdName}</td>
                                    <td className="px-6 py-4 text-center">{order.itemsCount}</td>
                                    <td className="px-6 py-4 text-right text-gold-400 font-bold">R$ {order.totalValue.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                            order.status === 'PENDENTE' ? 'bg-yellow-900/20 text-yellow-500' :
                                            order.status === 'ENVIADO' ? 'bg-blue-900/20 text-blue-500' :
                                            'bg-green-900/20 text-green-500'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleOpenOrder(order)}
                                            className="p-2 bg-dark-800 hover:bg-gold-500 hover:text-black rounded-lg transition-colors text-gold-400"
                                            title="Ver Detalhes e Enviar"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                 </table>
             </div>
          </div>
      )}

      {/* --- TAB: RULES (REGRAS DE VENDA/FRANQUIA) --- */}
      {activeTab === 'RULES' && (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-dark-900 p-8 rounded-xl border border-dark-800 shadow-xl">
                 <div className="flex items-center justify-between mb-8 pb-4 border-b border-dark-800">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             <DollarSign className="text-gold-400" />
                             Configuração de Venda de Franquia
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Defina como novos CDs podem ser comprados e aderir à rede.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-800">
                        <span className={`w-3 h-3 rounded-full ${rules.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm font-bold text-gray-300">{rules.active ? 'Vendas Ativas' : 'Vendas Pausadas'}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Custos */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gold-400 uppercase border-l-2 border-gold-400 pl-2">Custos Iniciais</h4>
                          
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Taxa de Franquia (Adesão)</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                  <input 
                                    type="number" 
                                    className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-8 pr-4 py-3 text-white focus:border-gold-400 outline-none font-bold"
                                    value={rules.initialCost}
                                    onChange={(e) => setRules({...rules, initialCost: parseFloat(e.target.value)})}
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Compra Mínima de Estoque (Kit Inicial)</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                  <input 
                                    type="number" 
                                    className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-8 pr-4 py-3 text-white focus:border-gold-400 outline-none"
                                    value={rules.minStockPurchase}
                                    onChange={(e) => setRules({...rules, minStockPurchase: parseFloat(e.target.value)})}
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Taxas Recorrentes */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-blue-400 uppercase border-l-2 border-blue-400 pl-2">Recorrência</h4>
                          
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Royalties (Sobre Faturamento)</label>
                              <div className="relative">
                                  <input 
                                    type="number" 
                                    className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                                    value={rules.royaltyPercentage}
                                    onChange={(e) => setRules({...rules, royaltyPercentage: parseFloat(e.target.value)})}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                              </div>
                          </div>

                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fundo de Marketing (FPP)</label>
                              <div className="relative">
                                  <input 
                                    type="number" 
                                    className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                                    value={rules.marketingFee}
                                    onChange={(e) => setRules({...rules, marketingFee: parseFloat(e.target.value)})}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                              </div>
                          </div>
                      </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-dark-800">
                      <div className="flex items-center gap-4 mb-4">
                         <input 
                            type="checkbox" 
                            id="activeRule"
                            checked={rules.active}
                            onChange={(e) => setRules({...rules, active: e.target.checked})}
                            className="w-5 h-5 accent-gold-500 bg-dark-800 border-dark-600 rounded"
                         />
                         <label htmlFor="activeRule" className="text-white font-medium cursor-pointer select-none">
                             Habilitar Venda de Novos CDs
                             <span className="block text-xs text-gray-500">Se desmarcado, o formulário de adesão ficará indisponível no site público.</span>
                         </label>
                      </div>

                      <button 
                        onClick={handleSaveRules}
                        className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-gold-500/20 flex justify-center items-center gap-2"
                      >
                          <Save size={18} />
                          Salvar Configurações de Franquia
                      </button>
                 </div>
            </div>
        </div>
      )}

      {/* --- MODAL: ADD CD (COM BUSCA DE CONSULTOR) --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                <h3 className="text-xl font-bold text-white mb-6">Cadastrar Novo CD</h3>
                
                {/* ETAPA 1: BUSCA */}
                <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Buscar Consultor RS Prólipsi</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Digite ID ou CPF..." 
                            className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-400"
                            value={consultantSearchId}
                            onChange={(e) => setConsultantSearchId(e.target.value)}
                        />
                        <button 
                            onClick={handleSearchConsultant}
                            className="bg-dark-800 border border-dark-700 hover:bg-dark-700 text-gold-400 px-4 rounded-lg"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                    {searchError && <p className="text-red-500 text-xs mt-2">{searchError}</p>}
                    
                    {foundConsultant && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white font-bold text-sm">{foundConsultant.name}</p>
                                    <p className="text-xs text-gray-400">Nível: <span className="text-gold-400">{foundConsultant.level}</span></p>
                                </div>
                                <div className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">VERIFICADO</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ETAPA 2: DADOS DO CD (Só libera se achou consultor) */}
                <div className={`space-y-4 ${!foundConsultant ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do CD (Sugerido)</label>
                        <input 
                            type="text" 
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-400"
                            value={newCDName}
                            onChange={(e) => setNewCDName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label>
                            <input 
                                type="text" 
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-400"
                                value={newCDCity}
                                onChange={(e) => setNewCDCity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                            <input 
                                type="text" 
                                maxLength={2}
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-400 uppercase"
                                value={newCDState}
                                onChange={(e) => setNewCDState(e.target.value)}
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo de Negócio</label>
                        <select
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-400"
                            value={newCDType}
                            onChange={(e) => setNewCDType(e.target.value)}
                        >
                            <option value="FRANQUIA">Franquia</option>
                            <option value="PROPRIO">Próprio (Filial)</option>
                            <option value="HIBRIDO">Híbrido</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-2 text-gray-400 hover:text-white"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleAddCD}
                        disabled={!foundConsultant}
                        className="flex-1 bg-gold-500 text-black font-bold py-2 rounded-lg hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar Cadastro
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL: REPLENISHMENT ORDER DETAILS (CD -> MATRIZ) --- */}
      {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                
                <div className="flex items-center gap-4 mb-6 border-b border-dark-800 pb-4">
                    <div className="p-3 bg-dark-800 rounded-lg text-gold-400">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Pedido #{selectedOrder.id}</h3>
                        <p className="text-sm text-gray-400">Solicitado por {selectedOrder.cdName}</p>
                    </div>
                    <div className="ml-auto">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                            selectedOrder.status === 'PENDENTE' ? 'bg-yellow-900/20 text-yellow-500' :
                            selectedOrder.status === 'ENVIADO' ? 'bg-blue-900/20 text-blue-500' :
                            'bg-green-900/20 text-green-500'
                        }`}>
                            {selectedOrder.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                         <span className="block text-xs text-gray-500 uppercase font-bold">Data</span>
                         <span className="text-white">{selectedOrder.date.split('-').reverse().join('/')}</span>
                     </div>
                     <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                         <span className="block text-xs text-gray-500 uppercase font-bold">Frete Escolhido</span>
                         <span className="text-white">{selectedOrder.shippingMethod}</span>
                     </div>
                </div>

                <div className="max-h-[200px] overflow-y-auto mb-6 pr-2">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-800 text-gray-500 uppercase font-bold text-xs sticky top-0">
                            <tr>
                                <th className="px-3 py-2">Item</th>
                                <th className="px-3 py-2 text-right">Qtd</th>
                                <th className="px-3 py-2 text-right">Unit.</th>
                                <th className="px-3 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {selectedOrder.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 text-white">{item.name} <span className="text-xs text-gray-600 ml-1">({item.sku})</span></td>
                                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                                    <td className="px-3 py-2 text-right">R$ {item.unitCost.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right font-bold text-gold-400">R$ {(item.quantity * item.unitCost).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center text-lg font-bold text-white border-t border-dark-800 pt-4 mb-6">
                    <span>Total do Pedido</span>
                    <span>R$ {selectedOrder.totalValue.toFixed(2)}</span>
                </div>

                {/* ACTIONS AREA */}
                {selectedOrder.status === 'PENDENTE' && (
                    <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Despachar Pedido</label>
                         <div className="flex gap-2">
                             <input 
                                type="text" 
                                placeholder="Insira o Código de Rastreio..." 
                                className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-400"
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                             />
                             <button 
                                onClick={handleDispatchOrder}
                                disabled={!trackingInput}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 <Send size={16} /> Enviar
                             </button>
                         </div>
                    </div>
                )}

                {selectedOrder.status === 'ENVIADO' && (
                     <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl flex items-center gap-3">
                         <Truck className="text-blue-400" />
                         <div>
                             <p className="text-blue-400 font-bold text-sm">Pedido Enviado</p>
                             <p className="text-gray-400 text-xs">Rastreio: <span className="text-white font-mono">{selectedOrder.trackingCode}</span></p>
                         </div>
                     </div>
                )}
             </div>
          </div>
      )}

      {/* --- MODAL: GLOBAL SALE DETAIL (CD -> CONSUMIDOR) --- */}
      {selectedGlobalSale && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                 <button onClick={() => setSelectedGlobalSale(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>

                 <div className="mb-6 pb-4 border-b border-dark-800">
                     <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag className="text-gold-400" />
                                Venda #{selectedGlobalSale.id}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Realizada em {selectedGlobalSale.date.split('-').reverse().join('/')}</p>
                         </div>
                         <div className="bg-dark-950 px-3 py-2 rounded-lg border border-dark-800 text-right">
                             <p className="text-xs text-gray-500 uppercase font-bold">Origem</p>
                             <p className="text-white font-bold text-sm">{selectedGlobalSale.cdName}</p>
                         </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                         <p className="text-xs text-gray-500 uppercase font-bold mb-1">Consultor Comprador</p>
                         <p className="text-white font-medium">{selectedGlobalSale.consultantName}</p>
                         <p className="text-xs text-gray-500">PIN: {selectedGlobalSale.consultantPin}</p>
                     </div>
                     <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                         <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pontuação Gerada</p>
                         <p className="text-blue-400 font-bold text-lg">{selectedGlobalSale.totalPoints} VP</p>
                     </div>
                 </div>

                 <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Itens Vendidos</h4>
                 <div className="bg-dark-950 rounded-lg border border-dark-800 overflow-hidden mb-6">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-900 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-4 py-2">Produto</th>
                                <th className="px-4 py-2 text-center">Qtd</th>
                                <th className="px-4 py-2 text-right">Unit.</th>
                                <th className="px-4 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {selectedGlobalSale.productsDetail?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-2 text-white">{item.productName}</td>
                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-bold text-gold-400">R$ {(item.quantity * item.unitPrice).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>

                 <div className="flex justify-between items-center text-lg font-bold text-white border-t border-dark-800 pt-4">
                    <span>Total da Venda</span>
                    <span>R$ {selectedGlobalSale.total.toFixed(2)}</span>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default HeadquartersPanel;