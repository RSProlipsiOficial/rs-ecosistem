import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, CandlestickData, LineData, PriceLineOptions, IPriceLine, SeriesMarker, Time } from 'lightweight-charts';
import { ChevronUpIcon, ChevronDownIcon, MaximizeIcon } from './icons/UIIcons';
import { fetchOhlcv, fetchKagi } from '../lib/api';
import type { Alert, AccountState, AIAnalysis } from '../App';

interface ChartProps {
    focusSymbol: string;
    timeframe: string;
    onTimeframeChange: (tf: string) => void;
    wsStatus: 'connecting' | 'connected' | 'disconnected';
    alerts: Alert[];
    accountState: AccountState | null;
    fibTarget?: number;
    aiAnalyses?: AIAnalysis[];
    isActive: boolean;
    onClick: () => void;
    isMainChart?: boolean;
    latestPrice: { price: number; time: number } | null;
    onClose?: () => void;
    onMaximize?: () => void;
}

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h'];

const Chart: React.FC<ChartProps> = (props) => {
    const { 
        focusSymbol, timeframe, onTimeframeChange, wsStatus, alerts, accountState, 
        fibTarget, aiAnalyses, isActive, onClick, isMainChart, latestPrice, onClose, onMaximize 
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const priceSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const kagiSeries = useRef<ISeriesApi<'Line'> | null>(null);
    const priceLinesRef = useRef<Set<IPriceLine>>(new Set());
    const drawnObjectsRef = useRef<Map<string, IPriceLine[]>>(new Map());

    const [isLoading, setIsLoading] = useState(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const [lastCandle, setLastCandle] = useState<CandlestickData | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        const chart = createChart(ref.current, {
            layout: {
                background: { color: '#09090b' },
                textColor: '#a1a1aa',
                fontSize: 10,
            },
            grid: {
                vertLines: { color: '#27272a' },
                horzLines: { color: '#27272a' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                borderColor: '#3f3f46',
            },
            rightPriceScale: {
                borderColor: '#3f3f46',
            },
            crosshair: {
                mode: 1, // Magnet
            }
        });

        priceSeries.current = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
        });
        kagiSeries.current = chart.addLineSeries({ color: '#f59e0b', lineWidth: 2 });

        chartRef.current = chart;

        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry && chartRef.current) {
                const { width, height } = entry.contentRect;
                requestAnimationFrame(() => {
                    if (chartRef.current) {
                        chartRef.current.resize(width, height);
                    }
                });
            }
        });

        resizeObserver.observe(ref.current);

        return () => {
            try {
                resizeObserver.disconnect();
                
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }
                
                priceSeries.current = null;
                kagiSeries.current = null;
                priceLinesRef.current.clear();
                drawnObjectsRef.current.clear();
            } catch (e) {
                console.warn('[Chart] Erro no cleanup:', e);
            }
        };
    }, []);

    const updateChartData = useCallback(async () => {
        if (wsStatus !== 'connected' || !priceSeries.current || !focusSymbol || !chartRef.current) {
            if (wsStatus === 'disconnected') {
                priceSeries.current?.setData([]);
                kagiSeries.current?.setData([]);
                setChartError(`Backend desconectado. Aguardando reconexão...`);
            }
            return;
        }

        setIsLoading(true);
        setLastCandle(null);
        try {
            setChartError(null);
            const [oc, kg] = await Promise.all([
                fetchOhlcv(focusSymbol, timeframe),
                fetchKagi(focusSymbol, timeframe)
            ]);

            if (!chartRef.current || !priceSeries.current) return;

            console.log(`[Chart Debug] Dados OHLCV para ${focusSymbol}:`, oc);

            if (priceSeries.current && oc.candles) {
                const data: CandlestickData[] = oc.candles.map((c: any[]) => ({ 
                    time: (c[0] / 1000 - 10800) as Time, // Ajuste para fuso BRT (-3h)
                    open: c[1], 
                    high: c[2], 
                    low: c[3], 
                    close: c[4] 
                }));
                priceSeries.current.setData(data);
                if (data.length > 0) {
                    setLastCandle(data[data.length - 1]);
                }
            }
            if (kagiSeries.current && kg.kagi) {
                const data: LineData[] = kg.kagi.map((p: any[]) => ({ 
                    time: (p[0] / 1000 - 10800) as Time, // Ajuste para fuso BRT (-3h)
                    value: p[1] 
                }));
                kagiSeries.current.setData(data);
            }
            
            if (oc.candles && oc.candles.length > 0 && chartRef.current) {
                chartRef.current.timeScale().fitContent();
            }

        } catch (e) {
            if (chartRef.current) {
                setChartError(`Falha ao carregar dados do gráfico para ${focusSymbol}.`);
            }
        } finally {
            if (chartRef.current) {
                setIsLoading(false);
            }
        }
    }, [focusSymbol, wsStatus, timeframe]);

    useEffect(() => {
        if (!focusSymbol || wsStatus !== 'connected') return;
        updateChartData();
    }, [updateChartData, focusSymbol, wsStatus]);

    useEffect(() => {
        if (latestPrice && priceSeries.current) {
            // Se não temos lastCandle, não podemos fazer o merge, mas podemos tentar criar uma vela simples
            if (!lastCandle) {
                 priceSeries.current.update({
                    time: latestPrice.time as Time,
                    open: latestPrice.price,
                    high: latestPrice.price,
                    low: latestPrice.price,
                    close: latestPrice.price
                });
                return;
            }

            // Mapeamento de segundos por timeframe
            const tfSeconds: Record<string, number> = {
                '1m': 60, '5m': 300, '15m': 900, '30m': 1800, '1h': 3600, '4h': 14400, '1D': 86400
            };
            const interval = tfSeconds[timeframe] || 3600;
            
            // Arredondar tempo do tick para o início do intervalo da vela
            const candleTime = Math.floor(latestPrice.time / interval) * interval;
            const lastTime = lastCandle.time as number;

            if (candleTime >= lastTime) {
                if (candleTime === lastTime) {
                    // Atualiza vela existente
                    const updated = { ...lastCandle };
                    updated.close = latestPrice.price;
                    updated.high = Math.max(updated.high, latestPrice.price);
                    updated.low = Math.min(updated.low, latestPrice.price);
                    priceSeries.current.update(updated);
                } else {
                    // Abre nova vela
                    const newCandle = {
                        time: candleTime as Time,
                        open: latestPrice.price,
                        high: latestPrice.price,
                        low: latestPrice.price,
                        close: latestPrice.price
                    };
                    priceSeries.current.update(newCandle);
                    // Opcional: atualizar lastCandle para que o próximo tick atualize a nova
                    setLastCandle(newCandle);
                }
            }
        }
    }, [latestPrice, lastCandle, timeframe]);

    useEffect(() => {
        if (!aiAnalyses || !priceSeries.current) return;
        
        const allMarkers: SeriesMarker<Time>[] = [];
        aiAnalyses.forEach(analysis => {
            analysis.data.forEach(d => {
                if (d.label) {
                    allMarkers.push({
                        time: (d.time / 1000) as Time, 
                        position: d.position || 'aboveBar',
                        color: d.color || '#facc15', 
                        shape: 'circle', 
                        text: d.label,
                    });
                }
            });
        });
        priceSeries.current.setMarkers(allMarkers);
    }, [aiAnalyses]);

    return (
        <div 
            className={`flex flex-col bg-zinc-950 border rounded-lg transition-all duration-200 overflow-hidden h-full ${isActive ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-zinc-800'}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between px-2 py-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`text-amber-300 font-bold ${isMainChart ? 'text-base' : 'text-sm'}`}>{focusSymbol}</div>
                    {onClose && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-zinc-500 hover:text-red-400 p-1"
                            title="Fechar gráfico"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {onMaximize && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onMaximize();
                            }}
                            className="text-zinc-500 hover:text-amber-400 p-1"
                            title="Maximizar gráfico"
                        >
                            <MaximizeIcon />
                        </button>
                    )}
                    {TIMEFRAMES.map(tf => (
                        <button
                            key={tf}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTimeframeChange(tf);
                            }}
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${timeframe === tf ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>
            <div ref={ref} className="w-full relative flex-grow min-h-0 min-w-0">
                {isLoading && (
                    <div className="absolute inset-0 bg-zinc-900 bg-opacity-80 flex flex-col items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                        <p className="text-zinc-400 mt-3 text-xs">Carregando {timeframe}...</p>
                    </div>
                )}
                {wsStatus === 'connecting' && !isLoading && !chartError && (
                    <div className="absolute inset-0 bg-zinc-900 bg-opacity-80 flex flex-col items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                        <p className="text-zinc-400 mt-3 text-xs">Conectando...</p>
                    </div>
                )}
                {chartError && !isLoading && (
                    <div className="absolute inset-0 bg-zinc-900 bg-opacity-80 flex items-center justify-center z-10">
                        <p className="text-red-400 text-center p-4 text-xs">{chartError}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chart;