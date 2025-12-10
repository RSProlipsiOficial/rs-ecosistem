import React from 'react'
import Card from '../Card'

const Config: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Admin Marketplace — Configurações</h2>
      <Card>
        <p className="text-sm text-gray-300">Parâmetros globais do Marketplace (políticas, integrações, aparência).</p>
        <div className="mt-4 text-xs text-gray-400">Configurações gerais em desenvolvimento.</div>
      </Card>
    </div>
  )
}

export default Config
