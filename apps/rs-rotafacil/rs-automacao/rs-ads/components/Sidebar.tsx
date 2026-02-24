
import React from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onCreateCampaign: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isDarkMode, onCreateCampaign }) => {
  const menuItems = [
    { id: 'chat', label: 'RS CHAT', icon: 'fa-comment-dots' },
    { id: 'google', label: 'GOOGLE ADS', icon: 'fa-magnifying-glass' },
    { id: 'meta', label: 'META ADS', icon: 'fa-facebook' },
    { id: 'connections', label: 'CONTAS VINCULADAS', icon: 'fa-link' },
    { id: 'optimizations', label: 'OTIMIZAÇÕES', icon: 'fa-bolt' },
    { id: 'alerts', label: 'CENTRAL DE ALERTAS', icon: 'fa-triangle-exclamation' },
    { id: 'details', label: 'DETALHES DO PROJETO', icon: 'fa-file-lines' },
  ];

  const bgColor = isDarkMode ? 'bg-[#0B0B0B]' : 'bg-[#F3F4F6]';
  const textColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-white/5' : 'border-gray-200';

  return (
    <div className={`w-72 ${bgColor} border-r ${borderColor} h-screen fixed left-0 top-0 flex flex-col p-6 z-50 transition-colors duration-300`}>
      {/* Logo Header - RS-ADS Branding */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#D4AF37] text-black' : 'bg-black text-[#D4AF37]'} rounded-lg flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]`}>
            <i className="fas fa-microchip"></i>
          </div>
          <span className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>RS-ADS</span>
        </div>
        <button className={textColor}>
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>

      {/* Project Selector */}
      <div className={`mb-8 p-4 rounded-lg border ${borderColor} ${isDarkMode ? 'bg-white/5' : 'bg-white'} flex justify-between items-center group cursor-pointer hover:border-[#D4AF37]/50 transition-all`}>
        <div className="flex items-center gap-3">
          <i className={`fas fa-city ${isDarkMode ? 'text-[#D4AF37]' : 'text-gray-400'} text-xs`}></i>
          <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-black'}`}>Projeto Rs Prólipsi</span>
        </div>
        <i className="fas fa-chevron-down text-[10px] text-gray-500"></i>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 group ${activeTab === item.id
                ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                : `${textColor} hover:bg-white/5 hover:text-[#D4AF37]`
              }`}
          >
            <i className={`fas ${item.icon} w-5 text-sm`}></i>
            <span className="font-black text-[11px] uppercase tracking-[0.15em]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <div className="text-center mb-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">RS-ADS Versão v1.0.0</p>
        </div>
        {/* Botão Criar Campanha Fiel à Imagem solicitada */}
        <button
          onClick={onCreateCampaign}
          className="w-full py-4 bg-[#121212] border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#D4AF37]/10 transition-all active:scale-95 shadow-lg shadow-black"
        >
          <i className="fas fa-plus text-[10px]"></i> CRIAR CAMPANHA (2/2)
        </button>
        <p className="text-[9px] text-gray-500 italic text-center">IA de Otimização Ativa</p>
      </div>
    </div>
  );
};

export default Sidebar;
