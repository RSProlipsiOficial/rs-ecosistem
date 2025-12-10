import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  trend: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-[#1E1E1E] p-6 rounded-xl border border-[#2A2A2A] shadow-lg relative overflow-hidden transition-all duration-300 hover:border-[#FFD700]/50 hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[#9CA3AF]">{title}</p>
          <p className="text-3xl font-bold text-[#E5E7EB] mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-[#2A2A2A] text-[#FFD700]">
          {icon}
        </div>
      </div>
      <p className="text-xs text-[#9CA3AF] mt-4">{trend}</p>
      <div className="absolute -bottom-10 -right-10 opacity-5 text-[#FFD700]">
        {/* FIX: The props of the element being cloned were not known, causing a type error. By ensuring the icon is a valid React element and casting its props to 'any', we can safely clone it and add the className prop. */}
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-28 h-28' })}
      </div>
    </div>
  );
};

export default DashboardCard;