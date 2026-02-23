import React, { useMemo, useState, FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { mockFullNetwork } from '../data';
import { IconAward, IconUsers, IconGitFork, IconSearch } from '../../components/icons';
import { useDashboardConfig } from '../ConsultantLayout';
import type { NetworkNode } from '../../types';
import { sigmaApi, SigmaConfig } from '../services/sigmaApi';
import PinProgressGauge from '../components/PinProgressGauge';
import NetworkTreeView from '../components/NetworkTreeView';
import { useUser } from '../ConsultantLayout';
import { CDSelector } from '../components/CDSelector';

// Helper to create a flat list of all network members
const flattenNetwork = (node: NetworkNode): NetworkNode[] => {
  if (!node || node.isEmpty) return [];
  const list = [node];
  if (node.children) {
    node.children.forEach(child => {
      list.push(...flattenNetwork(child));
    });
  }
  return list;
};

const CircularProgressIndicator: FC<{ progress: number; color: string; label: string; valueText: string; }> = ({ progress, color, label, valueText }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (circumference * Math.min(progress, 100)) / 100;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="#374151" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.floor(progress)}%</span>
        </div>
      </div>
      <p className="mt-2 font-semibold text-white text-sm">{label}</p>
      <p className="text-xs text-gray-400">{valueText}</p>
    </div>
  );
};

const ProgressIndicators: FC<{ currentCycles: number; nextPin: any; directLines: any[] }> = ({ currentCycles, nextPin, directLines }) => {
  // 1. Ciclos Efetivos
  const vmecPercentages = nextPin.vmec.toString().includes('/') ? nextPin.vmec.toString().split('/').map((p: string) => parseFloat(p) / 100) : [1];
  let effectiveCycles = 0;
  directLines.forEach((line, index) => {
    const vmecLimitPercentage = vmecPercentages[index] || vmecPercentages[vmecPercentages.length - 1];
    const cycleLimit = nextPin.cycles * vmecLimitPercentage;
    effectiveCycles += Math.min(line.totalCycles, cycleLimit);
  });
  const progressCiclos = nextPin.cycles > 0 ? (effectiveCycles / nextPin.cycles) * 100 : (currentCycles >= nextPin.cycles ? 100 : 0);

  // 2. Linhas Qualificadas (assuming a qualified line has >0 cycles)
  const qualifiedLines = directLines.filter(l => l.totalCycles > 0).length;
  const progressLinhas = nextPin.minLines > 0 ? (qualifiedLines / nextPin.minLines) * 100 : 100;

  // 3. Trava VMEc (Linha 1)
  const strongestLine = directLines[0] || { totalCycles: 0 };
  const vmecLimitPercentageLinha1 = vmecPercentages[0] || 1;
  const cycleLimitLinha1 = nextPin.cycles * vmecLimitPercentageLinha1;
  const progressVmec = cycleLimitLinha1 > 0 ? (strongestLine.totalCycles / cycleLimitLinha1) * 100 : 0;


  return (
    <Card>
      <h2 className="text-xl font-bold text-white mb-6 text-center">Requisitos para {nextPin.pin}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <CircularProgressIndicator
          progress={progressCiclos}
          color="#FFD700"
          label="Ciclos Efetivos"
          valueText={`${effectiveCycles.toLocaleString('pt-BR')} / ${nextPin.cycles.toLocaleString('pt-BR')}`}
        />
        <CircularProgressIndicator
          progress={progressLinhas}
          color="#3B82F6"
          label="Linhas Qualificadas"
          valueText={`${qualifiedLines} / ${nextPin.minLines}`}
        />
        <CircularProgressIndicator
          progress={progressVmec}
          color="#10B981"
          label="Trava VMEc (Linha 1)"
          valueText={`${strongestLine.totalCycles.toLocaleString('pt-BR')} / ${cycleLimitLinha1.toLocaleString('pt-BR')}`}
        />
      </div>
    </Card>
  )
};

