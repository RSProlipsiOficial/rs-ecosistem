import React, { useState, useRef } from 'react';
import { Announcement } from '../types';
import RichTextEditor from './RichTextEditor';
import { ToggleSwitch } from './ToggleSwitch';
import { BotIcon } from './icons/BotIcon';
import { GoogleGenAI } from '@google/genai';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AddEditAnnouncementProps {
    announcement: Announcement | null;
    onSave: (announcement: Announcement) => void;
    onCancel: () => void;
}

const AddEditAnnouncement: React.FC<AddEditAnnouncementProps> = ({ announcement, onSave, onCancel }) => {
    const isEditing = !!announcement;
    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: '',
        content: '',
        isPinned: false,
        date: new Date().toISOString(),
        ...announcement,
    });
    const formRef = useRef<HTMLFormElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title?.trim()) {
            alert('Por favor, insira um título.');
            return;
        }
        onSave(formData as Announcement);
    };
    
    const handleGenerateContent = async () => {
        if (!formData.title) {
            alert('Por favor, insira um título antes de gerar o conteúdo.');
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Você é um especialista em comunicação interna para uma empresa de luxo chamada RS Prólipsi. Com base no título do comunicado "${formData.title}", escreva um comunicado oficial claro, profissional e engajador. Use formatação rica em HTML, como títulos (h2), parágrafos (p), listas (ul/li) e negrito (strong) para uma boa legibilidade.`;
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            
            setFormData(prev => ({ ...prev, content: response.text ?? '' }));
        } catch (error) {
            console.error("AI Content Generation Error:", error);
            alert("Ocorreu um erro ao gerar o conteúdo. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-between items-center border-b border-dark-800">
                <h1 className="text-2xl font-bold text-white">{isEditing ? 'Editar Comunicado' : 'Novo Comunicado'}</h1>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md">Descartar</button>
                    <button type="button" onClick={() => formRef.current?.requestSubmit()} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md">Salvar</button>
                </div>
            </div>
            <form onSubmit={handleSubmit} ref={formRef} className="max-w-4xl mx-auto space-y-6">
                <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">Título</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-medium text-white">Conteúdo</label>
                             <button type="button" onClick={handleGenerateContent} disabled={isGenerating} className="flex items-center gap-1.5 text-sm font-semibold bg-gold-500/10 text-gold-400 py-1 px-3 rounded-md">
                                {isGenerating ? <SpinnerIcon className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
                                {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                             </button>
                        </div>
                        <RichTextEditor value={formData.content || ''} onChange={(c) => setFormData(p => ({ ...p, content: c }))} />
                    </div>
                     <div className="flex items-center gap-3 pt-4">
                        <ToggleSwitch checked={!!formData.isPinned} onChange={(c) => setFormData(p => ({ ...p, isPinned: c }))} labelId="pin-toggle" />
                        <label htmlFor="pin-toggle" className="text-sm text-white">Fixar no topo da lista</label>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddEditAnnouncement;