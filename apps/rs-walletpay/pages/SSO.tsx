import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  extractWalletTokenFromLocation,
  hydrateWalletSessionFromToken,
} from '../src/utils/walletSession';

const SSO: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const processSSO = async () => {
      const token = extractWalletTokenFromLocation(location.search, window.location.hash);

      if (!token || token.trim().length === 0) {
        navigate('/login', { replace: true });
        return;
      }

      const session = await hydrateWalletSessionFromToken(token);

      if (!isMounted) {
        return;
      }

      if (session?.userId) {
        navigate('/app/dashboard', { replace: true });
        return;
      }

      navigate('/login', { replace: true });
    };

    processSSO();

    return () => {
      isMounted = false;
    };
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#E5E7EB]">
      <div className="card">
        <p>Processando acesso seguro...</p>
      </div>
    </div>
  );
};

export default SSO;
