// FIX: Add `useRef` to the import statement from 'react' to resolve the 'Cannot find name' error.
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { 
    PlusIcon, CloseIcon, PencilIcon, TrashIcon, ArrowLeftIcon, PlayCircleIcon, CheckCircleIcon, RobotIcon,
    TrainingChartIcon, TrainingUsersIcon, TrainingDnaIcon, SparklesIcon, SpinnerIcon, HandThumbUpIcon,
    ChatBubbleOvalLeftEllipsisIcon, ShareIcon, HandThumbUpIconSolid, ClipboardDocumentListIcon, QuestionMarkCircleIcon, PaperAirplaneIcon
} from '../icons';

// --- TYPES ---
interface TrainingLesson {
  id: string;
  title: string;
  youtubeUrl: string; // Full URL
  completed: boolean;
  liked: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: 'chart' | 'users' | 'dna' | 'robot';
  lessons: TrainingLesson[];
}

interface Comment {
    user: string;
    text: string;
    date: string;
}

interface TrainingCenterProps {
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
}

interface AiChatMessage {
    sender: 'user' | 'bot';
    text: string;
}

// --- MOCK DATA ---
const initialTrainings: TrainingModule[] = [
    {
        id: 'module1',
        title: 'Mestres do Tráfego Pago',
        description: 'Do básico ao avançado: crie campanhas de alta conversão no Facebook e Google Ads.',
        icon: 'chart',
        lessons: [
            { id: 'l1-1', title: 'O que é Facebook Ads?', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: true, liked: false },
            { id: 'l1-2', title: 'Criando sua Conta de Anúncios', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: true, liked: false },
            { id: 'l1-3', title: 'Como criar uma Página (Fanpage)', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: false, liked: false },
            { id: 'l1-4', title: 'Instalando o Pixel do Facebook', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: false, liked: false },
        ]
    },
    {
        id: 'module2',
        title: 'O Poder do Tráfego Orgânico',
        description: 'Domine técnicas de SEO e marketing de conteúdo para gerar leads e vendas sem investir em anúncios.',
        icon: 'users',
        lessons: [
            { id: 'l2-1', title: 'Introdução ao SEO', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: true, liked: false },
            { id: 'l2-2', title: 'Pesquisa de Palavras-Chave', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: false, liked: false },
        ]
    },
    {
        id: 'module3',
        title: 'DNA RS Prólipsi',
        description: 'Aprofunde seu conhecimento sobre a empresa, nossos produtos, plano de negócios e cultura.',
        icon: 'dna',
        lessons: [
            { id: 'l3-1', title: 'Como fazer seu cadastro', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: true, liked: false },
            { id: 'l3-2', title: 'Obtendo seu link da loja', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: false, liked: false },
            { id: 'l3-3', title: 'Navegando no Escritório Virtual', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: false, liked: false },
        ]
    },
    {
        id: 'module4',
        title: 'Inteligência Artificial',
        description: 'Aprenda a usar nossa assistente virtual (RSIA) para treinar, aprender e otimizar seus resultados.',
        icon: 'robot',
        lessons: [
            { id: 'l4-1', title: 'Conhecendo a RSIA', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: false, liked: false },
            { id: 'l4-2', title: 'Como usar a RSIA para treinar?', youtubeUrl: 'https://www.youtube.com/watch?v=NwsSay0o-c0', completed: false, liked: false },
        ]
    }
];

// --- UTILS & HELPERS ---
const getModuleIcon = (icon: TrainingModule['icon']) => {
    const props = { className: 'w-12 h-12 text-[#FFD700]' };
    switch (icon) {
        case 'chart': return <TrainingChartIcon {...props} />;
        case 'users': return <TrainingUsersIcon {...props} />;
        case 'dna': return <TrainingDnaIcon {...props} />;
        case 'robot': return <RobotIcon {...props} />;
        default: return null;
    }
};

const getYoutubeEmbedUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
            return `https://www.youtube-nocookie.com/embed/${videoId}`;
        }
        if (urlObj.hostname === 'youtu.be') {
            return `https://www.youtube-nocookie.com/embed/${urlObj.pathname.slice(1)}`;
        }
    } catch (e) {
        if (url && !url.includes('http')) {
            return `https://www.youtube-nocookie.com/embed/${url}`;
        }
    }
    return '';
};

// --- SUB-COMPONENTS ---
const QuizModal: React.FC<{
    isOpen: boolean; onClose: () => void; quizData: any[] | null;
}> = ({ isOpen, onClose, quizData }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    }, [isOpen]);

    if (!isOpen || !quizData || quizData.length === 0) return null;

    const currentQuestion = quizData[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= quizData.length;

    const handleAnswerSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);
        if (index === currentQuestion.correctAnswerIndex) {
            setScore(prev => prev + 1);
        }
    };
    
    const handleNext = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const getOptionClass = (index: number) => {
        if (!isAnswered) return 'bg-[#2A2A2A] hover:bg-gray-700';
        if (index === currentQuestion.correctAnswerIndex) return 'bg-green-600/80 text-white';
        if (index === selectedAnswer) return 'bg-red-600/80 text-white';
        return 'bg-[#2A2A2A] opacity-50';
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl shadow-xl w-full max-w-2xl min-h-[300px] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><QuestionMarkCircleIcon className="w-6 h-6 text-yellow-500" /> Quiz da Aula</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6 flex-grow">
                    {isFinished ? (
                        <div className="text-center flex flex-col items-center justify-center h-full">
                            <h3 className="text-2xl font-bold text-yellow-500">Quiz Finalizado!</h3>
                            <p className="text-lg text-white mt-2">Sua pontuação foi:</p>
                            <p className="text-5xl font-bold text-white my-4">{score} / {quizData.length}</p>
                            <button onClick={onClose} className="mt-4 bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg">Fechar</button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Pergunta {currentQuestionIndex + 1} de {quizData.length}</p>
                            <h3 className="text-lg font-semibold text-white mb-4">{currentQuestion.question}</h3>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option: string, index: number) => (
                                    <button key={index} onClick={() => handleAnswerSelect(index)} disabled={isAnswered} className={`w-full text-left p-3 rounded-lg text-white font-medium transition-all duration-300 ${getOptionClass(index)}`}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
                {isAnswered && !isFinished && <footer className="p-4 bg-black/50 border-t border-[#2A2A2A] flex justify-end"><button onClick={handleNext} className="px-6 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600">Próxima</button></footer>}
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const TrainingCenter: React.FC<TrainingCenterProps> = ({ credits, setCredits }) => {
    // Component State
    const [trainings, setTrainings] = useState(initialTrainings);
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    
    // AI Feature State
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
    const [quizData, setQuizData] = useState<any[] | null>(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [lessonChatMessages, setLessonChatMessages] = useState<AiChatMessage[]>([]);
    const [isChatResponseLoading, setIsChatResponseLoading] = useState(false);
    const [chatUserInput, setChatUserInput] = useState('');
    
    // Interaction State
    const [comments, setComments] = useState<Record<string, Comment[]>>({ 'l1-1': [{ user: 'Admin', text: 'Ótima aula introdutória!', date: '2024-07-28' }] });
    const [newComment, setNewComment] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{type: 'module' | 'lesson', item: any} | null>(null);
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

    // Derived State
    const selectedModule = useMemo(() => trainings.find(m => m.id === selectedModuleId), [trainings, selectedModuleId]);
    const selectedLesson = useMemo(() => selectedModule?.lessons.find(l => l.id === selectedLessonId), [selectedModule, selectedLessonId]);
    const chatEndRef = useRef<null | HTMLDivElement>(null);

    // Effects
    useEffect(() => {
        if (view === 'detail' && selectedModule && !selectedLessonId && selectedModule.lessons.length > 0) {
            setSelectedLessonId(selectedModule.lessons[0].id);
        } else if (view === 'list') {
            setSelectedLessonId(null);
        }
        setAiExplanation(null);
        setIsAiLoading(false);
        setAiSummary(null);
        setIsAiSummaryLoading(false);
        setQuizData(null);
        setIsQuizLoading(false);
        setLessonChatMessages([{ sender: 'bot', text: 'Olá! Faça uma pergunta sobre esta aula e eu responderei com base no conteúdo.' }]);
    }, [view, selectedModuleId, selectedLessonId]);
    
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lessonChatMessages]);

    // Handlers
    const handleSelectModule = (moduleId: string) => { setSelectedModuleId(moduleId); setView('detail'); };
    const handleBackToList = () => { setView('list'); setSelectedModuleId(null); };
    const handleToggleLessonComplete = (lessonId: string) => { setTrainings(trainings.map(m => m.id === selectedModuleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l) } : m)); };
    const handleToggleLike = (lessonId: string) => { setTrainings(trainings.map(m => m.id === selectedModuleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, liked: !l.liked } : l) } : m)); };
    const handleShare = async () => { if (selectedLesson) { try { if (navigator.share) { await navigator.share({ title: `Aula: ${selectedLesson.title}`, text: `Confira esta aula sobre ${selectedLesson.title} no treinamento da RS Prólipsi!`, url: selectedLesson.youtubeUrl }); } else { await navigator.clipboard.writeText(selectedLesson.youtubeUrl); alert('Link da aula copiado para a área de transferência!'); } } catch (err) { console.error('Error sharing:', err); } } };
    const handlePostComment = (e: React.FormEvent) => { e.preventDefault(); if (newComment.trim() && selectedLessonId) { setComments(prev => ({ ...prev, [selectedLessonId]: [...(prev[selectedLessonId] || []), { user: 'Roberto Camargo', text: newComment, date: new Date().toISOString() }] })); setNewComment(''); } };
    
    // --- AI HANDLERS ---
    const handleAiAction = async (action: 'explain' | 'summarize' | 'quiz' | 'chat', promptText?: string) => {
        if (!selectedLesson || !selectedModule) return;
        if (credits <= 0) { alert("Créditos de IA insuficientes."); return; }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let prompt = '';
        let config: any = { model: 'gemini-2.5-flash' };

        switch (action) {
            case 'explain':
                setIsAiLoading(true); setAiExplanation(null);
                prompt = `Explique o conceito de "${selectedLesson.title}" no contexto de "${selectedModule.title}" de forma simples e direta para um iniciante em marketing digital. Use uma linguagem clara e evite jargões técnicos. Forneça um exemplo prático se possível. Formate a resposta em parágrafos curtos.`;
                break;
            case 'summarize':
                setIsAiSummaryLoading(true); setAiSummary(null);
                prompt = `Resuma os pontos-chave da aula "${selectedLesson.title}" do módulo "${selectedModule.title}" em uma lista de 3 a 5 tópicos. O resumo deve ser claro, conciso e focado nos conceitos mais importantes para um consultor de marketing de rede da empresa RS Prólipsi.`;
                break;
            case 'quiz':
                setIsQuizLoading(true);
                prompt = `Crie um quiz de 3 perguntas de múltipla escolha sobre o tópico "${selectedLesson.title}" no contexto de "${selectedModule.title}". Cada pergunta deve ter 4 opções e apenas uma resposta correta. Forneça a resposta no formato JSON especificado.`;
                config.config = {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswerIndex: { type: Type.INTEGER } }, required: ['question', 'options', 'correctAnswerIndex'] } }
                };
                break;
            case 'chat':
                if (!promptText) return;
                setIsChatResponseLoading(true);
                setLessonChatMessages(prev => [...prev, { sender: 'user', text: promptText }]);
                prompt = `Você é a RSIA, uma coach virtual da empresa RS Prólipsi. Responda à seguinte pergunta do usuário no contexto da aula "${selectedLesson.title}" do módulo "${selectedModule.title}". Seja prestativa, clara e concisa. Pergunta do usuário: "${promptText}"`;
                break;
        }

        try {
            const response = await ai.models.generateContent({ ...config, contents: prompt });
            const responseText = response.text;
            
            switch (action) {
                case 'explain': setAiExplanation(responseText); break;
                case 'summarize': setAiSummary(responseText); break;
                case 'quiz': setQuizData(JSON.parse(responseText)); setIsQuizModalOpen(true); break;
                case 'chat': setLessonChatMessages(prev => [...prev, { sender: 'bot', text: responseText }]); break;
            }
            setCredits(prev => prev - 1);
        } catch (error) {
            console.error(`AI ${action} failed:`, error);
            const errorMsg = "Ocorreu um erro ao processar sua solicitação. Tente novamente.";
            switch(action) {
                case 'explain': setAiExplanation(errorMsg); break;
                case 'summarize': setAiSummary(errorMsg); break;
                case 'chat': setLessonChatMessages(prev => [...prev, {sender: 'bot', text: errorMsg}]); break;
                default: alert(errorMsg);
            }
        } finally {
            switch(action) {
                case 'explain': setIsAiLoading(false); break;
                case 'summarize': setIsAiSummaryLoading(false); break;
                case 'quiz': setIsQuizLoading(false); break;
                case 'chat': setIsChatResponseLoading(false); break;
            }
        }
    };
    
    // CRUD Handlers
    const openModal = (type: 'module' | 'lesson', item: any = null) => { setModalConfig({ type, item }); setIsModalOpen(true); };
    const handleSave = (savedItem: any) => { if (!modalConfig) return; if (modalConfig.type === 'module') { if (savedItem.id) { setTrainings(trainings.map(m => m.id === savedItem.id ? { ...m, ...savedItem } : m)); } else { setTrainings([...trainings, { id: `module${Date.now()}`, title: savedItem.title || 'Novo Módulo', description: savedItem.description || '', icon: 'chart', lessons: [] }]); } } else if (modalConfig.type === 'lesson') { if (!selectedModuleId) return; if (savedItem.id) { setTrainings(trainings.map(m => m.id === selectedModuleId ? { ...m, lessons: m.lessons.map(l => l.id === savedItem.id ? { ...l, ...savedItem } : l) } : m)); } else { setTrainings(trainings.map(m => m.id === selectedModuleId ? { ...m, lessons: [...m.lessons, { id: `l${Date.now()}`, title: savedItem.title || 'Nova Aula', youtubeUrl: savedItem.youtubeUrl || '', completed: false, liked: false }] } : m)); } } setIsModalOpen(false); };
    const handleDelete = (type: 'module' | 'lesson', id: string) => { if (!window.confirm(`Tem certeza que deseja excluir est${type === 'module' ? 'e módulo' : 'a aula'}?`)) return; if (type === 'module') { setTrainings(trainings.filter(m => m.id !== id)); if (selectedModuleId === id) handleBackToList(); } else if (type === 'lesson' && selectedModuleId) { setTrainings(trainings.map(m => { if (m.id === selectedModuleId) { const updatedLessons = m.lessons.filter(l => l.id !== id); if (selectedLessonId === id) setSelectedLessonId(updatedLessons.length > 0 ? updatedLessons[0].id : null); return { ...m, lessons: updatedLessons }; } return m; })); } };

    // --- RENDER FUNCTIONS ---
    return (
        <>
            {view === 'detail' && selectedModule ? (
                <div className="animate-fade-in">
                    <button onClick={handleBackToList} className="flex items-center gap-2 text-sm text-[#FFD700] font-semibold mb-6 hover:underline"><ArrowLeftIcon className="w-5 h-5" /> Voltar para todos os treinamentos</button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-[#2A2A2A]"><iframe key={selectedLesson?.id} width="100%" height="100%" src={getYoutubeEmbedUrl(selectedLesson?.youtubeUrl || '')} title={selectedLesson?.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>
                            
                            {selectedLesson && <div className="space-y-4">
                                <div className="flex justify-between items-center gap-4 flex-wrap">
                                    <h2 className="text-2xl font-bold text-white">{selectedLesson.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleAiAction('summarize')} disabled={isAiSummaryLoading || credits <= 0} title={credits <= 0 ? "Créditos insuficientes" : "Resumir com IA"} className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#FFD700]/10 text-[#FFD700] font-bold py-2 px-3 rounded-lg hover:bg-[#FFD700]/20 disabled:opacity-50 transition-colors text-sm"><ClipboardDocumentListIcon className="w-5 h-5"/> Resumir</button>
                                        <button onClick={() => handleAiAction('explain')} disabled={isAiLoading || credits <= 0} title={credits <= 0 ? "Créditos insuficientes" : "Explicar conceito com IA"} className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#FFD700]/10 text-[#FFD700] font-bold py-2 px-3 rounded-lg hover:bg-[#FFD700]/20 disabled:opacity-50 transition-colors text-sm"><SparklesIcon className="w-5 h-5"/> Explicar</button>
                                    </div>
                                </div>
                                
                                {(isAiSummaryLoading || aiSummary) && <aside className="p-4 bg-black/50 border border-[#2A2A2A] rounded-lg relative animate-fade-in"><h4 className="font-bold text-yellow-500 mb-2">Resumo da IA</h4><button onClick={() => setAiSummary(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white"><CloseIcon className="w-5 h-5"/></button>{isAiSummaryLoading ? <div className="flex items-center gap-2 text-gray-400"><SpinnerIcon className="w-5 h-5 animate-spin"/>Gerando resumo...</div> : <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiSummary}</p>}</aside>}
                                {(isAiLoading || aiExplanation) && <aside className="p-4 bg-black/50 border border-[#2A2A2A] rounded-lg relative animate-fade-in"><h4 className="font-bold text-yellow-500 mb-2">Explicação da IA</h4><button onClick={() => setAiExplanation(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white"><CloseIcon className="w-5 h-5"/></button>{isAiLoading ? <div className="flex items-center gap-2 text-gray-400"><SpinnerIcon className="w-5 h-5 animate-spin"/>Gerando explicação...</div> : <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiExplanation}</p>}</aside>}

                                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#2A2A2A]">
                                    <div className="flex items-center gap-2"><input type="checkbox" id="mark-complete" checked={selectedLesson.completed} onChange={() => handleToggleLessonComplete(selectedLesson.id)} className="w-5 h-5 accent-[#FFD700] bg-gray-700 border-gray-600 rounded" /><label htmlFor="mark-complete" className="text-sm font-medium text-gray-300">Marcar como concluída</label></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleAiAction('quiz')} disabled={isQuizLoading || credits <= 0} title={credits <= 0 ? "Créditos insuficientes" : "Gerar Quiz com IA"} className="flex items-center gap-1.5 text-sm text-gray-300 font-medium bg-[#2A2A2A] hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"><QuestionMarkCircleIcon className="w-4 h-4" />Gerar Quiz</button>
                                        <button onClick={() => handleToggleLike(selectedLesson.id)} className={`flex items-center gap-1.5 text-sm font-medium bg-[#2A2A2A] hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors ${selectedLesson.liked ? 'text-[#FFD700]' : 'text-gray-300'}`}>{selectedLesson.liked ? <HandThumbUpIconSolid className="w-4 h-4" /> : <HandThumbUpIcon className="w-4 h-4" />}Gostei</button>
                                        <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-gray-300 font-medium bg-[#2A2A2A] hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"><ShareIcon className="w-4 h-4" />Compartilhar</button>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-lg font-bold text-white">Pergunte à RSIA sobre esta aula</h3>
                                    <div className="h-64 flex flex-col bg-black/50 border border-[#2A2A2A] rounded-lg p-3">
                                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">{lessonChatMessages.map((msg, i) => <div key={i} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>{msg.sender === 'bot' && <div className="w-7 h-7 flex-shrink-0 bg-[#2A2A2A] rounded-full flex items-center justify-center border border-gray-600"><RobotIcon className="w-4 h-4 text-[#FFD700]"/></div>}<div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.sender === 'bot' ? 'bg-[#2A2A2A] text-gray-300 rounded-tl-none' : 'bg-yellow-500 text-black rounded-br-none'}`}>{msg.text}</div></div>)} {isChatResponseLoading && <div className="flex items-start gap-2"><div className="w-7 h-7 flex-shrink-0 bg-[#2A2A2A] rounded-full flex items-center justify-center border border-gray-600"><RobotIcon className="w-4 h-4 text-[#FFD700]"/></div><div className="px-3 py-2 bg-[#2A2A2A] rounded-xl rounded-tl-none"><SpinnerIcon className="w-5 h-5 text-gray-400 animate-spin" /></div></div>} <div ref={chatEndRef} /></div>
                                        <form onSubmit={(e) => {e.preventDefault(); handleAiAction('chat', chatUserInput); setChatUserInput(''); }} className="flex items-center gap-2 pt-3 border-t border-[#2A2A2A]"><input type="text" value={chatUserInput} onChange={e => setChatUserInput(e.target.value)} placeholder="Faça uma pergunta..." className="flex-1 bg-gray-800 text-white rounded-lg p-2 text-sm border-gray-700 focus:ring-yellow-500"/><button type="submit" disabled={!chatUserInput.trim() || isChatResponseLoading || credits <= 0} className="w-9 h-9 flex-shrink-0 bg-yellow-500 text-black rounded-full flex items-center justify-center hover:bg-yellow-600 disabled:bg-gray-600"><PaperAirplaneIcon className="w-4 h-4"/></button></form>
                                    </div>
                                </div>
                            </div>}
                        </div>
                        
                        <div className="lg:col-span-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex flex-col max-h-[70vh]"><div className="flex justify-between items-start mb-4"><h3 className="text-xl font-bold text-white">{selectedModule.title}</h3><button onClick={() => openModal('module', selectedModule)} className="p-2 text-gray-400 hover:text-[#FFD700]"><PencilIcon className="w-5 h-5" /></button></div><div className="flex-1 overflow-y-auto pr-2 space-y-2">{selectedModule.lessons.map((lesson, index) => <div key={lesson.id} className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedLessonId === lesson.id ? 'bg-[#FFD700]/10' : 'hover:bg-white/5'}`} onClick={() => setSelectedLessonId(lesson.id)}><div className="flex items-center gap-3">{lesson.completed ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <PlayCircleIcon className="w-5 h-5 text-gray-400"/>}<span className={`font-medium ${selectedLessonId === lesson.id ? 'text-[#FFD700]' : 'text-gray-200'}`}>Aula {index + 1}: {lesson.title}</span></div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); openModal('lesson', lesson); }} className="p-1 text-gray-400 hover:text-yellow-400"><PencilIcon className="w-4 h-4" /></button><button onClick={(e) => { e.stopPropagation(); handleDelete('lesson', lesson.id); }} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button></div></div>)}</div><button onClick={() => openModal('lesson', null)} className="w-full mt-4 flex items-center justify-center gap-2 bg-[#FFD700]/10 text-[#FFD700] font-bold py-2 px-4 rounded-lg hover:bg-[#FFD700]/20 transition-colors text-sm"><PlusIcon className="w-5 h-5" />Adicionar Aula</button></div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-[#E5E7EB]">Central de Treinamentos</h2><p className="text-[#9CA3AF]">Capacite-se e impulsione seus resultados.</p></div><button onClick={() => openModal('module', null)} className="flex items-center justify-center gap-2 bg-[#FFD700] text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm"><PlusIcon className="w-5 h-5" />Adicionar Módulo</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{trainings.map(t => { const progress = t.lessons.length > 0 ? (t.lessons.filter(l => l.completed).length / t.lessons.length) * 100 : 0; return (<div key={t.id} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 flex flex-col group hover:border-[#FFD700]/50 transition-colors">{getModuleIcon(t.icon)}<h3 className="text-xl font-bold text-white mt-4 mb-2">{t.title}</h3><p className="text-sm text-gray-400 flex-grow mb-4">{t.description}</p><div className="mb-4"><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progresso</span><span>{Math.round(progress)}%</span></div><div className="w-full bg-[#2A2A2A] rounded-full h-2"><div className="bg-[#FFD700] h-2 rounded-full" style={{ width: `${progress}%` }}></div></div></div><button onClick={() => handleSelectModule(t.id)} className="w-full bg-[#2A2A2A] text-white font-bold py-2.5 px-4 rounded-lg group-hover:bg-[#FFD700] group-hover:text-black transition-colors">Acessar Treinamento</button></div>); })}</div>
                </div>
            )}

            {isModalOpen && <TrainingEditModal config={modalConfig} onClose={() => setIsModalOpen(false)} onSave={handleSave} credits={credits} setCredits={setCredits} />}
            <QuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} quizData={quizData} />
        </>
    );
};

// --- MODAL COMPONENT (Self-contained) ---
interface TrainingEditModalProps {
    config: { type: 'module' | 'lesson', item: any } | null;
    onClose: () => void;
    onSave: (item: any) => void;
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
}

const TrainingEditModal: React.FC<TrainingEditModalProps> = ({ config, onClose, onSave, credits, setCredits }) => {
    const [formData, setFormData] = useState<any>({});
    const [isAiDescLoading, setIsAiDescLoading] = useState(false);

    useEffect(() => { setFormData(config?.item || {}); }, [config]);

    if (!config) return null;
    
    const isModule = config.type === 'module';
    const title = config.item ? `Editar ${isModule ? 'Módulo' : 'Aula'}` : `Novo ${isModule ? 'Módulo' : 'Aula'}`;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    
    const handleGenerateDescriptionWithAi = async () => {
        if (credits <= 0) { alert("Créditos insuficientes para gerar descrição."); return; }
        if (!formData.title || formData.title.trim() === '') { alert('Por favor, insira um título para o módulo antes de gerar a descrição.'); return; }
        setIsAiDescLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Crie uma descrição curta e impactante para um módulo de treinamento chamado "${formData.title}". O público são consultores de marketing de rede da empresa RS Prólipsi. A descrição deve ser motivadora e resumir o objetivo do módulo em 2 ou 3 frases.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setFormData(prev => ({ ...prev, description: response.text }));
            setCredits(prev => prev - 1);
        } catch (error) {
            console.error("AI description generation failed:", error);
            alert("Ocorreu um erro ao gerar a descrição. Tente novamente.");
        } finally {
            setIsAiDescLoading(false);
        }
    };

    const handleLocalSave = () => {
        if (!formData.title || formData.title.trim() === '') { alert('O título não pode estar vazio.'); return; }
        if (!isModule && (!formData.youtubeUrl || formData.youtubeUrl.trim() === '')) { alert('A URL do vídeo não pode estar vazia.'); return; }
        onSave(formData);
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl shadow-xl w-full max-w-lg">
                <header className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                        <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="bg-[#2A2A2A] border border-[#2A2A2A] text-[#E5E7EB] rounded-lg p-2.5 w-full" />
                    </div>
                    {isModule ? (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-gray-300">Descrição</label>
                                <button type="button" onClick={handleGenerateDescriptionWithAi} disabled={isAiDescLoading || credits <= 0} title={credits <= 0 ? "Créditos insuficientes" : "Gerar descrição com IA"} className="flex items-center gap-1.5 text-xs text-[#FFD700] font-semibold hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {isAiDescLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4"/>}
                                    Gerar com IA
                                </button>
                            </div>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} disabled={isAiDescLoading} className="bg-[#2A2A2A] border border-[#2A2A2A] text-[#E5E7EB] rounded-lg p-2.5 w-full disabled:opacity-70" />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">URL do Vídeo (YouTube)</label>
                            <input type="url" name="youtubeUrl" value={formData.youtubeUrl || ''} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." className="bg-[#2A2A2A] border border-[#2A2A2A] text-[#E5E7EB] rounded-lg p-2.5 w-full" />
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-black/50 border-t border-[#2A2A2A] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleLocalSave} className="px-4 py-2 text-sm font-medium text-black bg-[#FFD700] rounded-lg hover:bg-yellow-600">Salvar</button>
                </footer>
            </div>
        </div>
    );
};

export default TrainingCenter;
