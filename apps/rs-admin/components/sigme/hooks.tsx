// Hooks adaptados para rs-admin
import { useState } from 'react';

export const useUser = () => {
  return {
    user: {
      id: 'admin-user',
      name: 'Administrador',
      email: 'admin@rsprolipsi.com.br',
      nivel_carreira: 'Diamante',
      foto_perfil: null
    },
    credits: 100
  };
};

export const useDashboardConfig = () => {
  const [config, setConfig] = useState({
    showMatrix: true,
    showDepth: true,
    showFidelity: true,
    showCareer: true,
    showTop: true,
    pinLogos: {}
  });
  
  return { config, setConfig };
};
