import React, { useState, useMemo } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useUser } from './hooks';
import { generateMatrixNetwork, mockDirects, mockMatrixMembers, mockCycleInfo, mockUser } from './data';
import Card from '../Card';
import { IconUsers, IconChevronLeft, IconGitFork, IconCheckCircle, IconX, IconShoppingCart, IconStar, IconAward, IconRepeat } from '../icons';
import type { NetworkNode } from './types';

interface NetworkReport {
  totalDirects: number;
  activeDirects: number;
  inactiveDirects: number;
  totalDownline: number;
  maxDepth: number;
  downlineWithPurchase: number;
  downlineWithoutPurchase: number;
  pinSummary: { [key: string]: number };
}

// Helper function to analyze the network and generate the report
const analyzeNetwork = (rootNode: NetworkNode): NetworkReport => {
    const report: NetworkReport = {
        totalDirects: 0,
        activeDirects: 0,
        inactiveDirects: 0,
        totalDownline: 0,
        maxDepth: 0,
        downlineWithPurchase: 0,
        downlineWithoutPurchase: 0,
        pinSummary: {},
    };

    if (!rootNode || !rootNode.children) return report;

    const directs = rootNode.children.filter(c => !c.isEmpty);
    report.totalDirects = directs.length;
    report.activeDirects = directs.filter(d => d.status === 'active').length;
    report.inactiveDirects = directs.filter(d => d.status !== 'active').length;

    const queue: NetworkNode[] = [...rootNode.children];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const node = queue.shift();
        if (!node || node.isEmpty || visited.has(node.id)) continue;
        
        visited.add(node.id);
        report.totalDownline++;
        report.maxDepth = Math.max(report.maxDepth, node.level);

        if (node.hasPurchased) {
            report.downlineWithPurchase++;
        } else {
            report.downlineWithoutPurchase++;
        }

        if (node.pin && node.pin !== 'Vago') {
            report.pinSummary[node.pin] = (report.pinSummary[node.pin] || 0) + 1;
        }
        
        if (node.children) {
            queue.push(...node.children);
        }
    }
    
    return report;
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, subValue?: string, className?: string }> = ({ icon: Icon, title, value, subValue, className }) => (
    <Card className={`flex items-center space-x-4 ${className}`}>
        <div className="p-3 bg-brand-gray-light rounded-full">
            <Icon size={24} className="text-brand-gold" />
        </div>
        <div>
            <h4 className="text-sm text-brand-text-dim">{title}</h4>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subValue && <p className="text-xs text-brand-text-dim">{subValue}</p>}
        </div>
    </Card>
);

const matrices = [
    { id: 1, name: 'Matriz 6x3', width: 6, depth: 3 },
];

const MatrizSigma: React.FC = () => {
  const [selectedMatrix, setSelectedMatrix] = useState(1); // Always default to 1, as it's the only one
  const { user } = useUser();
  
  const currentMatrix = matrices.find(m => m.id === selectedMatrix)!;

  const { report, rootNode } = useMemo(() => {
    const node = generateMatrixNetwork(
        currentMatrix.width,
        currentMatrix.depth,
        user,
        mockDirects,
        mockMatrixMembers
    );
    const reportData = analyzeNetwork(node);
    return { report: reportData, rootNode: node };
  }, [currentMatrix, user]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-gold">Central de Matrizes SIGME</h1>
      
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white mb-4 sm:mb-0">Matriz Selecionada</h2>
          {/* Removed the matrix selection buttons as only one matrix is available */}
          {/* <div className="flex flex-wrap items-center gap-2 bg-brand-gray-light p-1.5 rounded-lg">
            {matrices.map(matrix => (
              <button
                key={matrix.id}
                onClick={() => setSelectedMatrix(matrix.id)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${selectedMatrix === matrix.id ? 'bg-brand-gold text-brand-dark shadow-md' : 'text-brand-text-dim hover:bg-brand-gray-dark'}`}
              >
                {matrix.id}
              </button>
            ))}
          </div> */}
        </div>
        <div className="bg-brand-gray p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-center text-brand-gold">{currentMatrix.name}</h3>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Relatório da Rede ({currentMatrix.name})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={IconUsers} title="Total na Rede" value={report.totalDownline} subValue={`Até ${report.maxDepth} níveis`} />
          <StatCard icon={IconGitFork} title="Indicados Diretos" value={report.totalDirects} subValue={`${report.activeDirects} ativos / ${report.inactiveDirects} inativos`} />
          <StatCard icon={IconShoppingCart} title="Atividade de Compra" value={report.downlineWithPurchase} subValue={`${report.downlineWithoutPurchase} nunca compraram`} />
        </div>
        <div className="mt-6 pt-6 border-t border-brand-gray-light">
          <h3 className="text-lg font-bold text-white mb-3">Distribuição de PINs na Rede</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(report.pinSummary).length > 0 ? Object.entries(report.pinSummary)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([pin, count]) => (
                <div key={pin} className="flex items-center space-x-2 bg-brand-gray-light px-3 py-2 rounded-lg">
                  <IconAward size={20} className="text-brand-gold"/>
                  <span className="font-semibold text-white">{pin}:</span>
                  <span className="font-mono text-brand-text-light">{count}</span>
                </div>
            )) : <p className="text-brand-text-dim text-sm">Nenhum PIN encontrado nesta matriz.</p>}
          </div>
        </div>
      </Card>

       <Card>
        <div className="text-center p-6">
            <IconUsers size={40} className="mx-auto text-brand-gold mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Explore sua Rede na {currentMatrix.name}</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">Navegue pela estrutura completa da sua rede nesta matriz com nossa ferramenta de visualização interativa.</p>
            <Link 
                to={`/consultant/sigme/arvore-interativa/matriz/${currentMatrix.id}`} 
                className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
            >
                Abrir Árvore Interativa
            </Link>
        </div>
      </Card>
    </div>
  );
};

