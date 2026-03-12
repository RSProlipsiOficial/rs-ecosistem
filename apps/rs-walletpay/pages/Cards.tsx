import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { LedgerEntry, LedgerEventType } from '../types';
import { walletAPI } from '../src/services/api';
import { getWalletUserId, readWalletSession } from '../src/utils/walletSession';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString('pt-BR') : 'Sem movimentacao';

const IconList = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const IconChip = ({ className = 'w-10 h-10' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="6" width="6" height="8" rx="1"></rect>
    <path d="M12 6h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5Z"></path>
    <path d="M3 10h6"></path>
    <path d="M12 10h6"></path>
    <path d="M15 6v8"></path>
  </svg>
);

const CardDisplay: React.FC<{ cardholderName: string; consultantId: string }> = ({ cardholderName, consultantId }) => (
  <div className="w-full max-w-sm mx-auto aspect-[1.586] bg-gradient-to-br from-card to-surface rounded-2xl p-6 flex flex-col justify-between text-white shadow-custom-lg relative overflow-hidden">
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full"></div>
    <div className="absolute -bottom-16 -left-12 w-48 h-48 bg-gold/5 rounded-full"></div>

    <div className="flex justify-between items-start z-10">
      <div>
        <h3 className="font-bold text-xl text-gold">RS WalletPay</h3>
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/70 mt-1">Cartao em homologacao</p>
      </div>
      <IconChip className="text-gold/50" />
    </div>

    <div className="z-10">
      <p className="text-2xl font-mono tracking-widest">**** **** **** 0000</p>
    </div>

    <div className="flex justify-between items-end z-10 gap-4">
      <div>
        <p className="text-xs uppercase text-text-soft">Titular</p>
        <p className="font-semibold">{(cardholderName || 'Consultor RS').toUpperCase()}</p>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase text-text-soft">ID do consultor</p>
        <p className="font-semibold">{consultantId || 'Nao vinculado'}</p>
      </div>
    </div>
  </div>
);

const SummaryCard: React.FC<{ label: string; value: string; detail: string }> = ({ label, value, detail }) => (
  <div className="bg-card p-5 rounded-2xl border border-border">
    <p className="text-xs uppercase tracking-[0.24em] text-text-soft">{label}</p>
    <p className="text-2xl font-bold text-text-title mt-2">{value}</p>
    <p className="text-sm text-text-body mt-2">{detail}</p>
  </div>
);

const Cards: React.FC = () => {
  const session = readWalletSession();
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const userId = getWalletUserId();
        if (!userId) {
          setTransactions([]);
          return;
        }

        const response = await walletAPI.getTransactions(userId, { limit: 50 });
        if (response?.data?.success) {
          setTransactions(response.data.transactions || []);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Erro ao carregar transacoes do cartao:', error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTransactions();
  }, []);

  const cardTransactions = useMemo(
    () =>
      transactions.filter(
        (entry) => entry.type === LedgerEventType.PURCHASE || entry.type === LedgerEventType.PAYMENT_RECEIVED
      ),
    [transactions]
  );

  const recentTransactions = useMemo(() => cardTransactions.slice(0, 5), [cardTransactions]);

  const totalSpent = useMemo(
    () =>
      Math.abs(
        cardTransactions
          .filter((entry) => entry.type === LedgerEventType.PURCHASE)
          .reduce((sum, entry) => sum + Math.min(entry.amount, 0), 0)
      ),
    [cardTransactions]
  );

  const totalReceived = useMemo(
    () =>
      cardTransactions
        .filter((entry) => entry.amount > 0)
        .reduce((sum, entry) => sum + entry.amount, 0),
    [cardTransactions]
  );

  const latestTransaction = recentTransactions[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-title">Meus Cartoes</h1>
        <p className="text-text-body mt-1">
          A tela do cartao agora mostra somente o que ja esta ligado ao sistema: titular, atividade e extrato real.
        </p>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-text-body">
        O cartao fisico e virtual ainda esta em homologacao. Enquanto isso, o extrato abaixo acompanha as compras e
        creditos que ja chegaram na sua carteira.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-8 items-start">
        <div className="space-y-6">
          <CardDisplay cardholderName={session.userName || ''} consultantId={session.userId || ''} />

          <button
            onClick={() => setIsStatementOpen(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-card border border-border hover:bg-surface hover:border-gold transition-all"
          >
            <span className="p-3 rounded-full bg-surface text-gold">
              <IconList className="w-5 h-5" />
            </span>
            <span className="text-sm font-semibold text-text-title">Abrir extrato completo</span>
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Compras no cartao"
              value={formatCurrency(totalSpent)}
              detail={`${cardTransactions.filter((entry) => entry.type === LedgerEventType.PURCHASE).length} compra(s) registrada(s)`}
            />
            <SummaryCard
              label="Creditos vinculados"
              value={formatCurrency(totalReceived)}
              detail="Lancamentos positivos ligados ao mesmo historico"
            />
            <SummaryCard
              label="Ultima movimentacao"
              value={latestTransaction ? formatCurrency(latestTransaction.amount) : 'R$ 0,00'}
              detail={formatDate(latestTransaction?.occurredAt)}
            />
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-title">Atividade recente</h3>
                <p className="text-sm text-text-body">Ultimas movimentacoes reais relacionadas ao cartao.</p>
              </div>
              {isLoading ? <span className="text-sm text-text-soft">Carregando...</span> : null}
            </div>

            <div className="space-y-2">
              {!isLoading && recentTransactions.length === 0 ? (
                <p className="text-text-soft text-center py-8">Nenhuma transacao de cartao encontrada ate agora.</p>
              ) : null}

              {recentTransactions.map((item) => (
                <div key={item.seq} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface">
                  <div>
                    <p className="font-semibold text-text-title">{item.description}</p>
                    <p className="text-sm text-text-soft">{formatDate(item.occurredAt)}</p>
                  </div>
                  <p className={`font-bold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isStatementOpen} onClose={() => setIsStatementOpen(false)} title="Extrato do cartao">
        <div className="space-y-2">
          {cardTransactions.length > 0 ? (
            cardTransactions.map((item) => (
              <div key={`${item.seq}-${item.refId}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface">
                <div>
                  <p className="font-semibold text-text-title">{item.description}</p>
                  <p className="text-sm text-text-soft">{formatDate(item.occurredAt)}</p>
                </div>
                <p className={`font-bold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-text-soft text-center py-8">Nenhuma movimentacao de cartao encontrada.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Cards;
