import React from 'react';
import { useAnnouncements } from '../services/useAnnouncements';

interface CommunicationBoardProps {
  audience: 'marketplace' | 'consultor' | 'lojista';
}

const CommunicationBoard: React.FC<CommunicationBoardProps> = ({ audience }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Você precisará obter o tenantId de algum lugar (contexto, localStorage, etc.)
  // Por enquanto, usaremos um valor fixo para teste.
  const tenantId = 'SEU_TENANT_ID_AQUI'; // IMPORTANTE: Substitua pelo seu tenantId real

  const { data: announcements, loading } = useAnnouncements(apiUrl, tenantId, audience);

  return (
    <div className="p-6 bg-dark-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-gold-400 mb-6">Mural de Comunicados</h1>
      
      {loading && <p>Carregando comunicados...</p>}
      
      {!loading && announcements.length === 0 && (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">Nenhum comunicado disponível no momento.</p>
        </div>
      )}

      {!loading && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-dark-800 p-4 rounded-lg border-l-4 border-gold-400">
              <h2 className="text-xl font-semibold text-gold-500">{ann.title}</h2>
              <p className="text-gray-300 mt-2">{ann.message}</p>
              <div className="text-xs text-gray-500 mt-3">
                <span>{new Date(ann.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunicationBoard;
