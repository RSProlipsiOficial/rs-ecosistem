import React from 'react'
import Card from '../Card'

const Overview: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Admin Marketplace — Visão Geral</h2>
      <Card>
        <p className="text-sm text-gray-300">Resumo operacional do Marketplace. Aqui você acompanha números-chave e atalhos administrativos.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-[#121212] rounded border border-[#2A2A2A]"><p className="text-xs text-gray-400">Lojas ativas</p><p className="text-2xl font-bold">--</p></div>
          <div className="p-4 bg-[#121212] rounded border border-[#2A2A2A]"><p className="text-xs text-gray-400">Lojistas</p><p className="text-2xl font-bold">--</p></div>
          <div className="p-4 bg-[#121212] rounded border border-[#2A2A2A]"><p className="text-xs text-gray-400">Pedidos no dia</p><p className="text-2xl font-bold">--</p></div>
        </div>
      </Card>
    </div>
  )
}

export default Overview
