import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
  subtext?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendColor, subtext, onClick }) => (
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
      {trend && <div className={`text-xs font-medium ${trendColor || 'text-slate-500'}`}>{trend}</div>}
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
  </div>
);