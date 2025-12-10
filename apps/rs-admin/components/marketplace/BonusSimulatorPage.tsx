import React, { useState, useMemo } from 'react';
import { ScaleIcon, CycleIcon, ShareIcon, TrophyIcon, StarIcon, CareerIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon, CubeIcon, TrashIcon, PlusIcon, ChartBarIcon, RefreshIcon } from '../icons';

// --- HELPER COMPONENTS ---
const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
        <header className="flex items-center p-4 bg-black/30 border-b border-gray-800">
            {icon}
            <h3 className="text-lg font-semibold text-white ml-3">{title}</h3>
        </header>
        <div className="p-6 flex-grow">{children}</div>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string | number; description?: string; isCurrency?: boolean; highlight?: 'positive' | 'negative' | 'neutral' }> = ({ label, value, description, isCurrency = true, highlight = 'neutral' }) => {
    const highlightClasses = {
        positive: 'text-green-400',
        negative: 'text-red-400',
        neutral: 'text-white'
    };
    return (
        <div className="flex justify-between items-start py-2.5 border-b border-gray-800/50 last:border-b-0">
            <div>
                <p className="text-sm text-gray-300">{label}</p>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
            <p className={`text-base font-semibold text-right ${highlightClasses[highlight]}`}>
                {typeof value === 'number' && isCurrency ? formatCurrency(value) : value}
            </p>
        </div>
    );
};

