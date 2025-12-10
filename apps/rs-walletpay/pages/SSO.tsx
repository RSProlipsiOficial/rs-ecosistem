import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SSO: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token && token.trim().length > 0) {
      localStorage.setItem('token', token);
      navigate('/app/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
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
