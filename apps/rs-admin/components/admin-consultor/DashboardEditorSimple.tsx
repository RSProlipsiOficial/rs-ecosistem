import React, { useState } from 'react';
import Card from '../Card';

const DashboardEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('widgets');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#FFD700] mb-6">Editor de Dashboard do Consultor</h1>
      
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('widgets')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'widgets' 
              ? 'bg-[#FFD700] text-[#121212]' 
              : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
          }`}
        >
          Widgets
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'layout' 
              ? 'bg-[#FFD700] text-[#121212]' 
              : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setActiveTab('personalization')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'personalization' 
              ? 'bg-[#FFD700] text-[#121212]' 
              : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
          }`}
        >
          Personalização
        </button>
      </div>

      {activeTab === 'widgets' && (
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Gerenciar Widgets</h2>
          <div className="space-y-3">
            {['Bônus do Mês', 'Progresso de Carreira', 'Rede Direta', 'Visão Geral SIGME'].map((widget) => (
              <div key={widget} className="flex items-center justify-between p-3 bg-[#121212] rounded-lg border border-[#2A2A2A]">
                <span className="text-white">{widget}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Visível
                  </button>
                  <button className="px-3 py-1 bg-[#2A2A2A] text-white rounded hover:bg-[#3A3A3A] text-sm">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'layout' && (
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Configurar Layout</h2>
          <p className="text-gray-400">
            Configure a disposição dos elementos no dashboard do consultor.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#121212] border-2 border-dashed border-[#FFD700] rounded-lg text-center text-gray-400">
              Zona 1
            </div>
            <div className="p-4 bg-[#121212] border-2 border-dashed border-[#2A2A2A] rounded-lg text-center text-gray-400">
              Zona 2
            </div>
            <div className="p-4 bg-[#121212] border-2 border-dashed border-[#2A2A2A] rounded-lg text-center text-gray-400">
              Zona 3
            </div>
            <div className="p-4 bg-[#121212] border-2 border-dashed border-[#2A2A2A] rounded-lg text-center text-gray-400">
              Zona 4
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'personalization' && (
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Personalização</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Título do Dashboard</label>
              <input 
                type="text"
                defaultValue="Painel do Consultor"
                className="w-full bg-[#121212] p-3 rounded-md border border-[#2A2A2A] focus:ring-2 focus:ring-[#FFD700] focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Mensagem de Boas-Vindas</label>
              <textarea
                defaultValue="Bem-vindo ao seu escritório digital!"
                rows={3}
                className="w-full bg-[#121212] p-3 rounded-md border border-[#2A2A2A] focus:ring-2 focus:ring-[#FFD700] focus:outline-none text-white"
              />
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-500 text-sm">
          ℹ️ <strong>Em Desenvolvimento:</strong> Este módulo permite personalizar o dashboard dos consultores. 
          Funcionalidades avançadas serão implementadas em breve.
        </p>
      </div>

      <div className="mt-4 flex gap-4">
        <button className="px-6 py-3 bg-[#FFD700] text-[#121212] font-semibold rounded-lg hover:bg-[#FFE84D] transition-colors">
          Salvar Configurações
        </button>
        <button className="px-6 py-3 bg-[#2A2A2A] text-white font-semibold rounded-lg hover:bg-[#3A3A3A] transition-colors">
          Visualizar Preview
        </button>
      </div>
    </div>
  );
};

export default DashboardEditor;