const PlanoCarreira: React.FC = () => {
  const [apiConfig, setApiConfig] = useState<SigmaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [networkRoot, setNetworkRoot] = useState<NetworkNode | null>(null);
  const [directs, setDirects] = useState<any[]>([]);


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Configuração
        const resConfig = await sigmaApi.getConfig();
        if (resConfig.success) {
          setApiConfig(resConfig.data);
        } else {
          setError(resConfig.error || 'Erro ao carregar configurações');
        }

        // Estatísticas (Ciclos reais)
        const resStats = await sigmaApi.getStats();
        if (resStats.success) {
          setStats(resStats.data);
        }

        // Rede completa para a Árvore
        const resNetwork = await sigmaApi.getDownlines(6, 'matrix');
        if (resNetwork.success) {
          setNetworkRoot(resNetwork.data);
        }

        // Diretos para o VMEc
        const resDirects = await sigmaApi.getDownlines(1, 'directs');
        if (resDirects.success) {
          setDirects(resDirects.data);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pinTable = useMemo(() => {
    if (!apiConfig) return [];
    const pinColors = [
      '#CD7F32', // Bronze
      '#C0C0C0', // Prata
      '#FFD700', // Ouro
      '#0F52BA', // Safira
      '#E0115F', // Rubi
      '#50C878', // Esmeralda
      '#B9F2FF', // Diamante (Azul/Branco)
      '#0000FF', // Diamante Blue
      '#FF0000', // Diamante Red
      '#000000', // Diamante Black
      '#6A0DAD', // Imperial
      '#4169E1', // Royal
      '#DAA520'  // Embaixador
    ];
    return apiConfig.career.pins.map((p, idx) => ({
      pin: p.name,
      cycles: p.cyclesRequired,
      minLines: p.minLinesRequired,
      vmec: p.vmecDistribution,
      bonus: p.rewardValue,
      iconColor: pinColors[idx] || '#FFD700',
      imageUrl: p.imageUrl
    }));
  }, [apiConfig]);

  const currentCycles = stats?.totalCycles || 0; // Dados reais da API

  const { config } = useDashboardConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriterion, setFilterCriterion] = useState<'name' | 'pin' | 'id'>('name');

  const graduatedMembers = useMemo(() => {
    if (!networkRoot) return [];
    return flattenNetwork(networkRoot).filter(m => m.pin && m.pin !== 'Iniciante' && m.pin !== 'Vago');
  }, [networkRoot]);

  const completePinSummary = useMemo(() => {
    // Prioritizar dados REAIS da API se disponíveis
    const apiPinSummary = stats?.pinSummary || {};

    // Fallback: calcular localmente a partir da árvore carregada se a API não trouxer o resumo pronto
    const localPinCounts = graduatedMembers.reduce((acc, member) => {
      if (member.pin) acc[member.pin] = (acc[member.pin] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return pinTable.map(pinInfo => ({
      pin: pinInfo.pin,
      iconColor: pinInfo.iconColor,
      count: apiPinSummary[pinInfo.pin] !== undefined ? apiPinSummary[pinInfo.pin] : (localPinCounts[pinInfo.pin] || 0),
    }));
  }, [graduatedMembers, pinTable, stats]);

  const filteredGraduatedMembers = useMemo(() => {
    if (!searchTerm.trim()) return graduatedMembers;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return graduatedMembers.filter(member => {
      switch (filterCriterion) {
        case 'name':
          return member.name.toLowerCase().includes(lowerCaseSearchTerm);
        case 'pin':
          return member.pin?.toLowerCase().includes(lowerCaseSearchTerm);
        case 'id':
          return member.idConsultor?.toLowerCase().includes(lowerCaseSearchTerm) || member.id.toLowerCase().includes(lowerCaseSearchTerm);
        default:
          return true;
      }
    });
  }, [graduatedMembers, searchTerm, filterCriterion]);


  const { currentPin, nextPin } = useMemo(() => {
    if (pinTable.length === 0) return {
      currentPin: { pin: 'Iniciante', cycles: 0, minLines: 0, vmec: '-', bonus: 0, iconColor: '#9ca3af' },
      nextPin: { pin: 'Aguardando', cycles: 0, minLines: 0, vmec: '-', bonus: 0, iconColor: '#9ca3af' }
    };

    let current = { pin: 'Iniciante', cycles: 0, minLines: 0, vmec: '-', bonus: 0, iconColor: '#9ca3af' };
    let next = pinTable[0];

    for (let i = pinTable.length - 1; i >= 0; i--) {
      if (currentCycles >= pinTable[i].cycles) {
        current = pinTable[i];
        next = pinTable[i + 1] || pinTable[i];
        break;
      }
    }
    return { currentPin: current, nextPin: next };
  }, [pinTable, currentCycles]);

  const directLines = useMemo(() => {
    return directs.map(d => ({
      id: d.id,
      name: d.name,
      avatarUrl: (!d.avatarUrl || d.avatarUrl.includes('0aa67016')) ? `/logo-rs.png` : d.avatarUrl,
      totalCycles: d.totalCycles || 0
    })).sort((a, b) => b.totalCycles - a.totalCycles);
  }, [directs]);

  const vmecPercentages = nextPin.vmec.toString().includes('/')
    ? nextPin.vmec.toString().split('/').map((p: string) => parseFloat(p) / 100)
    : [1];

  let effectiveCyclesTotal = 0;
  const lineContributions = directLines.map((line, index) => {
    const vmecLimitPercentage = vmecPercentages[index] || vmecPercentages[vmecPercentages.length - 1];
    const cycleLimit = nextPin.cycles * vmecLimitPercentage;
    const contribution = Math.min(line.totalCycles, cycleLimit);
    effectiveCyclesTotal += contribution;
    return { ...line, contribution, cycleLimit };
  });

  const overallProgress = nextPin.cycles > 0 ? (effectiveCyclesTotal / nextPin.cycles) * 100 : (currentCycles >= nextPin.cycles ? 100 : 0);

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) return <div className="p-10 text-center text-brand-gold">Carregando plano de carreira...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Erro: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-black text-brand-gold uppercase tracking-tighter">Plano de Carreira SIGME</h1>
        <p className="text-gray-400 mt-0.5 text-[10px] uppercase tracking-widest opacity-60">Sua evolução baseada em ciclos reais e VMEc.</p>
      </div>

      <CDSelector />

      <ProgressIndicators currentCycles={currentCycles} nextPin={nextPin} directLines={directLines} />

      <Card className="py-2">
        <h2 className="text-[10px] font-black text-gray-500 mb-0 text-center uppercase tracking-[0.3em]">Status de Evolução</h2>
        <div className="flex justify-center -mt-8 scale-75 md:scale-80">
          <PinProgressGauge user={{ totalCycles: currentCycles }} apiConfig={apiConfig} pinLogos={config.pinLogos} size="lg" />
        </div>
        <p className="text-center text-[9px] font-black text-gray-400 -mt-6 uppercase tracking-widest">
          Faltam <span className="text-brand-gold">{Math.max(0, nextPin.cycles - effectiveCyclesTotal).toLocaleString('pt-BR')}</span> ciclos para {nextPin.pin}.
        </p>
      </Card>

      <Card>
        <NetworkTreeView />
      </Card>

      <Card>
        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">Relatório de Graduados</h2>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="relative md:col-span-8">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filtrar por ${filterCriterion === 'name' ? 'nome' : filterCriterion === 'pin' ? 'PIN' : 'ID'}...`}
              className="w-full bg-brand-gray border border-white/5 rounded-lg py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-brand-gold focus:outline-none text-sm"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={filterCriterion}
              onChange={(e) => setFilterCriterion(e.target.value as 'name' | 'pin' | 'id')}
              className="w-full bg-brand-gray border border-white/5 rounded-lg py-2.5 px-4 focus:ring-1 focus:ring-brand-gold focus:outline-none text-sm appearance-none cursor-pointer text-gray-300 font-black uppercase tracking-widest"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%239CA3AF' class='w-4 h-4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
            >
              <option value="name">Nome</option>
              <option value="pin">PIN</option>
              <option value="id">ID</option>
            </select>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Total de PINs na Rede</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {completePinSummary.map(({ pin, iconColor, count }) => {
              const logoUrl = pinTable.find(p => p.pin === pin)?.imageUrl;
              const IconComponent = IconAward;
              return (
                <div key={pin} className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl border border-white/5 text-center h-24 hover:bg-white/10 transition-colors">
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${pin} logo`} className="h-8 w-8 object-contain mb-1 drop-shadow-lg" />
                  ) : (
                    <IconComponent size={20} style={{ color: iconColor || '#fff' }} className="mb-1" />
                  )}
                  <p className="font-black text-[10px] text-gray-300 truncate w-full uppercase tracking-tighter">{pin}</p>
                  <p className="font-black text-xl text-brand-gold leading-none">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="overflow-auto max-h-96 pr-2">
          <table className="w-full text-left">
            <thead className="border-b-2 border-brand-gray-light text-sm text-gray-400 sticky top-0 bg-brand-gray">
              <tr>
                <th className="p-3">Consultor</th>
                <th className="p-3">PIN de Carreira</th>
                <th className="p-3 text-center">Nível na Rede</th>
              </tr>
            </thead>
            <tbody>
              {filteredGraduatedMembers.map(member => (
                <tr key={member.id} className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                      <span className="font-semibold text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold" style={{ color: pinTable.find(p => p.pin === member.pin)?.iconColor || '#fff' }}>{member.pin}</span>
                  </td>
                  <td className="p-3 text-center font-mono text-lg">{member.level}</td>
                </tr>
              ))}
              {filteredGraduatedMembers.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">Nenhum graduado encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>


      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Tabela de PINs e Premiações SIGME</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pinTable.map(pin => {
            const isConquered = currentCycles >= pin.cycles;
            const isCurrent = currentPin.pin === pin.pin;
            const logoUrl = config.pinLogos[pin.pin];

            const cardStyle: React.CSSProperties = {};
            let cardClasses = 'flex flex-col p-4 rounded-xl transition-all duration-300 border-2 ';

            if (isCurrent) {
              cardClasses += 'bg-brand-gold/10';
              cardStyle.borderColor = pin.iconColor;
              cardStyle.boxShadow = `0 0 20px ${pin.iconColor}`;
            } else if (isConquered) {
              cardClasses += 'bg-brand-gray-dark';
              cardStyle.borderColor = pin.iconColor;
              cardStyle.boxShadow = `0 0 15px ${pin.iconColor}`;
            } else {
              cardClasses += 'border-brand-gray bg-brand-gray-light';
            }

            return (
              <div key={pin.pin} className={cardClasses} style={cardStyle}>
                <div className="flex-grow flex items-center justify-center mb-4 h-32">
                  {(pin as any).imageUrl ? (
                    <img src={(pin as any).imageUrl} alt={`${pin.pin} logo`} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <IconAward className="h-24 w-24" style={{ color: pin.iconColor || '#9CA3AF' }} />
                  )}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{pin.pin}</h4>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex justify-between"><span className="text-gray-400">Ciclos:</span><span className="font-semibold text-white">{pin.cycles.toLocaleString('pt-BR')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Linhas Mín.:</span><span className="font-semibold text-white">{pin.minLines}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">VMEc %:</span><span className="font-semibold text-white">{pin.vmec}</span></div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-brand-gray-light/50"><span className="text-gray-300 font-semibold">Recompensa:</span><span className="font-bold text-green-400">{formatCurrency(pin.bonus)}</span></div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  );
};

export default PlanoCarreira;