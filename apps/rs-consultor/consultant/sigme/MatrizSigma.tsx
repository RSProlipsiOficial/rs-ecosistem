import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../ConsultantLayout';
import { generateMatrixNetwork } from '../data';
import NetworkTree from '../components/NetworkTree';
import Card from '../../components/Card';
import { IconUsers, IconChevronLeft, IconGitFork, IconShoppingCart, IconAward, IconRepeat, IconHandCoins } from '../../components/icons';
import type { NetworkNode, User } from '../../types';
import { sigmaApi, SigmaConfig } from '../services/sigmaApi';

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
  report.activeDirects = directs.filter(d => d.status === 'active' || d.status === 'ativo').length;
  report.inactiveDirects = directs.filter(d => d.status !== 'active' && d.status !== 'ativo').length;

  const queue: NetworkNode[] = [...rootNode.children];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || node.isEmpty || visited.has(node.id)) continue;

    visited.add(node.id);
    report.totalDownline++;
    report.maxDepth = Math.max(report.maxDepth, node.level || 0);

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
  const [selectedMatrix, setSelectedMatrix] = useState(1);
  const { user } = useUser();
  const [config, setConfig] = useState<SigmaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rootNode, setRootNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Buscar config
        const resConfig = await sigmaApi.getConfig();
        if (resConfig.success) {
          setConfig(resConfig.data);
        }

        // Buscar árvore da matriz real do consultor
        if (user?.id) {
          const resTree = await sigmaApi.getMatrixTree(user.id, 3);
          if (resTree.success && resTree.tree) {
            setRootNode(resTree.tree);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const currentMatrix = matrices.find(m => m.id === selectedMatrix)!;

  const report = useMemo(() => {
    if (!rootNode) return {
      totalDirects: 0, activeDirects: 0, inactiveDirects: 0,
      totalDownline: 0, maxDepth: 0,
      downlineWithPurchase: 0, downlineWithoutPurchase: 0, pinSummary: {}
    };
    return analyzeNetwork(rootNode);
  }, [rootNode]);

  if (loading) return <div className="p-10 text-center text-brand-gold">Carregando matriz SIGME...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Erro: {error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-brand-gold">Central de Matrizes SIGME</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center">
          <h2 className="text-xl font-bold text-white mb-4">Matriz Selecionada</h2>
          <div className="bg-brand-gray p-4 rounded-lg border border-brand-gold/30">
            <h3 className="text-2xl font-bold text-center text-brand-gold">{currentMatrix.name}</h3>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Valores da Matriz</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-brand-gray-light rounded-xl border border-brand-gold/20 flex flex-col items-center">
              <IconHandCoins size={24} className="text-brand-gold mb-2" />
              <span className="text-xs text-brand-text-dim uppercase font-bold tracking-wider">Ativação</span>
              <span className="text-xl font-bold text-white">{formatCurrency(config?.matrix?.activationValue || 60)}</span>
            </div>
            <div className="p-4 bg-brand-gray-light rounded-xl border border-brand-gold/20 flex flex-col items-center">
              <IconRepeat size={24} className="text-brand-gold mb-2" />
              <span className="text-xs text-brand-text-dim uppercase font-bold tracking-wider">Reentrada</span>
              <span className="text-xl font-bold text-white">{formatCurrency(config?.matrix?.reentryValue || 60)}</span>
            </div>
          </div>
        </Card>
      </div>

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
                  <IconAward size={20} className="text-brand-gold" />
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
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Navegue pela estrutura completa da sua rede com nossa ferramenta de visualização interativa.</p>
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
  const { user, logout } = useUser();
  const { type, matrixId } = useParams<{ type: string; matrixId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!propRootNode);
  const [rootNode, setRootNode] = useState<NetworkNode | null>(propRootNode || null);
  const [isUnilevel, setIsUnilevel] = useState(type === 'plano-carreira' || type === 'top-sigme' || type === 'directs');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propRootNode) return;

    async function loadNetworkData() {
      if (user?.id) {
        setLoading(true);
        setError(null);
        try {
          let res;
          if (isUnilevel) {
            // Unilevel real do backend
            res = await sigmaApi.getTree(type);
          } else {
            // Matriz real do backend
            // Forçamos profundidade de 6 níveis para paridade total
            const depth = 6;
            res = await sigmaApi.getMatrixTree(user.id, depth);
          }

          if (res.success && (res.tree || res.data?.tree)) {
            const treeData = res.tree || res.data?.tree;
            setRootNode(treeData);
          } else {
            setError(res.error || 'Não foi possível carregar os dados da rede.');
          }
        } catch (err: any) {
          setError('Erro de conexão com o servidor.');
        } finally {
          setLoading(false);
        }
      }
    }
    loadNetworkData();
  }, [user?.id, type, isUnilevel, propRootNode]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-dark">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
          <p className="text-brand-gold font-medium">Sincronizando com a Rede Oficial...</p>
          <p className="text-xs text-brand-text-dim">Buscando sua estrutura real no banco de dados</p>
        </div>
      </div>
    );
  }

  if (error || !rootNode) {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-dark p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white">Ops! Algo deu errado</h2>
          <p className="text-brand-text-dim">{error || 'Não encontramos sua rede ativa no momento.'}</p>

          {error?.toLowerCase().includes('token') || error?.toLowerCase().includes('sessão') ? (
            <button onClick={() => { logout(); navigate('/login'); }} className="bg-brand-gold text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-yellow-400 transition-colors">
              Fazer Login Novamente
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-gray-light transition-colors">
              Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleBack = () => {
    switch (type) {
      case 'ciclo-global': navigate('/consultant/sigme/ciclo-global'); break;
      case 'matriz': navigate('/consultant/sigme/matriz-sigma'); break;
      case 'plano-carreira':
      case 'top-sigme':
      case 'bonus-profundidade':
      case 'bonus-fidelidade':
      case 'profundidade':
      case 'fidelidade':
        navigate('/consultant/sigme/relatorios-rede');
        break;
      default: navigate(-1);
    }
  };

  const effectiveTitle = propTitle || (isUnilevel ? (type === 'directs' ? 'Meus Diretos' : 'Árvore Unilevel Aberta') : `Matriz Forçada (6x6)`);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="p-2 absolute top-0 left-0 z-50 flex items-center gap-4">
        <button onClick={handleBack} className="flex items-center text-brand-gold font-semibold p-2 rounded-lg hover:bg-brand-gray-light bg-brand-dark/50 backdrop-blur-sm">
          <IconChevronLeft size={20} className="mr-1" />
          Voltar
        </button>

        {/* Mostrar toggle apenas se NÃO for plano-carreira ou top-sigme */}
        {type !== 'plano-carreira' && type !== 'top-sigme' && (
          <div className="flex bg-brand-dark/50 backdrop-blur-sm rounded-lg p-1 border border-brand-gray-light">
            <button
              onClick={() => setIsUnilevel(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isUnilevel ? 'bg-brand-gold text-brand-dark' : 'text-gray-400 hover:text-white'}`}
            >
              MATRIZ (6x6)
            </button>
            <button
              onClick={() => setIsUnilevel(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isUnilevel ? 'bg-brand-gold text-brand-dark' : 'text-gray-400 hover:text-white'}`}
            >
              UNILEVEL (ABERTA)
            </button>
          </div>
        )}
      </div>
      <div className="flex-grow relative w-full h-full">
        <NetworkTree
          title={effectiveTitle}
          rootNode={rootNode}
          matrixWidth={isUnilevel ? 0 : 6}
        />
      </div>
    </div>
  );
};

export default MatrizSigma;