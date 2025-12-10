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
import { ListIcon, TrendingUpIcon, CurrencyDollarIcon, BellIcon } from './icons/UIIcons'; // Reusing some icons for mobile nav

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
}

const AnalysisView: React.FC<AnalysisViewProps> = (props) => {
    const { 
        allSymbols, alerts, activeSymbol, handleUpdateChartState, wsStatus, market, setMarket, 
        aiMonitoredSymbols, setAiMonitoredSymbols, chartStates, activeChartIndex, setActiveChartIndex,
        robotInstances, aiAnalyses, isAiPanelVisible, accountState, addToast, orders, isAccountLoading,
        accountError, setOrders, visibleComponents, latestPrices
    } = props;

    const [isAssetListModalOpen, setIsAssetListModalOpen] = useState(false);
    const [isTradePanelModalOpen, setIsTradePanelModalOpen] = useState(false);
    const [isPositionsPanelModalOpen, setIsPositionsPanelModalOpen] = useState(false);
    const [referenceRobotId, setReferenceRobotId] = useState<string | null>(robotInstances[0]?.id || null);

     const analysisParams = useMemo(() => {
        const robot = robotInstances.find(r => r.id === referenceRobotId);
        // Fallback to the first robot's params if the selected one is somehow invalid
        return robot?.params || robotInstances[0]?.params;
    }, [referenceRobotId, robotInstances]);


    return (
        <div className="h-full">
            {/* Desktop Layout (lg and up) */}
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
                        <div className="flex-shrink-0 bg-zinc-900/50 p-2 rounded-lg flex items-center gap-2">
                            <label htmlFor="robot-selector" className="text-sm font-semibold text-zinc-400">Parâmetros de Análise:</label>
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

                        {visibleComponents.charts &&
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-grow min-h-0">
                                <div className="lg:col-span-2 h-[40vh] lg:h-auto">
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
                                    />
                                </div>
                                <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                                     {chartStates.slice(1).map((state, index) => {
                                        const actualIndex = index + 1;
                                        return (
                                            <div key={state.symbol + actualIndex} className="h-[30vh] sm:h-auto">
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
                                                    latestPrice={latestPrices[state.symbol] || null}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        }
                    </main>
               </ResizablePanels>
            </div>

            {/* Mobile Layout (below lg) */}
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
                        <div className="h-[50vh] mb-2"> {/* Main chart taking more vertical space */}
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
                            onClick={() => { /* AIPanel already directly visible in mobileLayout, this button could scroll to it or highlight */ }}
                            className="flex flex-col items-center text-amber-300 px-2 py-1 rounded-md transition-colors"
                        >
                            <BellIcon className="h-5 w-5" />
                            IA
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Modals */}
            <AssetListModal
                isOpen={isAssetListModalOpen}
                onClose={() => setIsAssetListModalOpen(false)}
                allSymbols={allSymbols}
                alerts={alerts}
                focusSymbol={activeSymbol}
                setFocusSymbol={(symbol) => {
                    handleUpdateChartState(activeChartIndex, { symbol });
                    setIsAssetListModalOpen(false); // Close modal on selection
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