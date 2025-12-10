import React from 'react'
import Card from '../Card'

const Stores: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Admin Marketplace — Lojas</h2>
      <Card>
        <p className="text-sm text-gray-300">Gerencie as lojas do Marketplace (cadastro, status, configurações básicas).</p>
        <div className="mt-4 text-xs text-gray-400">Lista de lojas em desenvolvimento.</div>
      </Card>
    </div>
  )
}

export default Stores
