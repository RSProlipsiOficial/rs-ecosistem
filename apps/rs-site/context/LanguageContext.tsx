
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { initialContent } from '../config/content';

export type Language = 'pt' | 'en' | 'es';
type Content = typeof initialContent;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  content: Content;
  setContent: React.Dispatch<React.SetStateAction<Content>>;
  // FIX: Added updateContent to allow components to modify static text.
  updateContent: (language: Language, key: string, value: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [content, setContent] = useState<Content>(initialContent);

  const t = useCallback((key: string): string => {
    return content[language][key] || key;
  }, [language, content]);

  // FIX: Implemented updateContent to modify the content state.
  const updateContent = useCallback((lang: Language, key: string, value: string) => {
    setContent(prevContent => ({
      ...prevContent,
      [lang]: {
        ...prevContent[lang],
        [key]: value,
      },
    }));
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, content, setContent, updateContent }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};