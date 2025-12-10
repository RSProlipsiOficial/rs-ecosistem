import React, { useEffect, useState } from 'react';

interface Tier { id: string; name: string; pointsRequired: number; reward: number; }
interface Settings { frequency: 'Semanal'|'Mensal'|'Trimestral'|'Semestral'|'Anual'; dropshippingPointsPerBrl: number; affiliatePointsPerBrl: number; tiers: Tier[]; }

const defaultSettings: Settings = { frequency: 'Trimestral', dropshippingPointsPerBrl: 1, affiliatePointsPerBrl: 1.5, tiers: [] };

const CompensationPlanAdmin: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch((import.meta as any).env?.VITE_API_URL + '/v1/compensation/settings');
        const data = await res.json().catch(()=>({ success:false }));
        if (data && data.success !== false && data.data) setSettings(data.data as Settings);
      } finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch((import.meta as any).env?.VITE_API_URL + '/v1/compensation/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      const data = await res.json().catch(()=>({ success:false }));
      if (data && data.success === false) alert(data.error || 'Falha ao salvar'); else alert('Salvo');
    } finally { setSaving(false); }
  };

  const addTier = () => {
    const id = `tier-${Date.now()}`;
    setSettings(prev => ({ ...prev, tiers: [...prev.tiers, { id, name: 'Novo Nível', pointsRequired: 1000, reward: 100 }] }));
  };

  const removeTier = (id: string) => setSettings(prev => ({ ...prev, tiers: prev.tiers.filter(t => t.id !== id) }));

  if (loading) return <div className="p-4">Carregando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button disabled={saving} onClick={save} className={`px-4 py-2 rounded font-bold ${saving?'bg-gray-600 cursor-not-allowed':'bg-yellow-500 text-black'}`}>{saving?'Salvando...':'Salvar'}</button>
      </div>
      <div className="bg-black border border-gray-800 rounded p-4">
        <h3 className="font-bold mb-2">Frequência da Premiação</h3>
        <p className="text-sm text-gray-400 mb-4">Escolha a periodicidade em que os bônus do plano de compensação serão calculados e pagos.</p>
        <label className="block text-sm mb-2">Frequência de Pagamento</label>
        <select value={settings.frequency} onChange={e=>setSettings(prev=>({ ...prev, frequency: e.target.value as Settings['frequency'] }))} className="w-full bg-gray-800 border-2 border-gray-700 rounded py-2 px-3">
          {['Semanal','Mensal','Trimestral','Semestral','Anual'].map(f=>(<option key={f} value={f}>{f}</option>))}
        </select>
      </div>
      <div className="bg-black border border-gray-800 rounded p-4">
        <h3 className="font-bold mb-2">Regras de Pontuação</h3>
        <p className="text-sm text-gray-400 mb-4">Defina quantos pontos são gerados por cada R$ 1 vendido.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Pontos por R$1 vendido (Dropshipping)</label>
            <input type="number" step="0.1" value={settings.dropshippingPointsPerBrl} onChange={e=>setSettings(prev=>({ ...prev, dropshippingPointsPerBrl: Number(e.target.value) }))} className="w-full bg-gray-800 border-2 border-gray-700 rounded py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm mb-2">Pontos por R$1 vendido (Afiliados)</label>
            <input type="number" step="0.1" value={settings.affiliatePointsPerBrl} onChange={e=>setSettings(prev=>({ ...prev, affiliatePointsPerBrl: Number(e.target.value) }))} className="w-full bg-gray-800 border-2 border-gray-700 rounded py-2 px-3" />
          </div>
        </div>
      </div>
      <div className="bg-black border border-gray-800 rounded">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold">Níveis de Premiação ({settings.frequency})</h3>
            <p className="text-sm text-gray-400">Crie os níveis de recompensa baseados na pontuação.</p>
          </div>
          <button onClick={addTier} className="px-3 py-2 rounded bg-gray-700 text-white">+ Adicionar Nível</button>
        </div>
        <div className="p-4 space-y-3">
          {settings.tiers.map(t=> (
            <div key={t.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <input value={t.name} onChange={e=>setSettings(prev=>({ ...prev, tiers: prev.tiers.map(x=>x.id===t.id?{...x,name:e.target.value}:x) }))} className="bg-gray-800 border-2 border-gray-700 rounded py-2 px-3" />
              <input type="number" value={t.pointsRequired} onChange={e=>setSettings(prev=>({ ...prev, tiers: prev.tiers.map(x=>x.id===t.id?{...x,pointsRequired:Number(e.target.value)}:x) }))} className="bg-gray-800 border-2 border-gray-700 rounded py-2 px-3" />
              <input type="number" value={t.reward} onChange={e=>setSettings(prev=>({ ...prev, tiers: prev.tiers.map(x=>x.id===t.id?{...x,reward:Number(e.target.value)}:x) }))} className="bg-gray-800 border-2 border-gray-700 rounded py-2 px-3" />
              <button onClick={()=>removeTier(t.id)} className="px-3 py-2 rounded bg-red-600 text-white">Excluir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompensationPlanAdmin;
