
import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-custom-lg group-hover:shadow-gold/10 group-hover:border-gold focus-within:ring-2 focus-within:ring-gold/25 transition-all duration-250 h-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text-body">{title}</span>
          <span className="text-2xl lg:text-3xl font-bold text-text-title mt-1">{value}</span>
        </div>
        <div className="p-3 bg-surface rounded-full text-text-body group-hover:text-gold transition-colors duration-250">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
