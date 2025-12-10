import React, { useState, useEffect, useRef } from 'react';
import { useAISettings } from '../../context/AISettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { AISettings } from '../../types';
import { AITextGenerator } from '../AIComponents';

const AISettingsTab: React.FC = () => {
    const { settings, updateSettings } = useAISettings();
    const { t } = useLanguage();
    const [formData, setFormData] = useState<AISettings>(settings);
    
    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        hasChanged.current = JSON.stringify(settings) !== JSON.stringify(formData);
    }, [formData, settings]);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (field: keyof AISettings, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        alert(t('admin_ai_settings_saved_success'));
    };
    
    const buildSystemPromptInitialPrompt = (currentPrompt?: string, _imageUrlContext?: string) => {
        return `Gere um prompt de sistema detalhado e eficaz para um chatbot de atendimento ao cliente para uma empresa chamada RS Prólipsi. A empresa funde marketing digital com marketing multinível. O chatbot deve ser amigável, prestativo e guiar os usuários a ações como visitar páginas ou links externos. O prompt atual é: "${currentPrompt}". A saída deve ser um prompt de sistema em texto plano, adequado para uso direto pelo modelo de IA.`;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-accent">{t('admin_ai_title')}</h2>
            <p className="text-text-secondary mt-1 mb-6">{t('admin_ai_desc')}</p>
            <form onSubmit={handleSave} className="space-y-6">
                <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-2">{t('admin_chatbot_config_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_chatbot_name')}</label>
                        <input type="text" value={formData.chatbotName} onChange={e => handleChange('chatbotName', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_chatbot_icon')}</label>
                        <select value={formData.chatbotIcon} onChange={e => handleChange('chatbotIcon', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                            <option value="robot1">{t('admin_ai_settings_robot_1')}</option>
                            <option value="robot2">{t('admin_ai_settings_robot_2')}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-text-secondary">{t('admin_chatbot_prompt')}</label>
                        <AITextGenerator
                            onInsert={v => handleChange('chatbotSystemPrompt', v)}
                            buildInitialPrompt={buildSystemPromptInitialPrompt}
                            modalTitle="Gerar Prompt do Sistema do Chatbot"
                            modalPlaceholder="Ex: 'seja muito formal' ou 'foco em vender produtos digitais'"
                            triggerText="Gerar com IA"
                            className="flex items-center space-x-1 text-sm text-accent hover:opacity-80"
                            adTitle={formData.chatbotSystemPrompt}
                        />
                    </div>
                    <textarea value={formData.chatbotSystemPrompt} onChange={e => handleChange('chatbotSystemPrompt', e.target.value)} rows={10} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 font-mono text-sm" />
                    <p className="text-xs text-gray-500 mt-1">{t('admin_chatbot_prompt_desc')}</p>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80" disabled={!hasChanged.current}>Salvar</button>
                </div>
            </form>
        </div>
    );
};

export default AISettingsTab;