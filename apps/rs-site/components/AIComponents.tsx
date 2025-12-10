import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLanguage } from '../context/LanguageContext';

// #region Helper Functions for API calls
export async function generateText(prompt: string, model: string = 'gemini-2.5-flash'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      // Instruct the AI to return HTML for better formatting in the RichTextEditor
      systemInstruction: "Sua resposta deve estar em formato HTML, usando tags como <p>, <strong>, <em>, <ul>, <ol>, <li>, <h2>, <h3> para formatação profissional. Foque na legibilidade e estrutura. Se apropriado, inclua um título principal (h2) e vários parágrafos. Tente ter de 300 a 500 palavras se o prompt não especificar o comprimento. Não inclua caracteres de markdown como **, *, #. Retorne apenas o conteúdo HTML. Garanta o fechamento adequado das tags HTML."
    }
  });
  return response.text;
}

export async function generateImage(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
    },
  });
  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
}

// #endregion

// #region AIPromptModal
interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => Promise<void>;
  title: string;
  placeholder: string;
  initialPrompt?: string; // New prop for initial prompt
  isLoading?: boolean;
}

export const AIPromptModal: React.FC<AIPromptModalProps> = ({ isOpen, onClose, onSubmit, title, placeholder, initialPrompt = '', isLoading: parentIsLoading = false }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(parentIsLoading);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
        setPrompt(initialPrompt); // Reset prompt when modal opens or initialPrompt changes
        setIsLoading(false); // Reset loading state
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(prompt);
      // We don't close here, the parent component decides when to close after onComplete/onInsert
    } catch (error) {
      console.error('AI Generation failed', error);
      alert(t('ai_error_generating'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-2xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-accent mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full h-32 bg-gray-800 border border-gray-600 rounded-md p-2 text-text-primary"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex justify-end items-center space-x-3 mt-4 pt-4 border-t border-border">
            {isLoading && <span className="text-sm text-text-secondary">Gerando...</span>}
            <button onClick={onClose} type="button" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">{t('admin_button_cancel')}</button>
            <button type="submit" disabled={isLoading || !prompt.trim()} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md disabled:opacity-50">
              {isLoading ? '...' : 'Gerar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// #endregion


// #region AITextGenerator
interface AITextGeneratorProps {
  onInsert: (text: string) => void;
  // FIX: This prop was changed to accept a single object argument to resolve a type inference issue.
  buildInitialPrompt: (context: { currentContent?: string, imageUrlContext?: string }) => string;
  modalTitle: string;
  modalPlaceholder: string;
  triggerText?: string;
  triggerIcon?: React.ReactNode;
  children?: React.ReactNode; // For custom trigger, e.g., a menu item
  className?: string; // For custom trigger, styling
  adTitle?: string; // Context for ad description generation
  adImageUrl?: string; // Context for ad description generation
}

export const AITextGenerator: React.FC<AITextGeneratorProps> = ({ onInsert, buildInitialPrompt, modalTitle, modalPlaceholder, triggerText, triggerIcon = null, children, className, adTitle = '', adImageUrl = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = () => {
    // Pass relevant context to buildInitialPrompt
    setInitialPrompt(buildInitialPrompt({ currentContent: adTitle, imageUrlContext: adImageUrl }));
    setIsModalOpen(true);
  };

  const handleSubmit = async (userPrompt: string) => {
    setIsLoading(true);
    try {
      const result = await generateText(userPrompt);
      onInsert(result);
      setIsModalOpen(false); // Close after successful generation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <div onClick={handleOpenModal}>{children}</div>
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          title={modalTitle}
          className={`flex items-center space-x-2 py-2 px-4 rounded-md transition-opacity whitespace-nowrap ${className || 'bg-purple-600 text-white font-semibold hover:bg-purple-700'}`}
        >
          {triggerIcon && <span className="flex-shrink-0">{triggerIcon}</span>}
          <span>{triggerText || modalTitle}</span>
        </button>
      )}
      <AIPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={modalTitle}
        placeholder={modalPlaceholder}
        initialPrompt={initialPrompt}
        isLoading={isLoading}
      />
    </>
  );
};
// #endregion

// #region AIImageGenerator
interface AIImageGeneratorProps {
    onInsert: (base64Image: string) => void;
    // FIX: This prop was changed to accept a single object argument to resolve a type inference issue.
    buildInitialPrompt: (context: { currentTitle: string, currentDescription: string }) => string;
    adTitle: string; // Context for prompt generation
    adDescription: string; // Context for prompt generation
    triggerText?: string;
    triggerIcon?: React.ReactNode;
    className?: string;
}

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ onInsert, buildInitialPrompt, adTitle, adDescription, triggerText, triggerIcon = null, className }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imagePrompt, setImagePrompt] = useState('');
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setGeneratedImage(null);
        setError('');
        
        const generateInitialPrompt = async () => {
            setIsLoadingPrompt(true);
            try {
                const initial = buildInitialPrompt({ currentTitle: adTitle, currentDescription: adDescription });
                setImagePrompt(initial.trim());
            } catch (e) {
                setError('Não foi possível sugerir um prompt inicial.');
            } finally {
                setIsLoadingPrompt(false);
            }
        };
        generateInitialPrompt();
    };

    // @google/genai-linter-fix: Implemented handleGenerateImage function
    // FIX: Implemented handleGenerateImage function
    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) {
            setError('Por favor, insira um prompt para gerar a imagem.');
            return;
        }
        setIsLoadingImage(true);
        setGeneratedImage(null);
        setError('');
        try {
            const result = await generateImage(imagePrompt);
            setGeneratedImage(result);
        } catch (e) {
            console.error('Error generating image:', e);
            setError('Falha ao gerar imagem. Tente novamente com um prompt diferente.');
        } finally {
            setIsLoadingImage(false);
        }
    };

    // @google/genai-linter-fix: Implemented handleInsert function
    // FIX: Implemented handleInsert function
    const handleInsert = () => {
        if (generatedImage) {
            onInsert(generatedImage);
            setIsModalOpen(false);
        }
    };

    return (
      <>
        <button
            type="button"
            onClick={handleOpenModal}
            title={triggerText}
            className={`${className}`}
        >
            {triggerIcon && <span className="flex-shrink-0">{triggerIcon}</span>}
            <span>{triggerText}</span>
        </button>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-lg shadow-2xl p-6 w-full max-w-2xl">
                    <h3 className="text-xl font-bold text-accent mb-4">Gerar Imagem com IA</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Prompt Sugerido</label>
                            <textarea
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder={isLoadingPrompt ? "Analisando texto..." : "Insira um prompt de imagem"}
                                className="w-full h-24 bg-gray-800 border border-gray-600 rounded-md p-2"
                                disabled={isLoadingPrompt || isLoadingImage}
                            />
                        </div>

                        <button onClick={handleGenerateImage} disabled={isLoadingImage || isLoadingPrompt || !imagePrompt.trim()} className="w-full bg-accent text-button-text font-bold py-2 px-4 rounded-md disabled:opacity-50">
                            {isLoadingImage ? 'Gerando Imagem...' : 'Gerar Imagem'}
                        </button>
                        
                        <div className="w-full aspect-video bg-background rounded border border-border flex items-center justify-center overflow-hidden">
                            {isLoadingImage && <div className="text-text-secondary">Criando sua imagem...</div>}
                            {error && <div className="text-red-400 p-4 text-center">{error}</div>}
                            {generatedImage && <img src={generatedImage} alt="AI generated" className="w-full h-full object-contain" />}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
                        <button onClick={() => setIsModalOpen(false)} type="button" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">{t('admin_button_cancel')}</button>
                        <button onClick={handleInsert} type="button" disabled={!generatedImage} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50">
                            Inserir Imagem
                        </button>
                    </div>
                </div>
            </div>
        )}
      </>
    );
};

