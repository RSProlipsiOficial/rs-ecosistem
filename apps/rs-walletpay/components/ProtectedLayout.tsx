import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { ensureWalletSession } from '../src/utils/walletSession';

const ProtectedLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      const session = await ensureWalletSession();

      if (!isMounted) {
        return;
      }

      if (!session?.userId) {
        navigate('/login', { replace: true });
        return;
      }

      setIsReady(true);
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-base text-text-body flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl px-6 py-5 text-sm text-text-soft">
          Validando acesso seguro...
        </div>
      </div>
    );
  }

  return <Layout />;
};

export default ProtectedLayout;
