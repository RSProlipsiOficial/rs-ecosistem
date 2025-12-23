import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../walletpay/walletpay.css';
import Layout from '../walletpay/components/Layout';
import Dashboard from '../walletpay/pages/Dashboard';
import Transactions from '../walletpay/pages/Transactions';
import Reports from '../walletpay/pages/Reports';
import MyNetwork from '../walletpay/pages/MyNetwork';
import Settings from '../walletpay/pages/Settings';
import Cards from '../walletpay/pages/Cards';
import MarketingHub from '../walletpay/pages/MarketingHub';
import SalesHub from '../walletpay/pages/SalesHub';
import PaymentsLayout from '../walletpay/pages/payments/PaymentsLayout';
import Charges from '../walletpay/pages/payments/Charges';
import Links from '../walletpay/pages/payments/Links';
import Saques from '../walletpay/pages/payments/Saques';
import Transferencias from '../walletpay/pages/payments/Transferencias';

// Componente que usa o sistema de rotas REAL do WalletPay
const WalletPayApp: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        
        {/* Main application layout */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          
          <Route path="payments" element={<PaymentsLayout />}>
            <Route index element={<Navigate to="cobrancas" replace />} />
            <Route path="cobrancas" element={<Charges />} />
            <Route path="links" element={<Links />} />
            <Route path="saques" element={<Saques />} />
            <Route path="transferencias" element={<Transferencias />} />
          </Route>

          <Route path="sales" element={<SalesHub />} />
          <Route path="marketing" element={<MarketingHub />} />
          <Route path="cards" element={<Cards />} />
          
          <Route path="reports" element={<Reports />} />
          <Route path="network" element={<MyNetwork />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default WalletPayApp;