// #endregion

// #region AIPromptGenerator for Chatbot System Prompt (renamed to avoid confusion, moved to AdminPanel)
// Original AIPromptGenerator is now effectively replaced by a more general AITextGenerator with a specific prompt.
// Keeping it here with a comment to indicate it was refactored out.
/*
interface AIPromptGeneratorProps {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

export const AIPromptGenerator: React.FC<AIPromptGeneratorProps> = ({ onClose, onGenerate }) => {
    handleSubmit = async (userPrompt: string) => {
        const fullPrompt = `Gere um prompt de sistema detalhado e eficaz para um chatbot de atendimento ao cliente para uma empresa chamada RS Prólipsi. A empresa funde marketing digital com marketing multinível. O chatbot deve ser amigável, prestativo e guiar os usuários a ações como visitar páginas ou links externos. O usuário quer adicionar estas características ao prompt: "${userPrompt}". A saída deve ser um prompt de sistema em texto plano, adequado para uso direto pelo modelo de IA.`;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
          config: {
            systemInstruction: "Sua resposta deve ser um prompt de sistema em texto plano para um chatbot. Não inclua nenhuma formatação HTML ou markdown."
          }
        });
        onGenerate(response.text);
    };

    return (
        <AIPromptModal
            isOpen={true}
            onClose={onClose}
            onSubmit={handleSubmit}
            title="Gerar Prompt do Sistema do Chatbot"
            placeholder="Ex: 'seja muito formal' ou 'foco em vender produtos digitais'"
        />
    );
};
*/
// #endregion

// #region Icons
export const MagicWandIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 576 512" fill="currentColor">
      <path d="M439.9 146.7L411 25.1C409.8 17.5 403.4 12 395.7 12c-5.8 0-11 3.2-13.8 8.4l-27.1 209.6L192 201.2 113.8 62.4c-3.1-6.2-10-9.7-17-9.7c-5.7 0-10.9 3.1-13.7 8.3L38.4 209.7 11.2 135c-2.3-6.7-8.1-11.4-15-11.4c-5.8 0-11 3.2-13.8 8.4L-.5 220.2C-2.3 227.3 2.1 234 9 234h28.1L8.5 471.4c-1.4 7.2 2.3 14.3 9.4 16.7l20.4 7.2c7.2 2.5 15-.8 17.4-8L79.4 246.5l24.4 209.5c1.2 7.5 7.6 13 15.3 13c5.8 0 11-3.2 13.8-8.4l27.1-209.6L384 310.8l78.2 138.8c3.1 6.2 10 9.7 17 9.7c5.7 0 10.9-3.1 13.7-8.3l27.1-209.6 27.2 74.7c2.3 6.7 8.1 11.4 15 11.4c5.8 0 11-3.2 13.8-8.4l27.8-85.2c1.7-5.3-.6-11-5.7-13.2L439.9 146.7zM384 274.8L225.4 165.7 153.4 237l169.6 109.1L384 274.8z"/>
    </svg>
);


export const UploadIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
// #endregion