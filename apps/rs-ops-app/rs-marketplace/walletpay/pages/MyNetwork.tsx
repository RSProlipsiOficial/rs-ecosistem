

import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_NETWORK_CONSULTANTS } from '../constants';
import { Consultant } from '../walletpay-types';
import Modal from '../components/Modal';
import { sigmaAPI } from '../src/services/api';

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-border/50 text-sm items-center">
        <span className="text-text-soft capitalize">{label}</span>
        <span className="font-semibold text-text-title text-right">{value || 'N/A'}</span>
    </div>
);

const ConsultantCard: React.FC<{ consultant: Consultant, onDetailsClick: () => void; }> = ({ consultant, onDetailsClick }) => {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-custom-lg transition-all duration-300 hover:border-gold hover:shadow-gold/10 flex flex-col text-center items-center">
      <img src={consultant.avatarUrl} alt={consultant.name} className="w-20 h-20 rounded-full border-4 border-surface mb-4" />
      <h3 className="font-bold text-text-title text-lg">{consultant.name}</h3>
      <p className="text-sm text-text-soft mb-2">ID: {consultant.id}</p>
      <div className="my-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20">
        {consultant.pin}
      </div>
      <div className="flex items-center text-sm mt-2">
        <span className={`w-2.5 h-2.5 rounded-full mr-2 ${consultant.status === 'active' ? 'bg-success' : 'bg-text-soft/50'}`}></span>
        {consultant.status === 'active' ? 'Ativo' : 'Inativo'}
      </div>
      <button onClick={onDetailsClick} className="mt-4 w-full px-4 py-2 text-sm font-semibold rounded-lg bg-surface text-text-body hover:bg-gold hover:text-base border border-border hover:border-gold transition-colors">
        Ver Detalhes
      </button>
    </div>
  );
};


const MyNetwork: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
    const [loading, setLoading] = useState(false);
    const [networkData, setNetworkData] = useState<Consultant[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const loadNetwork = async () => {
            try {
                setLoading(true);
                const userId = localStorage.getItem('userId') || 'demo-user';
                
                const [networkRes, statsRes] = await Promise.all([
                    sigmaAPI.getDownlines(userId).catch(() => null),
                    sigmaAPI.getStats(userId).catch(() => null)
                ]);
                
                if (networkRes?.data?.success) {
                    setNetworkData(networkRes.data.downlines);
                }
                
                if (statsRes?.data?.success) {
                    setStats(statsRes.data.stats);
                }
            } catch (error) {
                console.error('Erro ao carregar rede:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadNetwork();
    }, []);

    const filteredConsultants = useMemo(() => {
        if (!searchTerm.trim()) {
            return MOCK_NETWORK_CONSULTANTS;
        }
        return MOCK_NETWORK_CONSULTANTS.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleCloseModal = () => setSelectedConsultant(null);

    const renderModalContent = () => {
        if (!selectedConsultant) return null;

        return (
            <div className="space-y-2">
                <div className="flex flex-col items-center pb-4 mb-2 border-b border-border/50">
                    <img src={selectedConsultant.avatarUrl} alt={selectedConsultant.name} className="w-24 h-24 rounded-full border-4 border-surface mb-4" />
                    <h3 className="font-bold text-text-title text-xl">{selectedConsultant.name}</h3>
                    <p className="text-sm text-text-soft">ID: {selectedConsultant.id}</p>
                </div>
                <DetailRow label="PIN" value={selectedConsultant.pin} />
                <DetailRow label="Status" value={
                    <div className="flex items-center justify-end">
                        <span className={`w-2.5 h-2.5 rounded-full mr-2 ${selectedConsultant.status === 'active' ? 'bg-success' : 'bg-text-soft/50'}`}></span>
                        {selectedConsultant.status === 'active' ? 'Ativo' : 'Inativo'}
                    </div>
                } />
                {/* Mock data for illustration */}
                <DetailRow label="Email" value="email@exemplo.com" />
                <DetailRow label="Telefone" value="(99) 99999-9999" />
                <DetailRow label="Membro Desde" value="12/08/2023" />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-4 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-text-title">Minha Rede</h2>
                <div className="relative w-full sm:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou ID..."
                        className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            {filteredConsultants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredConsultants.map(consultant => (
                        <ConsultantCard key={consultant.id} consultant={consultant} onDetailsClick={() => setSelectedConsultant(consultant)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-text-body bg-card rounded-2xl border border-border">
                  <p>Nenhum consultor encontrado.</p>
                </div>
            )}

            <Modal isOpen={!!selectedConsultant} onClose={handleCloseModal} title="Detalhes do Consultor">
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default MyNetwork;


