/**
 * 🚀 ROTAS DO SISTEMA - V1
 * 
 * Endpoints de configuração e informações do sistema
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';

const router = express.Router();

// GET /v1/system/config
router.get('/', async (req, res) => {
  try {
    // Buscar configurações do sistema
    const { data: config, error } = await supabase
      .from('system_config')
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }

    // Configuração padrão caso não exista no banco
    const defaultConfig = {
      name: 'RS Prólipsi',
      colors: {
        primary: '#000000',    // Preto
        secondary: '#FFD700',  // Dourado
        accent: '#B8860B'      // Dourado escuro
      },
      logo: '/logo.png',
      sigla: 'RSP',
      version: '1.0.0'
    };

    res.json(config || defaultConfig);

  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;