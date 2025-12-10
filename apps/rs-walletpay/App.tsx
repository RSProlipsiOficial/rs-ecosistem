import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import PaymentsLayout from './pages/payments/PaymentsLayout';
import Charges from './pages/payments/Charges';
import Reports from './pages/Reports';
import MyNetwork from './pages/MyNetwork';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Links from './pages/payments/Links';
import Saques from './pages/payments/Saques';
import Transferencias from './pages/payments/Transferencias';
import Cards from './pages/Cards';
import MarketingHub from './pages/MarketingHub';
import SalesHub from './pages/SalesHub';
import Login from './pages/Login';
import SSO from './pages/SSO';

// Note: This application requires 'react-router-dom' and 'recharts' to be installed.
// Run: npm install react-router-dom recharts

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sso" element={<SSO />} />
        <Route path="/register" element={<Register />} />
        
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
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
