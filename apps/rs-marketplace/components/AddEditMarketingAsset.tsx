import React, { useState, useRef } from 'react';
import { MarketingAsset } from '../types';
import { ImageUploader } from './ImageUploader';
import { BotIcon } from './icons/BotIcon';
import { GoogleGenAI } from '@google/genai';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface AddEditMarketingAssetProps {
    asset: MarketingAsset | null;
    onSave: (asset: MarketingAsset) => void;
    onCancel: () => void;
}

const AddEditMarketingAsset: React.FC<AddEditMarketingAssetProps> = ({ asset, onSave, onCancel }) => {
    const isEditing = !!asset;
    const [formData, setFormData] = useState<Partial<MarketingAsset>>({
        name: '',
        type: 'banner',
        format: 'JPG',
        downloadUrl: '',
        previewUrl: '',
        ...asset,
    });
    const formRef = useRef<HTMLFormElement>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
             if (formData.format === 'PDF' && file.type !== 'application/pdf') {
                alert('Por favor, selecione um arquivo PDF.');
                return;
            }
            setSelectedFile(file);
             if (formData.format === 'PDF') {
                setFormData(prev => ({
                    ...prev,
                    previewUrl: 'https://i.imgur.com/S5OK3sI.png', // Static PDF icon
                    name: prev.name || file.name.replace(/\.[^/.]+$/, "")
                }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const isImageFormat = formData.format === 'JPG' || formData.format === 'PNG';

        if (!formData.name || (isImageFormat && !formData.previewUrl)) {
            alert('Nome e pré-visualização são obrigatórios.');
            return;
        }

        if(formData.format === 'PDF' && !selectedFile && !isEditing){
            alert('Por favor, envie um arquivo PDF.');
            return;
        }
        
        let dataToSave = { ...formData };

        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            if (isImageFormat) {
                dataToSave.previewUrl = url;
                dataToSave.downloadUrl = url;
            } else { // PDF
                dataToSave.downloadUrl = url;
            }
        } else if (isImageFormat && !dataToSave.downloadUrl) {
            dataToSave.downloadUrl = dataToSave.previewUrl;
        }

        onSave(dataToSave as MarketingAsset);
    };

    const handleGenerateImage = async () => {
        if (!aiPrompt.trim()) {
            alert('Por favor, descreva a imagem que você quer gerar.');
            return;
        }
        setIsGenerating(true);
        setFormData(prev => ({ ...prev, format: 'JPG' })); // Default to JPG for AI images
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Um material de marketing para a marca de luxo "RS Prólipsi". Estilo sofisticado, com tema de preto e dourado. Briefing: "${aiPrompt}"`;

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });
            
            const base64Image = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64Image}`;
            setFormData(prev => ({ ...prev, previewUrl: imageUrl, downloadUrl: imageUrl, name: prev.name || aiPrompt }));

        } catch (error) {
            console.error("AI Image Generation Error:", error);
            alert("Erro ao gerar imagem. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const isImageFormat = formData.format === 'JPG' || formData.format === 'PNG';


    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-between items-center border-b border-dark-800">
                <h1 className="text-2xl font-bold text-white">{isEditing ? 'Editar Material' : 'Novo Material'}</h1>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md">Descartar</button>
                    <button type="button" onClick={() => formRef.current?.requestSubmit()} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md">Salvar</button>
                </div>
            </div>
            <form onSubmit={handleSubmit} ref={formRef} className="max-w-4xl mx-auto space-y-6">
                 <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Gerar Imagem com IA</h3>
                    <div className="flex gap-2">
                        <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Descreva a imagem (ex: 'Banner para o dia das mães com um relógio dourado')" className="flex-grow bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                        <button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="font-semibold bg-gold-500/10 text-gold-400 py-2 px-4 rounded-md flex items-center gap-2">
                            {isGenerating ? <SpinnerIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
                            Gerar
                        </button>
                    </div>
                </div>

                <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome do Material" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white">
                            <option value="banner">Banner</option>
                            <option value="logo">Logo</option>
                            <option value="template">Template</option>
                        </select>
                        <select name="format" value={formData.format} onChange={handleInputChange} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white">
                            <option value="JPG">JPG</option>
                            <option value="PNG">PNG</option>
                            <option value="PDF">PDF</option>
                        </select>
                    </div>
                    
                    {isImageFormat ? (
                         <div>
                            <label className="block text-sm font-medium text-white mb-2">Arquivo de Imagem</label>
                            <ImageUploader currentImage={formData.previewUrl || ''} onImageUpload={(url) => setFormData(p => ({...p, previewUrl: url, downloadUrl: url}))} placeholderText="Arraste ou envie uma imagem" />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Arquivo PDF</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-700 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-500">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-dark-800 rounded-md font-medium text-gold-400 hover:text-yellow-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500 px-2">
                                            <span>Envie um arquivo</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">ou arraste e solte</p>
                                    </div>
                                    {selectedFile && <p className="text-xs text-green-400">{selectedFile.name}</p>}
                                    {!selectedFile && isEditing && formData.downloadUrl && <p className="text-xs text-gray-400">Arquivo atual: <a href={formData.downloadUrl} target="_blank" rel="noopener noreferrer" className="underline">{formData.name}.pdf</a></p>}
                                </div>
                            </div>
                        </div>
                    )}
                    {formData.format === 'PDF' && (
                        <input name="downloadUrl" value={formData.downloadUrl} onChange={handleInputChange} placeholder="URL para Download (se já estiver hospedado)" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddEditMarketingAsset;