

import React, { useMemo, useState, FC } from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card';
import { mockCareerPlan, mockFullNetwork } from './data';
import { sigmaPinsAPI } from '../../src/services/api';
import { IconAward, IconUsers, IconGitFork, IconSearch } from '../icons';
import { useDashboardConfig } from './hooks';
import type { NetworkNode } from './types';

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

// #region New Progress Indicators
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
  const vmecPercentages = nextPin.vmec.toString().includes('/') ? nextPin.vmec.toString().split('/').map(p => parseFloat(p) / 100) : [1];
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
// #endregion

const PlanoCarreira: React.FC = () => {
  const { currentCycles } = mockCareerPlan;
  const [pinTable, setPinTable] = useState(mockCareerPlan.pinTable);
  const { config } = useDashboardConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriterion, setFilterCriterion] = useState<'name' | 'pin' | 'id'>('name'); // New state for filter criterion
  React.useEffect(() => {
    (async () => {
      try {
        const res = await sigmaPinsAPI.getAll();
        const pins = Array.isArray(res.data?.pins) ? res.data.pins : [];
        if (pins.length) {
          const mapped = pins.sort((a: any, b: any) => a.ordem - b.ordem).map((p: any) => ({
            pin: p.nome,
            cycles: mockCareerPlan.pinTable.find(x => x.pin === p.nome)?.cycles || 0,
            minLines: mockCareerPlan.pinTable.find(x => x.pin === p.nome)?.minLines || 0,
            vmec: mockCareerPlan.pinTable.find(x => x.pin === p.nome)?.vmec || '-',
            bonus: mockCareerPlan.pinTable.find(x => x.pin === p.nome)?.bonus || 0,
            iconColor: mockCareerPlan.pinTable.find(x => x.pin === p.nome)?.iconColor || '#9ca3af'
          }));
          setPinTable(mapped);
        }
      } catch { }
    })();
  }, []);

  // --- Network Analysis ---
  const flatNetwork = useMemo(() => flattenNetwork(mockFullNetwork).slice(1), []); // Exclude the root user
  const totalNetworkMembers = flatNetwork.length;
  const graduatedMembers = useMemo(() => flatNetwork.filter(m => m.pin && m.pin !== 'Iniciante' && m.pin !== 'Vago'), [flatNetwork]);
  const totalGraduates = graduatedMembers.length;

  const completePinSummary = useMemo(() => {
    const existingPinCounts = graduatedMembers.reduce((acc, member) => {
      if (member.pin) {
        acc[member.pin] = (acc[member.pin] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return pinTable.map(pinInfo => ({
      pin: pinInfo.pin,
      iconColor: pinInfo.iconColor,
      count: existingPinCounts[pinInfo.pin] || 0,
    }));
  }, [graduatedMembers, pinTable]);

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


  let currentPin = { pin: 'Iniciante', cycles: 0, minLines: 0, vmec: '-', bonus: 0 };
  let nextPin = pinTable[0];

  for (let i = pinTable.length - 1; i >= 0; i--) {
    if (currentCycles >= pinTable[i].cycles) {
      currentPin = pinTable[i];
      nextPin = pinTable[i + 1] || pinTable[i];
      break;
    }
  }

  const currentPinDetails = pinTable.find(p => p.pin === currentPin.pin) || { pin: 'Iniciante', cycles: 0, minLines: 0, vmec: '-', bonus: 0, iconColor: '#9ca3af' };
  const nextPinDetails = pinTable.find(p => p.pin === nextPin.pin) || nextPin;

  // --- Mock Data & Logic for VMEc Report ---
  const directLines = [
    { id: 'line-1', name: 'Equipe A - Maria Silva', avatarUrl: 'https://i.pravatar.cc/150?u=line-1', totalCycles: 95 },
    { id: 'line-2', name: 'Equipe B - João Costa', avatarUrl: 'https://i.pravatar.cc/150?u=line-2', totalCycles: 50 },
    { id: 'line-3', name: 'Equipe C - Carlos Souza', avatarUrl: 'https://i.pravatar.cc/150?u=line-3', totalCycles: 20 },
    { id: 'line-4', name: 'Equipe D - Juliana Almeida', avatarUrl: 'https://i.pravatar.cc/150?u=line-4', totalCycles: 5 },
  ].sort((a, b) => b.totalCycles - a.totalCycles);

  const vmecPercentages = nextPin.vmec.toString().includes('/')
    ? nextPin.vmec.toString().split('/').map(p => parseFloat(p) / 100)
    : [1];

  let effectiveCycles = 0;
  const lineContributions = directLines.map((line, index) => {
    // For VMEc percentages like 50/30/20, if there are more lines, the last percentage applies to them.
    const vmecLimitPercentage = vmecPercentages[index] || vmecPercentages[vmecPercentages.length - 1];
    const cycleLimit = nextPin.cycles * vmecLimitPercentage;
    const contribution = Math.min(line.totalCycles, cycleLimit);
    effectiveCycles += contribution;
    return { ...line, contribution, cycleLimit };
  });

  const overallProgress = nextPin.cycles > 0 ? (effectiveCycles / nextPin.cycles) * 100 : (currentCycles >= nextPin.cycles ? 100 : 0);

  const formatCurrency = (value: number | string | null | undefined): string => {
    if (value == null || value === '') {
      return 'R$ 0,00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
      return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-gold">Bônus Plano de Carreira - SIGME</h1>
        <p className="text-gray-400 mt-1">Sua evolução de carreira baseada em ciclos e na trava de VMEc (Volume Máximo por Equipe).</p>
      </div>

      <ProgressIndicators currentCycles={currentCycles} nextPin={nextPin} directLines={directLines} />

      <Card>
        <h2 className="text-xl font-bold text-white mb-4 text-center">Progresso Geral para o Próximo PIN</h2>

        <div className="flex items-center justify-between gap-4">
          {/* Current Pin */}
          <div className="flex flex-col items-center w-24 text-center">
            {config.pinLogos[currentPinDetails.pin] ? (
              <img src={config.pinLogos[currentPinDetails.pin]} alt={currentPinDetails.pin} className="h-16 w-16 object-contain" />
            ) : (
              <IconAward className="h-16 w-16" style={{ color: currentPinDetails.iconColor }} />
            )}
            <span className="font-bold text-lg mt-2">{currentPinDetails.pin}</span>
            <span className="text-sm text-gray-400">{currentPinDetails.cycles} ciclos</span>
          </div>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="w-full bg-brand-dark h-4 rounded-full shadow-inner">
              <div
                className="bg-gradient-to-r from-yellow-400 to-brand-gold h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, overallProgress)}%` }}
              ></div>
            </div>
            <p className="text-center text-sm font-semibold text-gray-300 mt-2">
              Faltam {Math.max(0, nextPin.cycles - effectiveCycles).toLocaleString('pt-BR')} ciclos efetivos para {nextPin.pin}.
            </p>
          </div>

          {/* Next Pin */}
          <div className="flex flex-col items-center w-24 text-center">
            {config.pinLogos[nextPinDetails.pin] ? (
              <img src={config.pinLogos[nextPinDetails.pin]} alt={nextPinDetails.pin} className="h-16 w-16 object-contain" />
            ) : (
              <IconAward className="h-16 w-16" style={{ color: nextPinDetails.iconColor }} />
            )}
            <span className="font-bold text-lg mt-2">{nextPinDetails.pin}</span>
            <span className="text-sm text-gray-400">{nextPinDetails.cycles} ciclos</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-gray-light">
          <h3 className="text-lg font-bold text-white mb-4">Contribuição por Linha (L1) - Rumo a {nextPin.pin}</h3>
          <div className="space-y-4">
            {lineContributions.slice(0, vmecPercentages.length).map((line, index) => {
              const vmecLimitPercentage = (vmecPercentages[index] || vmecPercentages[vmecPercentages.length - 1]) * 100;
              return (
                <div key={line.id} className="p-3 bg-brand-gray-light rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className="flex items-center gap-3">
                      <img src={line.avatarUrl} alt={line.name} className="h-10 w-10 rounded-full" />
                      <div>
                        <p className="font-semibold text-white text-sm">{line.name}</p>
                        <p className="text-xs text-gray-400">Total da Linha: {line.totalCycles} ciclos</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-4 mt-2 sm:mt-0'>
                      <p className="text-sm text-right sm:text-left">
                        <span className="text-gray-400">Limite ({vmecLimitPercentage.toFixed(0)}%): </span>
                        <span className="font-semibold text-white">{line.cycleLimit.toLocaleString('pt-BR')} ciclos</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-brand-gray h-2 rounded-full mt-2">
                    <div className="bg-brand-gold h-2 rounded-full" style={{ width: `${(line.contribution / line.cycleLimit) * 100}%` }}></div>
                  </div>
                  <p className="text-right text-xs mt-1 font-semibold">Contribuição Efetiva: <span className="text-brand-gold">{line.contribution.toLocaleString('pt-BR')} ciclos</span></p>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
          <div className="flex items-center gap-6 text-center md:text-left">
            <IconGitFork size={40} className="text-brand-gold flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-white">Matriz de Evolução Interativa</h2>
              <p className="text-gray-400 mt-1 max-w-md">Visualize sua rede e acompanhe a evolução de seus indicados.</p>
            </div>
          </div>
          <Link
            to="/consultant/sigme/arvore-interativa/plano-carreira"
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
          >
            Abrir Árvore
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Relatório Avançado de Graduados na Rede</h2>
        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-grow">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar graduado por ${filterCriterion === 'name' ? 'nome' : filterCriterion === 'pin' ? 'PIN' : 'ID'}...`}
              className="w-full bg-brand-gray border border-brand-gray-light rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>
          <select
            value={filterCriterion}
            onChange={(e) => setFilterCriterion(e.target.value as 'name' | 'pin' | 'id')}
            className="w-full sm:w-auto bg-brand-gray border border-brand-gray-light rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-gold focus:outline-none text-sm appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%239CA3AF' class='w-4 h-4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
          >
            <option value="name">Nome do Consultor</option>
            <option value="pin">PIN de Carreira</option>
            <option value="id">ID do Consultor</option>
          </select>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Totais de PINs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"> {/* Use grid instead of flex-wrap for better layout */}
            {completePinSummary.map(({ pin, iconColor, count }) => {
              const logoUrl = config.pinLogos[pin]; // Get logo from config
              const IconComponent = IconAward; // Default icon
              return (
                <div key={pin} className="flex flex-col items-center justify-center p-4 bg-brand-gray-light rounded-lg text-center h-28 shadow-sm"> {/* Card-like styling */}
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${pin} logo`} className="h-10 w-10 object-contain mb-1" />
                  ) : (
                    <IconComponent size={24} style={{ color: iconColor || '#fff' }} className="mb-1" />
                  )}
                  <p className="font-semibold text-sm text-white truncate w-full">{pin}</p>
                  <p className="font-bold text-lg text-brand-gold">{count}</p>
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
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${pin.pin} logo`} className="max-h-full max-w-full object-contain" />
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