export const ArvoreInterativaPage: React.FC<{ rootNode?: NetworkNode; title?: string; matrixWidth?: number }> = ({ rootNode: propRootNode, title: propTitle, matrixWidth: propMatrixWidth }) => {
  const { user } = useUser();
  const { type, matrixId } = useParams<{ type: string; matrixId?: string }>();
  const navigate = useNavigate();

  const matrices = [
    { id: 1, name: 'Matriz 6x3', width: 6, depth: 3 },
  ];

  let effectiveRootNode = propRootNode;
  let effectiveTitle = propTitle;
  let effectiveMatrixWidth = propMatrixWidth;
  
  // If props are not provided, determine from URL params
  if (!effectiveRootNode) {
    if (type === 'ciclo-global') {
        effectiveTitle = 'Árvore Interativa - Ciclo Global';
        const activeCycleData = mockCycleInfo.find(c => !c.completed) || mockCycleInfo[mockCycleInfo.length - 1];
        effectiveRootNode = generateMatrixNetwork(
            6, 
            3, // Show more levels
            user,
            activeCycleData.participants,
            mockMatrixMembers
        );
        effectiveMatrixWidth = 6;
    } else if (type === 'matriz' && matrixId) {
        const id = Number(matrixId);
        const matrix = matrices.find(m => m.id === id);
        
        if (matrix) {
            effectiveMatrixWidth = matrix.width;
            const matrixDepth = matrix.depth;
            effectiveTitle = `Árvore Interativa - ${matrix.name}`;
            effectiveRootNode = generateMatrixNetwork(
                effectiveMatrixWidth,
                matrixDepth,
                user,
                mockDirects,
                mockMatrixMembers
            );
        } else {
           return <Navigate to="/consultant/sigme/matriz-sigma" replace />;
        }
    } else if (type === 'plano-carreira') {
        effectiveTitle = 'Árvore Interativa - Matriz de Evolução – Plano de Carreira';
        effectiveRootNode = generateMatrixNetwork(
            mockDirects.length,
            3, // Reduced depth for better visualization
            user,
            mockDirects,
            mockMatrixMembers
        );
        effectiveMatrixWidth = mockDirects.length;
    } else if (type === 'top-sigme') {
        effectiveTitle = 'Árvore Interativa - Matriz Top SIGME';
        effectiveRootNode = generateMatrixNetwork(
            mockDirects.length,
            3, // A smaller depth is better to just show directs and their first level
            user,
            mockDirects,
            mockMatrixMembers
        );
        effectiveMatrixWidth = mockDirects.length;
    } else if (type === 'bonus-profundidade') {
        effectiveTitle = 'Árvore Interativa - Bônus de Profundidade 6x6';
        effectiveRootNode = generateMatrixNetwork(
            6, // 6x6 matrix width
            6, // 6x6 matrix depth
            user,
            mockDirects, // The same directs
            mockMatrixMembers // The same pool
        );
        effectiveMatrixWidth = 6;
    } else if (type === 'bonus-fidelidade') {
        effectiveTitle = 'Árvore Interativa - Bônus de Fidelidade 6x6';
        effectiveRootNode = generateMatrixNetwork(
            6, // 6x6 matrix width
            6, // 6x6 matrix depth
            user,
            mockDirects,
            mockMatrixMembers
        );
        effectiveMatrixWidth = 6;
    } else if (type === 'directs') { // New case for direct reports
        effectiveTitle = 'Minha Rede Direta';
        effectiveRootNode = generateMatrixNetwork(
            mockDirects.length,
            1, // Only 1 level deep for direct reports
            user,
            mockDirects,
            mockMatrixMembers
        );
        effectiveMatrixWidth = mockDirects.length;
    } else {
        return <Navigate to="/consultant/dashboard" replace />;
    }
  }

  // Fallback if rootNode is still null (shouldn't happen with the logic above, but for safety)
  if (!effectiveRootNode) {
      return <Navigate to="/consultant/dashboard" replace />;
  }

  const handleBack = () => {
    switch (type) {
      case 'ciclo-global':
        navigate('/consultant/sigme/ciclo-global');
        break;
      case 'matriz':
        navigate('/consultant/sigme/matriz-sigma');
        break;
      case 'plano-carreira':
      case 'top-sigme':
      case 'bonus-profundidade':
      case 'bonus-fidelidade':
        navigate('/consultant/sigme/relatorios-rede'); // All these types now navigate back to the main reports page
        break;
      case 'directs': // Navigate back to Dashboard for direct reports
        navigate('/consultant/dashboard');
        break;
      default:
        navigate(-1); // Fallback to history
    }
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex items-center mb-4">
             <button onClick={handleBack} className="flex items-center text-brand-gold font-semibold p-2 rounded-lg hover:bg-brand-gray-light">
                <IconChevronLeft size={20} className="mr-1"/>
                Voltar
            </button>
        </div>
      <div className="flex-grow relative">
        <NetworkTree 
          title={effectiveTitle || 'Árvore Interativa'}
          rootNode={effectiveRootNode}
          matrixWidth={effectiveMatrixWidth}
        />
      </div>
    </div>
  );
};

export default MatrizSigma;