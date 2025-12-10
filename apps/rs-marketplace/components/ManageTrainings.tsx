import React from 'react';
import { Training, View } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface ManageTrainingsProps {
    trainings: Training[];
    onNavigate: (view: View, data?: Training) => void;
    completedLessons: string[];
}

const TrainingCard: React.FC<{ module: Training, onNavigate: () => void, completedLessons: string[] }> = ({ module, onNavigate, completedLessons }) => {
    
    const completedInModule = module.lessons.filter(l => completedLessons.includes(l.id)).length;
    const progress = module.lessons.length > 0 ? (completedInModule / module.lessons.length) * 100 : 0;

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden group flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-dark-700 hover:-translate-y-1">
            <div className="relative">
                <img src={module.thumbnailUrl} alt={module.title} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{module.lessons.length} Aulas</div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors flex-grow">{module.title}</h3>
                <p className="text-sm text-gray-400 mt-2 h-16">{module.description}</p>
            
                <div className="mt-4">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                        <div className="bg-gold-400 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                    </div>
                    <button 
                        onClick={onNavigate}
                        className="w-full mt-6 bg-dark-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gold-500 hover:text-black transition-colors"
                    >
                        Acessar Treinamento
                    </button>
                </div>
            </div>
        </div>
    );
};


const ManageTrainings: React.FC<ManageTrainingsProps> = ({ trainings, onNavigate, completedLessons }) => {

    return (
        <div className="space-y-6">
            <button onClick={() => onNavigate('communication')} className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-gold-400 -mb-2">
                <ArrowLeftIcon className="w-5 h-5"/>
                Voltar para a Central de Comunicação
            </button>
            <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-bold text-white">Central de Treinamentos</h2>
                    <p className="text-gray-400">Capacite-se e impulsione seus resultados.</p>
                </div>
                <button 
                    onClick={() => onNavigate('addEditTraining')}
                    className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400"
                >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Módulo
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trainings.map(module => (
                    <TrainingCard 
                        key={module.id} 
                        module={module}
                        completedLessons={completedLessons}
                        onNavigate={() => onNavigate('trainingModuleDetail', module)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ManageTrainings;
