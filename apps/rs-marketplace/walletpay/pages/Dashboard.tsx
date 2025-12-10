import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EvolutionChart, IncomeBreakdownChart } from '../components/Chart';
import { IconTrendingUp, IconTrendingDown, IconWallet, IconPayments, IconUsers } from '../constants';
import { MOCK_LEDGER_ENTRIES } from '../constants';
import StatusBadge from '../components/StatusBadge';
import { LedgerEntry } from '../walletpay-types';
import KPICard from '../components/KPICard';
import { walletAPI, sigmaAPI, careerAPI } from '../src/services/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
};

const RecentTransactionItem: React.FC<{ item: LedgerEntry }> = ({ item }) => (
    <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.amount > 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                {item.amount > 0 ? <IconTrendingUp className="w-5 h-5 text-success"/> : <IconTrendingDown className="w-5 h-5 text-danger"/>}
            </div>
            <div className="ml-4">
                <p className="font-semibold text-text-title">{item.description}</p>
                <p className="text-sm text-text-body">{new Date(item.occurredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`font-bold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.amount)}</p>
            <StatusBadge status={item.state} />
        </div>
    </div>
);


const Dashboard: React.FC = () => {
    // State for infinite scroll
    const ITEMS_PER_PAGE = 5;
    const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const listRef = useRef<HTMLDivElement>(null);

    // Estado para dados da API
    const [apiData, setApiData] = useState({
        balance: 0,
        monthlyIncome: 0,
        newNetworkMembers: 0,
        salesVolume: 0,
    });

    const summaryData = useMemo(() => {
        // Se tiver dados da API, usa eles, senão usa mock
        if (apiData.balance > 0 || !loadingData) {
            return apiData;
        }
        
        const balance = MOCK_LEDGER_ENTRIES[0]?.balanceAfter || 0;
        const monthlyIncome = MOCK_LEDGER_ENTRIES
            .filter(e => e.amount > 0 && new Date(e.occurredAt).getMonth() === new Date().getMonth())
            .reduce((sum, e) => sum + e.amount, 0);
        
        return {
            balance,
            monthlyIncome,
            newNetworkMembers: 0,
            salesVolume: 0,
        };
    }, [apiData, loadingData]);

    useEffect(() => {
        // Carregar dados da API
        const loadDashboardData = async () => {
            try {
                setLoadingData(true);
                
                // TODO: Pegar userId do localStorage ou context
                const userId = localStorage.getItem('userId') || 'demo-user';
                
                // Buscar dados em paralelo
                const [balanceRes, transactionsRes, statsRes] = await Promise.all([
                    walletAPI.getBalance(userId).catch(() => null),
                    walletAPI.getTransactions(userId, { limit: ITEMS_PER_PAGE }).catch(() => null),
                    sigmaAPI.getStats(userId).catch(() => null),
                ]);

                // Atualizar saldo
                if (balanceRes?.data?.success) {
                    const balance = balanceRes.data.balance.available * 100; // Converter para centavos
                    setApiData(prev => ({ ...prev, balance }));
                }

                // Atualizar transações
                if (transactionsRes?.data?.success) {
                    setTransactions(transactionsRes.data.transactions);
                    setHasMore(transactionsRes.data.transactions.length >= ITEMS_PER_PAGE);
                } else {
                    // Fallback para mock
                    const recentActivity = MOCK_LEDGER_ENTRIES.filter(e => e.state !== 'pending');
                    setTransactions(recentActivity.slice(0, ITEMS_PER_PAGE));
                    setHasMore(recentActivity.length > ITEMS_PER_PAGE);
                }

                // Atualizar stats da rede
                if (statsRes?.data?.success) {
                    setApiData(prev => ({
                        ...prev,
                        newNetworkMembers: statsRes.data.stats.new_members_month || 0,
                        salesVolume: (statsRes.data.stats.volume_month || 0) * 100,
                    }));
                }

                setLoadingData(false);
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error);
                setLoadingData(false);
                
                // Fallback para mock em caso de erro
                const recentActivity = MOCK_LEDGER_ENTRIES.filter(e => e.state !== 'pending');
                setTransactions(recentActivity.slice(0, ITEMS_PER_PAGE));
                setHasMore(recentActivity.length > ITEMS_PER_PAGE);
            }
        };

        loadDashboardData();
    }, []);

    const loadMoreTransactions = () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            const nextPage = page + 1;
            const recentActivity = MOCK_LEDGER_ENTRIES.filter(e => e.state !== 'pending');
            const newTransactions = recentActivity.slice(0, nextPage * ITEMS_PER_PAGE);
            
            setTransactions(newTransactions);
            setPage(nextPage);
            setHasMore(newTransactions.length < MOCK_LEDGER_ENTRIES.length);
            setIsLoading(false);
        }, 500); // 0.5s delay for loading simulation
    };

     const handleScroll = () => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            // Check if user is near the bottom, with a small threshold
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                loadMoreTransactions();
            }
        }
    };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Link to="/app/transactions" className="group">
            <KPICard title="Saldo Atual" value={formatCurrency(summaryData.balance)} icon={<IconWallet className="w-6 h-6" />} />
          </Link>
          <Link to="/app/reports" className="group">
            <KPICard title="Ganhos no Mês" value={formatCurrency(summaryData.monthlyIncome)} icon={<IconTrendingUp className="w-6 h-6" />} />
          </Link>
          <Link to="/app/network" className="group">
            <KPICard title="Novos na Rede (Mês)" value="+0" icon={<IconUsers className="w-6 h-6" />} />
          </Link>
          <Link to="/app/payments" className="group">
            <KPICard title="Volume de Vendas (Mês)" value={formatCurrency(summaryData.salesVolume)} icon={<IconPayments className="w-6 h-6" />} />
          </Link>
      </div>

      <EvolutionChart />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
            <IncomeBreakdownChart />
        </div>
        <div className="lg:col-span-3 bg-card p-6 rounded-2xl border border-border flex flex-col h-96">
          <h3 className="text-lg font-semibold text-text-title mb-4 shrink-0">Atividade Recente</h3>
          <div 
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pr-2"
          >
            <div className="divide-y divide-border">
                {transactions.map(item => (
                    <RecentTransactionItem key={item.seq} item={item} />
                ))}
            </div>
            {isLoading && <p className="text-center py-4 text-sm text-text-soft">Carregando...</p>}
            {!hasMore && transactions.length > 0 && <p className="text-center py-4 text-sm text-text-soft">Fim das transações</p>}
            {transactions.length === 0 && <p className="text-center py-4 text-sm text-text-soft">Nenhuma atividade recente.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


