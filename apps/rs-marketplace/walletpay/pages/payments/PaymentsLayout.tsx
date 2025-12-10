
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const paymentTabs = [
  { name: 'Cobranças', path: 'cobrancas' },
  { name: 'Links de Pagamento', path: 'links' },
  { name: 'Saques', path: 'saques' },
  { name: 'Transferências', path: 'transferencias' },
];

const PaymentsLayout: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card p-4 pb-0 rounded-2xl border border-border shadow-custom-lg">
        <div className="px-2 pt-2">
            <h1 className="text-2xl font-bold text-text-title">Central de Pagamentos</h1>
            <p className="text-text-soft mt-1">Gerencie suas cobranças, saques, transferências e mais.</p>
        </div>
        <div className="mt-4 border-b border-border">
          <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
            {paymentTabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={({ isActive }) =>
                  `whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-gold text-gold'
                      : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default PaymentsLayout;



