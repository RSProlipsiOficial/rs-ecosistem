
import React from 'react';
import { KPI } from '../types';

const StatCard: React.FC<KPI> = ({ label, value, change, icon, target, status, recommendation }) => {
  const isPositive = change > 0;

  const statusColor = {
    above: 'text-green-500',
    below: 'text-red-500',
    on_track: 'text-[#D4AF37]'
  }[status];

  const statusBg = {
    above: 'bg-green-500/10',
    below: 'bg-red-500/10',
    on_track: 'bg-[#D4AF37]/10'
  }[status];

  return (
    <div className="bg-[#121212] p-6 rounded-lg border border-white/5 hover:border-[#D4AF37]/30 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#D4AF37]/10 transition-colors">
          <i className={`fas ${icon} text-[#D4AF37]`}></i>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
          <span className="text-[10px] text-gray-600 font-bold">Meta: {target}</span>
        </div>
      </div>

      <div className={`mt-4 pt-4 border-t border-white/5 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${statusColor} animate-pulse`}></div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
            {status === 'above' ? 'Acima da Meta' : status === 'below' ? 'Abaixo da Meta' : 'Em Linha'}
          </span>
        </div>
      </div>

      <div className={`mt-3 p-2 rounded-lg ${statusBg} border border-white/5`}>
        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Ação RS-AI:</p>
        <p className={`text-[11px] font-black uppercase tracking-tight ${statusColor}`}>{recommendation}</p>
      </div>
    </div>
  );
};

export default StatCard;
