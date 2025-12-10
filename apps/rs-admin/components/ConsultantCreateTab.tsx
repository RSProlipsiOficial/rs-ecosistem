import React, { useState } from 'react'
import { consultantsAPI } from '../src/services/api'

const ConsultantCreateTab: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [username, setUsername] = useState('')
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [pin, setPin] = useState('Consultor')
  const [sigmaActive, setSigmaActive] = useState<'Sim' | 'Não'>('Não')
  const [sponsorQuery, setSponsorQuery] = useState('')
  const [sponsorSelected, setSponsorSelected] = useState<{ id: string; code: string; name: string; username: string } | null>(null)
  const [lookupResults, setLookupResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLookup = async (q: string) => {
    setSponsorQuery(q)
    if (!q || q.length < 2) { setLookupResults([]); return }
    try {
      const r = await consultantsAPI.lookup(q)
      setLookupResults((r as any)?.data?.results || [])
    } catch { }
  }

  const handleGeneratePassword = () => {
    const rnd = Math.random().toString(36).slice(2, 8)
    setSenha(`RS${rnd}`)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      const payload = {
        nome,
        email,
        telefone,
        cpf,
        username,
        codigo_consultor: codigo,
        senha,
        pin_inicial: pin,
        ativo_sigma: sigmaActive === 'Sim',
        patrocinador_ref: sponsorSelected?.code || sponsorSelected?.username || sponsorQuery || ''
      }
      const r = await consultantsAPI.create(payload)
      if ((r as any)?.status === 200) {
        setSuccess('Consultor cadastrado com sucesso')
        setTimeout(() => setSuccess(''), 3000)
        setNome(''); setEmail(''); setTelefone(''); setCpf(''); setUsername(''); setCodigo(''); setSenha(''); setPin('Consultor'); setSponsorQuery(''); setSponsorSelected(null); setLookupResults([])
        onCreated()
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black/50 border border-gray-800 rounded-xl p-6 space-y-6">
      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400">Nome completo</label>
          <input className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={nome} onChange={e => setNome(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-400">E-mail</label>
          <input className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Telefone</label>
          <input className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={telefone} onChange={e => setTelefone(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-400">CPF</label>
          <input className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={cpf} onChange={e => setCpf(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Login/Username</label>
          <input className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-400">ID numérico (Código)</label>
          <input className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={codigo} onChange={e => setCodigo(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Senha inicial</label>
          <div className="flex gap-2">
            <input className="flex-1 mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={senha} onChange={e => setSenha(e.target.value)} />
            <button className="mt-1 px-3 py-2 bg-yellow-600 rounded" onClick={handleGeneratePassword}>Gerar</button>
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400">PIN inicial</label>
          <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={pin} onChange={e => setPin(e.target.value)}>
            <option value="Consultor">Consultor</option>
            <option value="Bronze">Bronze</option>
            <option value="Prata">Prata</option>
            <option value="Ouro">Ouro</option>
            <option value="Diamante">Diamante</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400">Ativo SIGMA</label>
          <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={sigmaActive} onChange={e => setSigmaActive(e.target.value as any)}>
            <option>Não</option>
            <option>Sim</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-400">Patrocinador / Indicador</label>
        <input className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2" value={sponsorQuery} onChange={e => handleLookup(e.target.value)} placeholder="Buscar por ID, login ou nome" />
        {lookupResults.length > 0 && (
          <div className="mt-2 bg-gray-900 border border-gray-700 rounded">
            {lookupResults.map((r) => (
              <button key={r.id} className="w-full text-left px-3 py-2 hover:bg-gray-800" onClick={() => { setSponsorSelected(r); setSponsorQuery(r.code || r.username || r.name); setLookupResults([]) }}>
                {(r.code || '')} {(r.username ? `(${r.username})` : '')} {r.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <button className="px-4 py-2 bg-gray-700 rounded" onClick={async () => {
          try {
            const r = await consultantsAPI.getSpreadsheetModel('xlsx')
            const blob = (r as any).data as Blob
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'modelo_rs_consultores.xlsx'
            document.body.appendChild(a)
            a.click()
            URL.revokeObjectURL(url)
            a.remove()
          } catch (e: any) {
            setError(e?.message || 'Erro ao baixar modelo')
          }
        }}>Baixar modelo XLSX</button>
        <button className="px-4 py-2 bg-yellow-600 rounded" onClick={handleSubmit} disabled={loading}>Cadastrar</button>
      </div>
    </div>
  )
}

export default ConsultantCreateTab
