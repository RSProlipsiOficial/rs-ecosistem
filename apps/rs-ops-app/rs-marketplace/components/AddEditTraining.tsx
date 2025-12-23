import React, { useState, useRef } from 'react';
import { Training, Lesson } from '../types';
import { ImageUploader } from './ImageUploader';
import { TrashIcon } from './icons/TrashIcon';

interface AddEditTrainingProps {
    training: Training | null;
    onSave: (training: Training) => void;
    onCancel: () => void;
}

const AddEditTraining: React.FC<AddEditTrainingProps> = ({ training, onSave, onCancel }) => {
    const isEditing = !!training;
    const [formData, setFormData] = useState<Partial<Training>>({
        title: '',
        description: '',
        thumbnailUrl: '',
        lessons: [],
        ...training,
    });
    const formRef = useRef<HTMLFormElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLessonChange = (index: number, field: keyof Lesson, value: string) => {
        const newLessons = [...(formData.lessons || [])];
        // @ts-ignore
        newLessons[index][field] = value;
        setFormData(prev => ({ ...prev, lessons: newLessons }));
    };

    const addLesson = () => {
        const newLesson: Lesson = {
            id: `l-${Date.now()}`,
            title: 'Nova Aula',
            videoUrl: '',
            content: ''
        };
        setFormData(prev => ({ ...prev, lessons: [...(prev.lessons || []), newLesson] }));
    };

    const removeLesson = (index: number) => {
        setFormData(prev => ({ ...prev, lessons: (prev.lessons || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            alert('O título do módulo é obrigatório.');
            return;
        }
        onSave(formData as Training);
    };

    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-between items-center border-b border-dark-800">
                <h1 className="text-2xl font-bold text-white">{isEditing ? 'Editar Módulo' : 'Novo Módulo de Treinamento'}</h1>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md">Descartar</button>
                    <button type="button" onClick={() => formRef.current?.requestSubmit()} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md">Salvar Módulo</button>
                </div>
            </div>
            <form onSubmit={handleSubmit} ref={formRef} className="max-w-4xl mx-auto space-y-6">
                <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                    <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Título do Módulo" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Descrição do Módulo" rows={3} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Imagem de Capa (Thumbnail)</label>
                        <ImageUploader currentImage={formData.thumbnailUrl || ''} onImageUpload={(url) => setFormData(p => ({...p, thumbnailUrl: url}))} placeholderText="Capa do Módulo" />
                    </div>
                </div>

                <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Aulas do Módulo</h3>
                    <div className="space-y-4">
                        {(formData.lessons || []).map((lesson, index) => (
                            <div key={index} className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-white">Aula {index + 1}</h4>
                                    <button type="button" onClick={() => removeLesson(index)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                                <div className="space-y-2">
                                    <input value={lesson.title} onChange={e => handleLessonChange(index, 'title', e.target.value)} placeholder="Título da Aula" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white text-sm" />
                                    <input value={lesson.videoUrl} onChange={e => handleLessonChange(index, 'videoUrl', e.target.value)} placeholder="URL do Vídeo" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white text-sm" />
                                    <textarea value={lesson.content} onChange={e => handleLessonChange(index, 'content', e.target.value)} placeholder="Conteúdo/Transcrição para IA" rows={4} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white text-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addLesson} className="mt-4 text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                        + Adicionar Aula
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditTraining;