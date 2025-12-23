import React from 'react';
import { LedgerState } from '../walletpay-types';

interface StatusBadgeProps {
  status: LedgerState;
}

const statusConfig = {
  [LedgerState.POSTED]: { text: 'Postado', color: 'neutral' },
  [LedgerState.PAID]: { text: 'Pago', color: 'success' },
  [LedgerState.PENDING]: { text: 'Pendente', color: 'warning' },
  [LedgerState.HELD]: { text: 'Retido', color: 'warning' },
  [LedgerState.REVERSED]: { text: 'Revertido', color: 'danger' },
  [LedgerState.FAILED]: { text: 'Falhou', color: 'danger' },
};

const colorClasses: { [key: string]: string } = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-border/20 text-text-body border-border/40',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || { text: status, color: 'neutral' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses[config.color]}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;
