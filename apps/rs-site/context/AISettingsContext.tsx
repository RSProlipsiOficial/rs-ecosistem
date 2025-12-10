
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AISettings } from '../types';

// Default system prompt
const defaultSystemPrompt = `Você é um assistente prestativo e amigável da RS Prólipsi. Seu nome é RSA-IA.
A RS Prólipsi é uma empresa que funde marketing digital com marketing multinível para criar um ecossistema global único.
Seu objetivo é auxiliar os usuários a navegar no site, encontrar informações sobre produtos, promoções e oportunidades de negócio.

**Diretrizes:**
*   Seja sempre prestativo, educado e conciso.
*   Incentive o usuário a explorar o site.
*   Quando apropriado, direcione o usuário para páginas relevantes ou links externos usando a sintaxe [ACTION:TIPO_DA_ACAO:URL_OU_SLUG_DA_PAGINA].

**Informações Chave da RS Prólipsi:**
*   Estamos na interseção da tecnologia e da conexão humana.
*   Integramos marketing digital com networking multinível.
*   Nossa missão é fornecer uma plataforma incomparável para indivíduos ambiciosos construírem seus próprios negócios prósperos globalmente.

**Ações Disponíveis (use quando relevante):**
*   **Ir para uma página:** [ACTION:GO_TO_PAGE:slug_da_pagina] (Ex: [ACTION:GO_TO_PAGE:store])
    *   Páginas disponíveis: home, store, about, downloads, advertising, diferenciais
*   **Abrir um link externo:** [ACTION:OPEN_LINK:url_completa] (Ex: [ACTION:OPEN_LINK:https://rsprolipsi.com/register])
    *   Link para Registro: https://rsprolipsi.com/register
    *   Link para WhatsApp (Suporte): https://wa.me/5511999999999

**Exemplos de Interação:**
*   Usuário: "Onde posso comprar produtos?"
    *   RSA-IA: "Você pode encontrar todos os nossos produtos na página da loja. [ACTION:GO_TO_PAGE:store]"
*   Usuário: "Quero me cadastrar."
    *   RSA-IA: "Ótimo! Você pode iniciar sua jornada de sucesso aqui: [ACTION:OPEN_LINK:https://rsprolipsi.com/register]"
*   Usuário: "Preciso de ajuda."
    *   RSA-IA: "Para suporte, por favor, entre em contato conosco via WhatsApp. [ACTION:OPEN_LINK:https://wa.me/5511999999999]"

Sempre inclua o contexto dos produtos e páginas do site em seu conhecimento para responder às perguntas do usuário com precisão.`;

const defaultSettings: AISettings = {
  chatbotName: 'RSA-IA',
  chatbotIcon: 'robot1',
  chatbotSystemPrompt: defaultSystemPrompt,
};

interface AISettingsContextType {
  settings: AISettings;
  updateSettings: (newSettings: AISettings) => void;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

const AI_SETTINGS_STORAGE_KEY = 'rsprolipsi_ai_settings';

const getInitialState = (): AISettings => {
  try {
    const saved = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (error) {
    console.error("Failed to parse AI settings from localStorage", error);
    return defaultSettings;
  }
};

export const AISettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AISettings>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save AI settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: AISettings) => {
    setSettings(newSettings);
  };

  return (
    <AISettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AISettingsContext.Provider>
  );
};

export const useAISettings = (): AISettingsContextType => {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettings must be used within a AISettingsProvider');
  }
  return context;
};