const LabeledInput: React.FC<{ label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, adornment?: string, name?: string }> = ({ label, value, onChange, adornment, name }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <div className="relative">
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                className="bg-gray-800 border border-gray-700 text-white text-base rounded-lg p-2 w-full focus:ring-yellow-500 focus:border-yellow-500 pr-10"
            />
            {adornment && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none text-sm">{adornment}</span>}
        </div>
    </div>
);


// --- TYPE DEFINITIONS ---
interface ProductCostItem {
  id: number;
  name: string;
  salesMixPercent: number;
  quantity: number;
  labelsCost: number;
  unitCost: number;
  multiplier: number;
  finalSalePrice: number;
}


// --- MAIN SIMULATOR COMPONENT ---
const BonusSimulatorPage: React.FC = () => {
    // --- STATE ---
    // Simulação SIGME state
    const [totalActivations, setTotalActivations] = useState(1000);
    const [productValue, setProductValue] = useState(120);
    const [consultantPrice, setConsultantPrice] = useState(60);
    const [topSigmePercentage, setTopSigmePercentage] = useState(9);
    
    // Cost Calculator state
    const [products, setProducts] = useState<ProductCostItem[]>([
        { id: 1, name: 'Inflamax Cps', salesMixPercent: 21, quantity: 1, labelsCost: 0, unitCost: 14.81, multiplier: 4, finalSalePrice: 60.00 },
        { id: 2, name: 'Abacate Cps', salesMixPercent: 27, quantity: 1, labelsCost: 0.76, unitCost: 10.26, multiplier: 4, finalSalePrice: 45.00 },
        { id: 3, name: 'OzêniPró', salesMixPercent: 23, quantity: 1, labelsCost: 0.33, unitCost: 7.33, multiplier: 5, finalSalePrice: 38.00 },
        { id: 4, name: 'GlicoLipsi', salesMixPercent: 7, quantity: 1, labelsCost: 0, unitCost: 18.51, multiplier: 3.79, finalSalePrice: 70.00 },
        { id: 5, name: 'AlphaLipsi', salesMixPercent: 0, quantity: 1, labelsCost: 0.29, unitCost: 9.79, multiplier: 4, finalSalePrice: 57.00 },
        { id: 6, name: 'DivaLipsi', salesMixPercent: 0, quantity: 1, labelsCost: 0.29, unitCost: 9.29, multiplier: 4, finalSalePrice: 63.00 },
        { id: 7, name: 'SlimLipsi', salesMixPercent: 0, quantity: 1, labelsCost: 0.29, unitCost: 10.29, multiplier: 4, finalSalePrice: 70.00 },
    ]);
    
    // Sales simulation state
    const [salesForecast, setSalesForecast] = useState(1000);

    // Career Plan state
    const [careerPlanTiers] = useState([
        { name: 'Pin Bronze', cycles: 5, bonus: 13.50 },
        { name: 'Pin Prata', cycles: 15, bonus: 40.50 },
        { name: 'Pin Ouro', cycles: 70, bonus: 189.00 },
        { name: 'Pin Safira', cycles: 150, bonus: 405.00 },
        { name: 'Pin Esmeralda', cycles: 300, bonus: 810.00 },
        { name: 'Pin Topázio', cycles: 500, bonus: 1350.00 },
        { name: 'Pin Rubi', cycles: 750, bonus: 2025.00 },
        { name: 'Pin Diamante', cycles: 1500, bonus: 4050.00 },
        { name: 'Pin Diamante Duplo', cycles: 3000, bonus: 18450.00 },
        { name: 'Pin Diamante Triplo', cycles: 5000, bonus: 36450.00 },
        { name: 'Pin Diamante Red', cycles: 15000, bonus: 105300.00 },
        { name: 'Pin Diamante Blue', cycles: 25000, bonus: 67500.00 },
        { name: 'Pin Diamante Black', cycles: 50000, bonus: 135000.00 },
    ]);

    const [careerInputs, setCareerInputs] = useState<Record<string, number>>(
        careerPlanTiers.reduce((acc, tier) => ({ ...acc, [tier.name]: 0 }), {})
    );

    // --- HANDLERS ---
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(Number(e.target.value) >= 0 ? Number(e.target.value) : 0);
    };
    const handleCareerInputChange = (tierName: string, value: string) => {
        setCareerInputs(prev => ({...prev, [tierName]: Number(value) >= 0 ? Number(value) : 0 }));
    };
    const handleProductChange = (id: number, field: keyof ProductCostItem, value: string | number) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    const addProduct = () => { setProducts(prev => [...prev, { id: Date.now(), name: 'Novo Produto', salesMixPercent: 0, quantity: 1, labelsCost: 0, unitCost: 0, multiplier: 4, finalSalePrice: 0 }]); };
    const removeProduct = (id: number) => { setProducts(prev => prev.filter(p => p.id !== id)); };

    // --- CALCULATIONS ---
    const simulationResults = useMemo(() => {
        const grossMerchandiseValue = totalActivations * productValue;
        const consultantDiscount = totalActivations * (productValue - consultantPrice);
        const companyRevenue = totalActivations * consultantPrice;
        
        const numCycles = Math.floor(totalActivations / 6);
        const matrizBonus = companyRevenue * 0.195; // REVERTED
        const fidelidadeBonus = companyRevenue * 0.075; // REVERTED
        const cicloRevenue = numCycles * 360;
        const cicloGlobalCyclerBonus = numCycles * 108;
        const topSigmePool = cicloRevenue * (topSigmePercentage / 100);
        const careerBonus = careerPlanTiers.reduce((acc, tier) => acc + (careerInputs[tier.name] || 0) * tier.bonus, 0);
        
        const totalBonus = matrizBonus + fidelidadeBonus + cicloGlobalCyclerBonus + topSigmePool + careerBonus;
        const netProfit = companyRevenue - totalBonus; // REVERTED

        return { grossMerchandiseValue, consultantDiscount, companyRevenue, numCycles, matrizBonus, fidelidadeBonus, cicloGlobalCyclerBonus, topSigmePool, careerBonus, totalBonus, netProfit };
    }, [totalActivations, productValue, consultantPrice, topSigmePercentage, careerInputs, careerPlanTiers]);
    
    const productTableTotals = useMemo(() => {
        return products.reduce((totals, p) => {
            const quantity = Number(p.quantity) || 0;
            const internalSalePrice = p.unitCost * p.multiplier;
            const profit1_per_unit = p.multiplier >= 5 ? p.unitCost : p.unitCost * 0.8;
            const profit2_per_unit = p.finalSalePrice - internalSalePrice;
            const netProfit_per_unit = profit1_per_unit + profit2_per_unit - p.labelsCost;
            
            totals.totalQuantity += quantity;
            totals.totalInternalSalePrice += internalSalePrice * quantity;
            totals.totalProfit1 += profit1_per_unit * quantity;
            totals.totalFinalSalePrice += p.finalSalePrice * quantity;
            totals.totalProfit2 += profit2_per_unit * quantity;
            totals.totalNetProfit += netProfit_per_unit * quantity;
            return totals;
        }, {
            totalQuantity: 0,
            totalInternalSalePrice: 0,
            totalProfit1: 0,
            totalFinalSalePrice: 0,
            totalProfit2: 0,
            totalNetProfit: 0,
        });
    }, [products]);

    const salesSimulationResults = useMemo(() => {
        const totalSalesUnits = salesForecast;
        let totalRevenue = 0;
        let totalCogs = 0;

        products.forEach(p => {
            const salesForThisProduct = totalSalesUnits * (p.salesMixPercent / 100);
            totalRevenue += salesForThisProduct * p.finalSalePrice;
            totalCogs += salesForThisProduct * (p.unitCost + p.labelsCost);
        });

        const grossProfit = totalRevenue - totalCogs;
        const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

        return { totalRevenue, totalCogs, grossProfit, grossMargin };
    }, [salesForecast, products]);
    
    // --- RENDER ---
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <header className="flex items-center">
                <ScaleIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Painel Financeiro Avançado</h1>
            </header>

             <Card title="Calculadora de Custo e Lucratividade por Produto" icon={<CubeIcon className="w-6 h-6 text-yellow-500" />}>
                 <div className="overflow-x-auto -m-6">
                    <table className="w-full text-sm min-w-[1200px]">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-2 py-3 text-left">Produto</th>
                                <th className="px-2 py-3 text-left">Mix Vendas (%)</th>
                                <th className="px-2 py-3 text-left">Rotulos</th>
                                <th className="px-2 py-3 text-left">Custo Unit.</th>
                                <th className="px-2 py-3 text-left">Multiplicador</th>
                                <th className="px-2 py-3 text-left">Venda Interna</th>
                                <th className="px-2 py-3 text-left">Lucro 1</th>
                                <th className="px-2 py-3 text-left">Valor Venda Final</th>
                                <th className="px-2 py-3 text-left">Lucro 2</th>
                                <th className="px-2 py-3 text-left">Lucro Líquido</th>
                                <th className="px-2 py-3 text-left">LL (%)</th>
                                <th className="px-2 py-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => {
                                const internalSalePrice = p.unitCost * p.multiplier;
                                const profit1_per_unit = p.multiplier >= 5 ? p.unitCost : p.unitCost * 0.8;
                                const profit2_per_unit = p.finalSalePrice - internalSalePrice;
                                const netProfit_per_unit = profit1_per_unit + profit2_per_unit - p.labelsCost;
                                const netProfitPercent = p.finalSalePrice > 0 ? (netProfit_per_unit / p.finalSalePrice) * 100 : 0;
                                
                                return (
                                    <tr key={p.id} className="border-t border-gray-800/50">
                                        {[
                                            {field: 'name', type: 'text', value: p.name, style: {width: '180px'}},
                                            {field: 'salesMixPercent', type: 'number', value: p.salesMixPercent, style: {width: '100px'}},
                                            {field: 'labelsCost', type: 'number', value: p.labelsCost, style: {width: '80px'}},
                                            {field: 'unitCost', type: 'number', value: p.unitCost, style: {width: '90px'}},
                                            {field: 'multiplier', type: 'number', value: p.multiplier, style: {width: '90px'}},
                                        ].map(item => (
                                            <td key={item.field} className="p-1"><input type={item.type} value={item.value} onChange={(e) => handleProductChange(p.id, item.field as keyof ProductCostItem, e.target.value)} style={item.style} className="bg-gray-800 border-gray-700 rounded-md p-2 w-full text-sm"/></td>
                                        ))}
                                        <td className="p-1"><div className="p-2 text-sm w-[100px]">{formatCurrency(internalSalePrice)}</div></td>
                                        <td className="p-1"><div className={`p-2 text-sm w-[100px] ${profit1_per_unit >=0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(profit1_per_unit)}</div></td>
                                        <td className="p-1"><input type="number" value={p.finalSalePrice} onChange={(e) => handleProductChange(p.id, 'finalSalePrice', e.target.value)} style={{width: '100px'}} className="bg-gray-800 border-gray-700 rounded-md p-2 w-full text-sm"/></td>
                                        <td className="p-1"><div className={`p-2 text-sm w-[100px] ${profit2_per_unit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(profit2_per_unit)}</div></td>
                                        <td className="p-1"><div className={`p-2 rounded-md font-semibold text-sm w-[110px] ${netProfit_per_unit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netProfit_per_unit)}</div></td>
                                        <td className="p-1"><div className={`p-2 rounded-md font-semibold text-sm w-[90px] ${netProfitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{`${netProfitPercent.toFixed(2)}%`}</div></td>
                                        <td className="p-1 text-center"><button onClick={() => removeProduct(p.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4"/></button></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4"><button onClick={addProduct} className="flex items-center gap-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 text-sm"><PlusIcon className="w-5 h-5"/>Adicionar Produto</button></div>
            </Card>

            <Card title="Simulador de Vendas e Lucratividade" icon={<ChartBarIcon className="w-6 h-6 text-yellow-500" />}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <LabeledInput label="Previsão de Vendas (Unidades/Mês)" value={salesForecast} onChange={handleInputChange(setSalesForecast)} adornment="un." />
                    <div>
                        <InfoRow label="Faturamento Bruto Total" value={salesSimulationResults.totalRevenue} description="Baseado no mix de vendas e preço final" highlight="neutral" />
                        <InfoRow label="Custo Total dos Produtos (CPV)" value={-salesSimulationResults.totalCogs} highlight="negative" />
                        <div className="mt-4 pt-4 border-t-2 border-yellow-500/50">
                             <InfoRow label="Lucro Bruto das Vendas" value={salesSimulationResults.grossProfit} highlight="positive" />
                             <InfoRow label="Margem de Lucro Bruta Média" value={`${salesSimulationResults.grossMargin.toFixed(2)} %`} isCurrency={false} highlight="positive" />
                        </div>
                    </div>
                </div>
            </Card>
            
            <Card title="Plano de Carreira (PINs)" icon={<CareerIcon className="w-6 h-6 text-yellow-500" />}>
                <p className="text-sm text-gray-400 mb-4">Insira o número de consultores que atingiram cada PIN no período da simulação.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {careerPlanTiers.map(tier => 
                        <div key={tier.name}>
                            <label className="block text-xs font-medium text-gray-400 mb-1">{tier.name}</label>
                            <input type="number" value={careerInputs[tier.name] || ''} onChange={(e) => handleCareerInputChange(tier.name, e.target.value)} className="bg-gray-800 border-gray-700 rounded-lg p-2 text-sm w-full" placeholder="Nº de consultores" />
                        </div>
                    )}
                </div>
            </Card>
            
            <Card title="Parâmetros Globais da Simulação de Bônus" icon={<ClipboardDocumentListIcon className="w-6 h-6 text-yellow-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <LabeledInput label="Número de Ativações" value={totalActivations} onChange={handleInputChange(setTotalActivations)} />
                    <LabeledInput label="Valor do Produto (Final)" value={productValue} onChange={handleInputChange(setProductValue)} adornment="R$" />
                    <LabeledInput label="Preço para Consultor" value={consultantPrice} onChange={handleInputChange(setConsultantPrice)} adornment="R$" />
                    <LabeledInput label="Bônus Top SIGME" value={topSigmePercentage} onChange={handleInputChange(setTopSigmePercentage)} adornment="%" />
                </div>
            </Card>

            <h2 className="text-2xl font-bold text-yellow-500 mt-12 mb-4 border-t border-gray-700 pt-8">Simulação de Bônus SIGME (Resultado)</h2>
             <Card title="Resumo Financeiro da Operação" icon={<TrophyIcon className="w-6 h-6 text-yellow-500" />}>
                 <InfoRow label="Faturamento Bruto (GMV)" value={simulationResults.grossMerchandiseValue} description={`${totalActivations} x ${formatCurrency(productValue)}`} highlight="neutral" />
                 <InfoRow label="(-) Desconto ao Consultor" value={-simulationResults.consultantDiscount} highlight="negative" />
                 <InfoRow label="(=) Receita da Empresa" value={simulationResults.companyRevenue} description={`${totalActivations} x ${formatCurrency(consultantPrice)}`} highlight="neutral" />
                 <InfoRow label="(-) Total de Bônus Pagos" value={-simulationResults.totalBonus} highlight="negative" />
                 <div className={`mt-4 pt-4 border-t-2 ${simulationResults.netProfit >= 0 ? 'border-green-500/50' : 'border-red-500/50'}`}>
                    <InfoRow label="(=) Lucro Líquido (do Bônus)" value={simulationResults.netProfit} highlight={simulationResults.netProfit >= 0 ? 'positive' : 'negative'} />
                 </div>
            </Card>

            <Card title="Detalhamento dos Bônus Pagos" icon={<ShareIcon className="w-6 h-6 text-yellow-500" />}>
                <InfoRow label="Bônus Matrizes (Rede)" value={-simulationResults.matrizBonus} description="19.5% sobre a Receita da Empresa" highlight="negative" />
                <InfoRow label="Bônus Fidelidade" value={-simulationResults.fidelidadeBonus} description="7.5% sobre a Receita da Empresa" highlight="negative" />
                <InfoRow label="Bônus Ciclo Global (Cicladora)" value={-simulationResults.cicloGlobalCyclerBonus} description={`${simulationResults.numCycles} ciclos de ${formatCurrency(108)}`} highlight="negative" />
                <InfoRow label="Bônus Top SIGME" value={-simulationResults.topSigmePool} description={`${topSigmePercentage}% sobre Faturamento dos Ciclos`} highlight="negative" />
                <InfoRow label="Bônus Plano de Carreira" value={-simulationResults.careerBonus} description={`Custo por ativação: ${formatCurrency(simulationResults.careerBonus / (totalActivations || 1))}`} highlight="negative" />
            </Card>
        </div>
    );
};

export default BonusSimulatorPage;