
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

// Note: This component requires 'recharts' to be installed.

const lineChartData = [
  { name: 'D-6', creditos: 4000, debitos: 2400 },
  { name: 'D-5', creditos: 3000, debitos: 1398 },
  { name: 'D-4', creditos: 2000, debitos: 9800 },
  { name: 'D-3', creditos: 2780, debitos: 3908 },
  { name: 'D-2', creditos: 1890, debitos: 4800 },
  { name: 'D-1', creditos: 2390, debitos: 3800 },
  { name: 'Hoje', creditos: 3490, debitos: 4300 },
];

const pieChartData = [
  { name: 'Comissões', value: 45670 },
  { name: 'Bônus de Rede', value: 32100 },
  { name: 'Vendas Diretas', value: 18540 },
  { name: 'Outros', value: 5890 },
];
const COLORS = ['#FFD700', '#EAC100', '#D4AC0D', '#B8950C'];


const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


const CustomLineChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-text-title">{label}</p>
        <p style={{ color: '#38C793' }}>{`Créditos: ${formatCurrency(payload[0].value)}`}</p>
        <p style={{ color: '#EF5A5A' }}>{`Débitos: ${formatCurrency(payload[1].value)}`}</p>
      </div>
    );
  }
  return null;
};

const CustomPieChartTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const total = pieChartData.reduce((sum, entry) => sum + entry.value, 0);
        const percent = ((data.value / total) * 100).toFixed(2);
        return (
            <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                <p className="font-semibold text-text-title">{`${data.name}: ${formatCurrency(data.value / 100)} (${percent}%)`}</p>
            </div>
        );
    }
    return null;
};

export const EvolutionChart: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border h-96">
      <h3 className="text-lg font-semibold text-text-title mb-4">Evolução de Fluxo de Caixa</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A303B" />
          <XAxis dataKey="name" stroke="#B7C0CD" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#B7C0CD" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
          <Tooltip content={<CustomLineChartTooltip />} />
          <Legend wrapperStyle={{fontSize: "14px"}}/>
          <Line type="monotone" dataKey="creditos" stroke="#38C793" strokeWidth={2} dot={{ r: 4, fill: '#38C793' }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="debitos" stroke="#EF5A5A" strokeWidth={2} dot={{ r: 4, fill: '#EF5A5A' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const IncomeBreakdownChart: React.FC = () => {
    return (
        <div className="bg-card p-6 rounded-2xl border border-border h-96">
            <h3 className="text-lg font-semibold text-text-title mb-4">Receitas por Origem (Mês)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomPieChartTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{fontSize: "14px"}}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
