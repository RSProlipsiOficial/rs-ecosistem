import React from 'react'
import Card from '../Card'

const Sellers: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Admin Marketplace — Lojistas</h2>
      <Card>
        <p className="text-sm text-gray-300">Gestão de lojistas (aprovação, permissões e status).</p>
        <div className="mt-4 text-xs text-gray-400">Módulo em desenvolvimento.</div>
      </Card>
    </div>
  )
}

export default Sellers
