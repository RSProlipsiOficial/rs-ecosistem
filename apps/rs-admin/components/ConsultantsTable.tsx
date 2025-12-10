import React from 'react';
import type { Consultant } from '../types';

interface ConsultantsTableProps {
  consultants: Consultant[];
  onEdit: (consultant: Consultant) => void;
  onResetPassword: (consultant: Consultant) => void;
}

const statusClasses: Record<Consultant['status'], string> = {
  Ativo: 'bg-green-500/10 text-green-400',
  Inativo: 'bg-red-500/10 text-red-400',
  Pendente: 'bg-[#FFD700]/10 text-[#FFD700]',
};

const ConsultantsTable: React.FC<ConsultantsTableProps> = ({ consultants, onEdit, onResetPassword }) => {
  return (
    <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-[#9CA3AF]">
          <thead className="text-xs text-[#FFD700] uppercase bg-[#121212]">
            <tr>
              <th scope="col" className="px-6 py-4">Origem</th>
              <th scope="col" className="px-6 py-4">ID</th>
              <th scope="col" className="px-6 py-4">Nome</th>
              <th scope="col" className="px-6 py-4">PIN</th>
              <th scope="col" className="px-6 py-4">Indicador</th>
              <th scope="col" className="px-6 py-4 hidden lg:table-cell">Saldo (R$)</th>
              <th scope="col" className="px-6 py-4 hidden md:table-cell">Ativo SIGMA</th>
              <th scope="col" className="px-6 py-4 hidden md:table-cell">Ciclos (mês)</th>
              <th scope="col" className="px-6 py-4 hidden lg:table-cell">Pontos Carreira</th>
              <th scope="col" className="px-6 py-4 hidden lg:table-cell">Top SIGMA</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {consultants.length > 0 ? (
              consultants.map((consultant) => (
                <tr key={consultant.id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/50 transition-colors duration-200">
                  <td className="px-6 py-4">{consultant.network || 'Escritório'}</td>
                  <td className="px-6 py-4">{consultant.code || consultant.id}</td>
                  <td className="px-6 py-4 font-medium text-[#E5E7EB] whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="w-10 h-10 rounded-full mr-4 object-cover" src={consultant.avatar} alt={consultant.name} />
                      <div>
                        <div>{consultant.name}</div>
                        <div className="text-xs text-[#9CA3AF]">
                          {(consultant.careerPinCurrent || consultant.pin) && <span>PIN Atual: <span className="text-[#FFD700] font-semibold">{consultant.careerPinCurrent || consultant.pin}</span></span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{consultant.pin}</td>
                  <td className="px-6 py-4">{consultant.sponsor?.name || 'topo'}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{consultant.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${consultant.sigmaActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-300'}`}>{consultant.sigmaActive ? 'Sim' : 'Não'}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">{consultant.sigmaCyclesMonth ?? 0}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{consultant.careerPoints ?? 0}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{consultant.topSigmaPosition ? `${consultant.topSigmaPosition}º` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[consultant.status]}`}>
                      {consultant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onEdit(consultant)}
                          className="font-medium text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => onResetPassword(consultant)}
                          className="font-medium text-red-500 hover:text-red-400 transition-colors"
                        >
                          Resetar Senha
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  Nenhum consultor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultantsTable;
