import React from 'react'
import Card from '../Card'

const Permissions: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Admin Marketplace — Permissões / Super Admin</h2>
      <Card>
        <p className="text-sm text-gray-300">Controle de acesso ao Marketplace (funções, escopos e privilégios).</p>
        <div className="mt-4 text-xs text-gray-400">Gestão de permissões em desenvolvimento.</div>
      </Card>
    </div>
  )
}

export default Permissions
