
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { MonthlySummary, Order, TrafficSpend, Product, AppAlert, AlertType, User } from '../types';
import { TrendingUp, DollarSign, Activity, AlertCircle, ShoppingBag, Users, Calendar, AlertTriangle, TrendingDown, Package, Filter, BarChart as BarChartIcon } from 'lucide-react';

interface DashboardProps {
  summary: MonthlySummary;
  orders: Order[];
  trafficData: TrafficSpend[];
  products: Product[];
  alerts: AppAlert[];
  onAnalyze: () => void;
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  currentMonth: string;
  onMonthChange: (month: string) => void;
  currentUser: User;
  users: User[];
  selectedLogistaId: string;
  onLogistaChange: (userId: string) => void;
  setActiveTab: (tab: string) => void;
  onAlertClick: (alert: AppAlert) => void; // PRT-030
}

const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const ICONS: Record<AlertType, React.ReactElement> = {
    LOW_STOCK: <Package size={20} />,
    NEGATIVE_ROI_STREAK: <TrendingDown size={20} />,
    LOW_PRODUCT_MARGIN: <BarChartIcon size={20} />,
    HIGH_RETURN_RATE: <AlertTriangle size={20} />,
};

interface AlertCardProps {
    alert: AppAlert;
    onClick: (alert: AppAlert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
    const isCritical = alert.severity === 'CRITICAL';
    const colors = isCritical 
        ? 'border-red-500/40 bg-red-900/20 text-red-300' 
        : 'border-yellow-500/40 bg-yellow-900/20 text-yellow-300';
    
    // PRT-030: Added hover effects and onClick handler
    return (
        <div 
            onClick={() => onClick(alert)}
            className={`flex items-start gap-4 p-4 rounded-xl border ${colors} shadow-lg cursor-pointer hover:scale-[1.01] transition-transform duration-200`}
            title="Clique para resolver este alerta"
        >
            <div className={`mt-1 ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                {ICONS[alert.type]}
            </div>
            <div>
                <h4 className={`font-bold ${isCritical ? 'text-red-300' : 'text-yellow-300'}`}>{alert.title}</h4>
                <p className="text-sm text-slate-400">{alert.message}</p>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  summary, 
  orders, 
  trafficData, 
  alerts,
  onAnalyze, 
  isAnalyzing, 
  aiAnalysis,
  currentMonth,
  onMonthChange,
  currentUser,
  users,
  selectedLogistaId,
  onLogistaChange,
  setActiveTab,
  onAlertClick
}) => {
  
  const dailyData = useMemo(() => {
    const dataMap = new Map<string, { date: string, revenue: number, spend: number }>();
    trafficData.forEach(ad => {
       const date = ad.date;
       const current = dataMap.get(date) || { date, revenue: 0, spend: 0 };
       current.spend += ad.amountSpent;
       dataMap.set(date, current);
    });
    orders.forEach(order => {
      const date = order.date;
      const current = dataMap.get(date) || { date, revenue: 0, spend: 0 };
      const orderRevenue = order.itemsTotal + order.shippingCharged - order.discountTotal;
      current.revenue += orderRevenue;
      dataMap.set(date, current);
    });
    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [orders, trafficData]);

  const productData = useMemo(() => {
    const dataMap = new Map<string, { name: string, sales: number, revenue: number }>();
    orders.forEach(order => {
       order.items.forEach(item => {
          const current = dataMap.get(item.productName) || { name: item.productName, sales: 0, revenue: 0 };
          current.sales += item.quantity;
          current.revenue += (item.unitPrice * item.quantity); 
          dataMap.set(item.productName, current);
       });
    });
    return Array.from(dataMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [orders]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-rs-card border border-rs-goldDim/20 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Dashboard Mensal</h2>
          <p className="text-sm text-slate-400">Visão geral da operação</p>
        </div>
        <div className="flex items-center gap-2">
           {currentUser.role === 'Admin' && (
             <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/10">
                <Filter size={18} className="text-slate-400" />
                <select 
                    value={selectedLogistaId}
                    onChange={(e) => onLogistaChange(e.target.value)}
                    className="bg-transparent text-slate-200 text-sm outline-none cursor-pointer font-medium"
                >
                    <option value="all" className="bg-rs-dark text-white">Todos Logistas</option>
                    {users.filter(u => u.role === 'Logista').map(u => (
                        <option key={u.id} value={u.id} className="bg-rs-dark text-white">{u.name}</option>
                    ))}
                </select>
             </div>
           )}
           <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/10">
              <Calendar size={18} className="text-rs-gold" />
              <input 
                type="month" 
                value={currentMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-slate-200 text-sm outline-none cursor-pointer font-medium"
              />
           </div>
        </div>
      </div>
      
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-slate-300 flex items-center gap-2"><AlertTriangle size={18} className="text-yellow-400"/> Alertas e Insights do Mês</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onClick={onAlertClick} />
            ))}
          </div>
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard onClick={() => setActiveTab('orders')} title="Faturamento" value={formatCurrency(summary.grossRevenue)} icon={<DollarSign className="text-rs-gold" size={18} />} trend="Bruto"/>
        <KPICard onClick={() => setActiveTab('orders')} title="Lucro Líquido" value={formatCurrency(summary.netProfit)} icon={<TrendingUp className="text-emerald-500" size={18} />} trend={`${summary.profitMargin.toFixed(1)}% Margem`} trendColor="text-emerald-400"/>
        <KPICard onClick={() => setActiveTab('traffic')} title="Investimento Ads" value={formatCurrency(summary.adSpend)} icon={<Activity className="text-blue-400" size={18} />} trend="Tráfego Pago"/>
        <KPICard onClick={() => setActiveTab('orders')} title="ROI Global" value={`${summary.globalRoi.toFixed(0)}%`} icon={<TrendingUp className="text-rs-gold" size={18} />} trend="Retorno Total"/>
        <KPICard onClick={() => setActiveTab('orders')} title="Ticket Médio" value={formatCurrency(summary.avgTicket)} icon={<ShoppingBag className="text-purple-400" size={18} />} trend={`${summary.ordersCount} Pedidos`}/>
        <KPICard onClick={() => setActiveTab('leads')} title="Leads Ads" value={summary.leadsFromTraffic} icon={<Users className="text-orange-400" size={18} />} trend={`${summary.leadConversionRate.toFixed(1)}% Conv.`}/>
      </div>

      {/* Financial Statement (DRE) */}
      <div className="bg-rs-card border border-rs-goldDim/20 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
           <h3 className="font-bold text-slate-200">Demonstrativo Financeiro (DRE)</h3>
           <span className="text-xs text-slate-500 uppercase tracking-wider">Competência: {currentMonth.split('-').reverse().join('/')}</span>
        </div>
        <div className="p-6">
           <div className="space-y-3 text-sm">
              <DRERow label="Faturamento Bruto" value={summary.grossRevenue} isPositive />
              <DRERow label="(-) Descontos Concedidos" value={summary.discounts} isNegative />
              <DRERow label="(-) Devoluções e Reembolsos" value={summary.refundsAndChargebacks} isNegative />
              <div className="h-px bg-white/10 my-2"></div>
              <DRERow label="(=) Receita Líquida" value={summary.netSales} isTotal />
              <div className="pt-4 space-y-2 pl-4 border-l border-white/5">
                 <DRERow label="(-) Custo dos Produtos" value={summary.productCost} isNegative small />
                 <DRERow label="(-) Custo de Frete (Loja)" value={summary.shippingCost} isNegative small />
                 <DRERow label="(+) Receita de Frete" value={summary.shippingRevenue} isPositive small />
                 <DRERow label="(-) Taxas (Gateway + Plat.)" value={summary.taxCost} isNegative small />
                 <DRERow label="(-) Outras Despesas" value={summary.otherExpenses} isNegative small />
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <DRERow label="(=) Lucro Bruto (Margem de Contribuição)" value={summary.grossProfit} isTotal color={summary.grossProfit > 0 ? 'text-emerald-400' : 'text-red-400'} />
              <div className="pt-4 pl-4 border-l border-white/5">
                 <DRERow label="(-) Investimento em Tráfego" value={summary.adSpend} isNegative />
              </div>
              <div className="h-px bg-rs-gold/30 my-4"></div>
              <div className="flex justify-between items-end p-4 bg-rs-gold/5 rounded-lg border border-rs-gold/20">
                 <span className="text-lg font-bold text-rs-gold">(=) Lucro Líquido Final</span>
                 <div className="text-right">
                   <span className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{formatCurrency(summary.netProfit)}</span>
                   <div className="text-xs text-slate-500 mt-1">Margem: {summary.profitMargin.toFixed(2)}%</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-rs-card border border-rs-goldDim/30 rounded-xl p-6 shadow-lg">
          <h3 className="text-slate-200 font-semibold mb-6 text-lg flex items-center gap-2"><Activity size={20} className="text-rs-gold" />Investimento x Faturamento Diário</h3>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={dailyData}><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(val) => val.slice(8)} tickMargin={10} /><YAxis stroke="#666" fontSize={12} tickFormatter={(val) => `R$${val/1000}k`} /><Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff' }} formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Data: ${label}`}/><Legend verticalAlign="top" height={36} /><Line type="monotone" dataKey="revenue" name="Faturamento" stroke="#d4af37" strokeWidth={3} dot={{r: 4, fill: '#d4af37', strokeWidth: 0}} activeDot={{r: 6}}/><Line type="monotone" dataKey="spend" name="Investimento" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444', strokeWidth: 0}} activeDot={{r: 6}}/></LineChart></ResponsiveContainer></div>
        </div>
        <div className="bg-rs-card border border-rs-goldDim/30 rounded-xl p-6 shadow-lg">
          <h3 className="text-slate-200 font-semibold mb-6 text-lg flex items-center gap-2"><ShoppingBag size={20} className="text-emerald-400" />Vendas por Produto (Top 10 Receita)</h3>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={productData} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} /><XAxis type="number" stroke="#666" fontSize={12} hide /><YAxis dataKey="name" type="category" stroke="#999" fontSize={12} width={100} /><Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff' }} formatter={(value: number) => formatCurrency(value)}/><Bar dataKey="revenue" name="Receita Total" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30}/></BarChart></ResponsiveContainer></div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-r from-rs-card to-rs-dark border border-rs-gold/40 rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={100} className="text-rs-gold" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-rs-gold flex items-center gap-2"><span className="bg-rs-gold/20 p-1.5 rounded-lg">AI</span>Consultor RS Drop</h3>
          <button onClick={onAnalyze} disabled={isAnalyzing} className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${isAnalyzing ? 'bg-rs-goldDim text-gray-300 cursor-not-allowed' : 'bg-rs-gold hover:bg-yellow-500 text-rs-black shadow-lg shadow-yellow-500/20'}`}>{isAnalyzing ? 'Analisando...' : 'Gerar Análise Estratégica'}</button>
        </div>
        {aiAnalysis ? (
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed bg-black/30 p-4 rounded-lg border border-white/10"><div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong class="text-rs-gold">$1</strong>') }} /></div>
        ) : (
          <div className="text-slate-500 text-sm italic flex items-center gap-2"><AlertCircle size={16} />Clique no botão acima para receber insights da inteligência artificial sobre sua operação.</div>
        )}
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  trend: string;
  trendColor?: string;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendColor, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-rs-card border border-rs-goldDim/20 rounded-xl p-4 shadow-md ${onClick ? 'cursor-pointer hover:border-rs-gold/50 hover:-translate-y-1 transition-all' : ''} flex flex-col justify-between h-full`}
  >
    <div className="flex justify-between items-start mb-2">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</div>
      <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">{icon}</div>
    </div>
    <div>
      <div className="text-xl lg:text-2xl font-bold text-slate-100 mb-1 truncate" title={String(value)}>{value}</div>
      <div className={`text-xs font-medium ${trendColor || 'text-slate-500'}`}>{trend}</div>
    </div>
  </div>
);

const DRERow = ({ label, value, isPositive, isNegative, isTotal, color, small }: any) => (
  <div className={`flex justify-between items-center ${isTotal ? 'font-bold text-slate-200' : 'text-slate-400'} ${small ? 'text-xs' : ''}`}>
    <span>{label}</span>
    <span className={`${color ? color : isTotal ? 'text-slate-200' : isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-300'}`}>{value < 0 ? '-' : ''} {formatCurrency(Math.abs(value))}</span>
  </div>
);
