import React, { useState, useMemo } from 'react';
import AssetList from './AssetList';
import Chart from './Chart';
import AIPanel from './AIPanel';
import TradePanel from './TradePanel';
import PositionsPanel from './PositionsPanel';
import ResizablePanels from './ResizablePanels';
import type { Alert, Order, AccountState, AIAnalysis, ChartState, MarketType, VisibleComponents, RobotInstance } from '../App';
import AssetListModal from './modals/AssetListModal';
import TradePanelModal from './modals/TradePanelModal';
import PositionsPanelModal from './modals/PositionsPanelModal';
import { ListIcon, TrendingUpIcon, CurrencyDollarIcon, BellIcon } from './icons/UIIcons'; 

interface AnalysisViewProps {
    allSymbols: string[];
    alerts: Alert[];
    activeSymbol: string;
    handleUpdateChartState: (index: number, newState: Partial<ChartState>) => void;
    wsStatus: 'connecting' | 'connected' | 'disconnected';
    market: MarketType;
    setMarket: (market: MarketType) => void;
    aiMonitoredSymbols: string[];
    setAiMonitoredSymbols: (symbols: string[]) => void;
    chartStates: ChartState[];
    activeChartIndex: number;
    setActiveChartIndex: (index: number) => void;
    robotInstances: RobotInstance[];
    aiAnalyses: AIAnalysis[];
    isAiPanelVisible: boolean;
    accountState: AccountState | null;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    orders: Order[];
    isAccountLoading: boolean;
    accountError: string | null;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    visibleComponents: VisibleComponents;
    latestPrices: Record<string, { price: number; time: number }>;
    handleToggleChartVisibility: (index: number) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = (props) => {
    const { 
        allSymbols, alerts, activeSymbol, handleUpdateChartState, wsStatus, market, setMarket, 
        aiMonitoredSymbols, setAiMonitoredSymbols, chartStates, activeChartIndex, setActiveChartIndex,
        robotInstances, aiAnalyses, isAiPanelVisible, accountState, addToast, orders, isAccountLoading,
        accountError, setOrders, visibleComponents, latestPrices, handleToggleChartVisibility
    } = props;

    const [isAssetListModalOpen, setIsAssetListModalOpen] = useState(false);
    const [isTradePanelModalOpen, setIsTradePanelModalOpen] = useState(false);
    const [isPositionsPanelModalOpen, setIsPositionsPanelModalOpen] = useState(false);
    const [referenceRobotId, setReferenceRobotId] = useState<string | null>(robotInstances[0]?.id || null);
    const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

    React.useEffect(() => {
        if (!referenceRobotId && robotInstances.length > 0) {
            setReferenceRobotId(robotInstances[0].id);
        }
    }, [robotInstances, referenceRobotId]);

     const analysisParams = useMemo(() => {
        const robot = robotInstances.find(r => r.id === referenceRobotId);
        return robot?.params || robotInstances[0]?.params;
    }, [referenceRobotId, robotInstances]);


    return (
        <div className="h-full">
            {/* TRUE FULLSCREEN OVERLAY - Fixed to cover 100% of the viewport without margins */}
            {fullscreenIndex !== null && (
                <div className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col m-0 p-0 border-none">
                    <div className="flex-grow relative h-full">
                        <button 
                            onClick={() => setFullscreenIndex(null)}
                            className="absolute top-4 right-4 z-[110] bg-zinc-800/90 hover:bg-red-600 text-zinc-100 px-4 py-2 rounded-full flex items-center gap-2 border border-zinc-700 transition-all shadow-2xl backdrop-blur-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-sm font-bold uppercase tracking-wider">Sair da Tela Cheia</span>
                        </button>
                        <Chart 
                            {...chartStates[fullscreenIndex]}
                            focusSymbol={chartStates[fullscreenIndex].symbol}
                            timeframe={chartStates[fullscreenIndex].timeframe}
                            onTimeframeChange={(tf) => handleUpdateChartState(fullscreenIndex, { timeframe: tf })}
                            wsStatus={wsStatus}
                            alerts={alerts}
                            accountState={accountState}
                            fibTarget={analysisParams?.fib_target}
                            aiAnalyses={aiAnalyses.filter(a => a.symbol === chartStates[fullscreenIndex].symbol)}
                            isActive={true}
                            onClick={() => {}}
                            isMainChart={true}
                            latestPrice={latestPrices[chartStates[fullscreenIndex].symbol] || null}
                        />
                    </div>
                </div>
            )}

            <div className="hidden lg:flex h-full">
               <ResizablePanels
                    leftPanelVisible={visibleComponents.assetList}
                    rightPanelVisible={visibleComponents.tradePanel || visibleComponents.positionsPanel || isAiPanelVisible}
                    leftPanelContent={
                        <AssetList 
                            symbols={allSymbols}
                            alerts={alerts}
                            focusSymbol={activeSymbol}
                            setFocusSymbol={(symbol) => handleUpdateChartState(activeChartIndex, { symbol })}
                            wsStatus={wsStatus}
                            market={market}
                            setMarket={setMarket}
                            monitoredSymbols={aiMonitoredSymbols}
                            setMonitoredSymbols={setAiMonitoredSymbols}
                        />
                    }
                    rightPanelContent={
                         <div className="space-y-2 h-full overflow-y-auto p-1">
                            {visibleComponents.tradePanel && <TradePanel focusSymbol={activeSymbol} wsStatus={wsStatus} accountState={accountState} addToast={addToast} />}
                            {visibleComponents.positionsPanel && <PositionsPanel
                                accountState={accountState}
                                orders={orders}
                                alerts={alerts}
                                isLoading={isAccountLoading}
                                error={accountError}
                                onClearOrders={() => setOrders([])}
                            />}
                            {isAiPanelVisible && <AIPanel focusSymbol={activeSymbol} aiStrategy={analysisParams?.ai_strategy} />}
                        </div>
                    }
               >
                    <main className="flex flex-col h-full space-y-2 overflow-hidden p-2">
                        <div className="flex-shrink-0 bg-zinc-900/50 p-2 rounded-lg flex items-center justify-between gap-2 overflow-x-auto">
                            <div className="flex items-center gap-2">
                                <label htmlFor="robot-selector" className="text-sm font-semibold text-zinc-400">Parâmetros:</label>
                                <select 
                                    id="robot-selector"
                                    value={referenceRobotId || ''}
                                    onChange={(e) => setReferenceRobotId(e.target.value)}
                                    className="bg-zinc-800 border border-zinc-700 rounded p-1 text-sm w-full max-w-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    {robotInstances.map(r => (
                                        <option key={r.id} value={r.id}>
                                            Robô: {r.symbol} ({r.type.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {chartStates.some(c => !c.visible) && (
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-zinc-500 mr-2">Adicionar:</span>
                                    {chartStates.map((c, i) => !c.visible && (
                                        <button 
                                            key={c.symbol + i}
                                            onClick={() => handleToggleChartVisibility(i)}
                                            className="bg-zinc-800 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded text-xs transition-colors whitespace-nowrap"
                                        >
                                            + {c.symbol}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {visibleComponents.charts && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-grow min-h-0">
                                {chartStates[0].visible && (
                                    <div className="lg:col-span-2 h-[50vh] lg:h-full">
                                        <Chart
                                            key={chartStates[0].symbol + '-main'}
                                            focusSymbol={chartStates[0].symbol}
                                            timeframe={chartStates[0].timeframe}
                                            onTimeframeChange={(tf) => handleUpdateChartState(0, { timeframe: tf })}
                                            wsStatus={wsStatus}
                                            alerts={alerts}
                                            accountState={accountState}
                                            fibTarget={analysisParams?.fib_target}
                                            aiAnalyses={aiAnalyses.filter(a => a.symbol === chartStates[0].symbol)}
                                            isActive={0 === activeChartIndex}
                                            onClick={() => setActiveChartIndex(0)}
                                            onClose={() => handleToggleChartVisibility(0)}
                                            onMaximize={() => setFullscreenIndex(0)}
                                            isMainChart={true}
                                            latestPrice={latestPrices[chartStates[0].symbol] || null}
                                        />
                                    </div>
                                )}
                                <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 overflow-y-auto">
                                    {chartStates.slice(1).map((state, index) => {
                                        const actualIndex = index + 1;
                                        if (!state.visible) return null;
                                        return (
                                            <div key={state.symbol + actualIndex} className="h-[30vh] sm:h-[250px] lg:h-[200px]">
                                                <Chart
                                                    focusSymbol={state.symbol}
                                                    timeframe={state.timeframe}
                                                    onTimeframeChange={(tf) => handleUpdateChartState(actualIndex, { timeframe: tf })}
                                                    wsStatus={wsStatus}
                                                    alerts={alerts}
                                                    accountState={accountState}
                                                    fibTarget={analysisParams?.fib_target}
                                                    aiAnalyses={aiAnalyses.filter(a => a.symbol === state.symbol)}
                                                    isActive={actualIndex === activeChartIndex}
                                                    onClick={() => setActiveChartIndex(actualIndex)}
                                                    onClose={() => handleToggleChartVisibility(actualIndex)}
                                                    onMaximize={() => setFullscreenIndex(actualIndex)}
                                                    latestPrice={latestPrices[state.symbol] || null}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </main>
               </ResizablePanels>
            </div>

            <div className="lg:hidden flex flex-col h-full overflow-hidden">
                <main className="flex-grow overflow-y-auto p-2">
                     <div className="bg-zinc-900/50 p-2 rounded-lg flex items-center gap-2 mb-2">
                        <label htmlFor="robot-selector-mobile" className="text-sm font-semibold text-zinc-400">Parâmetros:</label>
                        <select 
                            id="robot-selector-mobile"
                            value={referenceRobotId || ''}
                            onChange={(e) => setReferenceRobotId(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded p-1 text-sm w-full"
                        >
                             {robotInstances.map(r => (
                                <option key={r.id} value={r.id}>
                                    Robô: {r.symbol} ({r.type.toUpperCase()})
                                </option>
                            ))}
                        </select>
                    </div>
                    {visibleComponents.charts &&
                        <div className="h-[50vh] mb-2">
                            <Chart
                                key={chartStates[0].symbol + '-main'}
                                focusSymbol={chartStates[0].symbol}
                                timeframe={chartStates[0].timeframe}
                                onTimeframeChange={(tf) => handleUpdateChartState(0, { timeframe: tf })}
                                wsStatus={wsStatus}
                                alerts={alerts}
                                accountState={accountState}
                                fibTarget={analysisParams?.fib_target}
                                aiAnalyses={aiAnalyses.filter(a => a.symbol === chartStates[0].symbol)}
                                isActive={0 === activeChartIndex}
                                onClick={() => setActiveChartIndex(0)}
                                isMainChart={true}
                                latestPrice={latestPrices[chartStates[0].symbol] || null}
                                onMaximize={() => setFullscreenIndex(0)}
                            />
                        </div>
                    }
                    {isAiPanelVisible && <AIPanel focusSymbol={activeSymbol} aiStrategy={analysisParams?.ai_strategy} />}
                </main>
                <div className="sticky bottom-0 z-10 bg-zinc-900 border-t border-zinc-800 p-2 flex justify-around text-xs">
                    {visibleComponents.assetList && (
                        <button 
                            onClick={() => setIsAssetListModalOpen(true)}
                            className="flex flex-col items-center text-zinc-400 hover:text-amber-300 px-2 py-1 rounded-md transition-colors"
                        >
                            <ListIcon className="h-5 w-5" />
                            Ativos
                        </button>
                    )}
                    {visibleComponents.tradePanel && (
                        <button 
                            onClick={() => setIsTradePanelModalOpen(true)}
                            className="flex flex-col items-center text-zinc-400 hover:text-amber-300 px-2 py-1 rounded-md transition-colors"
                        >
                            <TrendingUpIcon className="h-5 w-5" />
                            Negociar
                        </button>
                    )}
                    {visibleComponents.positionsPanel && (
                        <button 
                            onClick={() => setIsPositionsPanelModalOpen(true)}
                            className="flex flex-col items-center text-zinc-400 hover:text-amber-300 px-2 py-1 rounded-md transition-colors"
                        >
                            <CurrencyDollarIcon className="h-5 w-5" />
                            Posições
                        </button>
                    )}
                     {isAiPanelVisible && (
                        <button
                            onClick={() => {}}
                            className="flex flex-col items-center text-amber-300 px-2 py-1 rounded-md transition-colors"
                        >
                            <BellIcon className="h-5 w-5" />
                            IA
                        </button>
                    )}
                </div>
            </div>

            <AssetListModal
                isOpen={isAssetListModalOpen}
                onClose={() => setIsAssetListModalOpen(false)}
                allSymbols={allSymbols}
                alerts={alerts}
                focusSymbol={activeSymbol}
                setFocusSymbol={(symbol) => {
                    handleUpdateChartState(activeChartIndex, { symbol });
                    setIsAssetListModalOpen(false); 
                }}
                wsStatus={wsStatus}
                market={market}
                setMarket={setMarket}
                aiMonitoredSymbols={aiMonitoredSymbols}
                setAiMonitoredSymbols={setAiMonitoredSymbols}
            />
            <TradePanelModal
                isOpen={isTradePanelModalOpen}
                onClose={() => setIsTradePanelModalOpen(false)}
                focusSymbol={activeSymbol}
                wsStatus={wsStatus}
                accountState={accountState}
                addToast={addToast}
            />
            <PositionsPanelModal
                isOpen={isPositionsPanelModalOpen}
                onClose={() => setIsPositionsPanelModalOpen(false)}
                accountState={accountState}
                orders={orders}
                alerts={alerts}
                isLoading={isAccountLoading}
                error={accountError}
                onClearOrders={() => setOrders([])}
            />
        </div>
    );
};

export default AnalysisView;