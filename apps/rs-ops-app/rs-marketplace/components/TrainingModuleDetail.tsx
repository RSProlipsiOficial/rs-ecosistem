import React, { useState, useEffect, useMemo } from 'react';
import { Training, Lesson, View } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { BotIcon } from './icons/BotIcon';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { GoogleGenAI, Type } from '@google/genai';
import { CloseIcon } from './icons/CloseIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';


interface TrainingModuleDetailProps {
    module: Training;
    onNavigate: (view: View, data?: any) => void;
    completedLessons: string[];
    onToggleLessonComplete: (lessonId: string) => void;
    onLikeLesson: (moduleId: string, lessonId: string) => void;
}

type AIChatMessage = {
    sender: 'user' | 'ai';
    text: string;
}

type QuizQuestion = {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

const TrainingModuleDetail: React.FC<TrainingModuleDetailProps> = ({ module, onNavigate, completedLessons, onToggleLessonComplete, onLikeLesson }) => {
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(module.lessons[0] || null);
    const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([
        { sender: 'ai', text: 'Olá! Faça uma pergunta sobre esta aula e eu responderei com base no conteúdo.' }
    ]);
    const [userQuestion, setUserQuestion] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiModalContent, setAiModalContent] = useState<{title: string, content: string} | null>(null);
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [quizResult, setQuizResult] = useState<{score: number, total: number} | null>(null);
    const [shareFeedback, setShareFeedback] = useState('');

    useEffect(() => {
        // Reset state when the module or lesson changes
        setCurrentLesson(module.lessons[0] || null);
        setChatHistory([{ sender: 'ai', text: 'Olá! Faça uma pergunta sobre esta aula e eu responderei com base no conteúdo.' }]);
        setQuiz(null);
        setUserAnswers({});
        setQuizResult(null);
    }, [module]);

    useEffect(() => {
        // Reset chat and quiz when lesson changes
        setChatHistory([{ sender: 'ai', text: 'Olá! Faça uma pergunta sobre esta aula e eu responderei com base no conteúdo.' }]);
        setQuiz(null);
        setUserAnswers({});
        setQuizResult(null);
    }, [currentLesson]);

    const handleAiInteraction = async (type: 'summarize' | 'explain' | 'quiz') => {
        if (!currentLesson) return;
        setIsAiLoading(true);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        let prompt = '';
        let modalTitle = '';

        try {
            if (type === 'summarize') {
                prompt = `Resuma o seguinte conteúdo da aula de forma concisa e clara:\n\n---\n${currentLesson.content}\n---`;
                modalTitle = `Resumo da Aula: ${currentLesson.title}`;
            } else if (type === 'explain') {
                prompt = `Explique os conceitos chave do seguinte conteúdo da aula como se eu fosse um iniciante:\n\n---\n${currentLesson.content}\n---`;
                 modalTitle = `Explicação da Aula: ${currentLesson.title}`;
            } else if (type === 'quiz') {
                 const response = await ai.models.generateContent({
                   model: 'gemini-2.5-flash',
                   contents: `Gere um quiz com 3 perguntas de múltipla escolha (4 opções cada) sobre o seguinte conteúdo:\n\n---\n${currentLesson.content}\n---`,
                   config: {
                     responseMimeType: 'application/json',
                     responseSchema: {
                       type: Type.OBJECT,
                       properties: {
                         questions: {
                           type: Type.ARRAY,
                           items: {
                             type: Type.OBJECT,
                             properties: {
                               question: { type: Type.STRING },
                               options: { type: Type.ARRAY, items: { type: Type.STRING } },
                               correctAnswerIndex: { type: Type.INTEGER },
                             }
                           }
                         }
                       }
                     }
                   }
                 });
                const quizData = JSON.parse(response.text ?? '{}');
                if (quizData.questions) {
                    setQuiz(quizData.questions);
                    setQuizResult(null);
                    setUserAnswers({});
                }
                setIsAiLoading(false);
                return;
            }
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt
            });
            setAiModalContent({ title: modalTitle, content: response.text ?? 'Não foi possível gerar uma resposta.' });

        } catch (error) {
            console.error('AI Interaction Error:', error);
            setAiModalContent({ title: 'Erro', content: 'Ocorreu um erro ao processar sua solicitação.' });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!userQuestion.trim() || !currentLesson) return;
        const newUserMessage: AIChatMessage = { sender: 'user', text: userQuestion };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserQuestion('');
        setIsAiLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Você é a RSIA, uma assistente de IA da RS Prólipsi. Responda à pergunta do usuário baseando-se ESTREITAMENTE no conteúdo da aula fornecido abaixo. Se a resposta não estiver no conteúdo, diga que você só pode responder sobre o material da aula.\n\n[CONTEÚDO DA AULA]\n${currentLesson.content}\n\n[PERGUNTA DO USUÁRIO]\n${userQuestion}`;
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            const aiResponse: AIChatMessage = { sender: 'ai', text: response.text ?? 'Não consegui processar sua pergunta.' };
            setChatHistory(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorResponse: AIChatMessage = { sender: 'ai', text: 'Desculpe, ocorreu um erro.' };
            setChatHistory(prev => [...prev, errorResponse]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleQuizSubmit = () => {
        if (!quiz) return;
        let score = 0;
        quiz.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswerIndex) {
                score++;
            }
        });
        setQuizResult({ score, total: quiz.length });
    };

    const handleShare = async () => {
        if (!currentLesson) return;
        const shareData = {
            title: `Treinamento RS Prólipsi: ${module.title}`,
            text: `Estou fazendo a aula "${currentLesson.title}". Confira!`,
            url: window.location.href, // Mock URL
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            await navigator.clipboard.writeText(shareData.url);
            setShareFeedback('Link copiado para a área de transferência!');
            setTimeout(() => setShareFeedback(''), 2500);
        }
    };


    if (!currentLesson) {
        return (
            <div>
                <button onClick={() => onNavigate('manageTrainings')} className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-gold-500 mb-4">
                    <ArrowLeftIcon className="w-5 h-5"/> Voltar para todos os treinamentos
                </button>
                <p>Nenhuma aula encontrada neste módulo.</p>
            </div>
        );
    }
    
    const currentLessonLikes = module.lessons.find(l => l.id === currentLesson.id)?.likes || 0;

    return (
        <div className="space-y-4">
            <button onClick={() => onNavigate('manageTrainings')} className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-gold-500">
                <ArrowLeftIcon className="w-5 h-5"/> Voltar para todos os treinamentos
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Player & Interactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-dark-800">
                        {currentLesson.videoUrl && currentLesson.videoUrl !== 'placeholder.mp4' ? (
                            <video key={currentLesson.id} src={currentLesson.videoUrl} controls autoPlay className="w-full h-full rounded-lg"></video>
                        ) : (
                            <p className="text-gray-500">Vídeo indisponível</p>
                        )}
                    </div>
                    
                    <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>

                        <div className="flex flex-wrap items-center gap-2 border-b border-dark-800 pb-4">
                             <button onClick={() => handleAiInteraction('summarize')} disabled={isAiLoading} className="flex items-center gap-1.5 text-sm font-semibold bg-gold-500/10 text-gold-400 py-2 px-3 rounded-md hover:bg-gold-500/20">
                                <SparklesIcon className="w-4 h-4" /> Resumir
                            </button>
                            <button onClick={() => handleAiInteraction('explain')} disabled={isAiLoading} className="flex items-center gap-1.5 text-sm font-semibold bg-gold-500/10 text-gold-400 py-2 px-3 rounded-md hover:bg-gold-500/20">
                                <SparklesIcon className="w-4 h-4" /> Explicar
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-4">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={completedLessons.includes(currentLesson.id)} onChange={() => onToggleLessonComplete(currentLesson.id)} className="h-5 w-5 rounded bg-dark-700 border-dark-700 text-gold-500 focus:ring-yellow-600"/>
                                <span className="font-semibold text-white">Marcar como concluída</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleAiInteraction('quiz')} disabled={isAiLoading} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">Gerar Quiz</button>
                                <button onClick={() => onLikeLesson(module.id, currentLesson.id)} className="flex items-center gap-2 text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                                    <HeartIcon className="w-4 h-4" /> {currentLessonLikes}
                                </button>
                                <div className="relative">
                                    <button onClick={handleShare} className="flex items-center gap-2 text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                                      <ShareIcon className="w-4 h-4" /> Compartilhar
                                    </button>
                                    {shareFeedback && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap">
                                            <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                            {shareFeedback}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {quiz && (
                            <div className="space-y-4 border-t border-dark-800 pt-4">
                                <h3 className="font-bold text-lg text-white">Quiz da Aula</h3>
                                {quiz.map((q, qIndex) => (
                                    <div key={qIndex} className="text-sm">
                                        <p className="font-semibold text-gray-200 mb-2">{qIndex + 1}. {q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIndex) => (
                                                <label key={oIndex} className={`flex items-center gap-2 p-2 rounded-md border ${userAnswers[qIndex] === oIndex ? 'border-gold-500' : 'border-dark-700'}`}>
                                                    <input type="radio" name={`q-${qIndex}`} checked={userAnswers[qIndex] === oIndex} onChange={() => setUserAnswers(prev => ({...prev, [qIndex]: oIndex}))} disabled={!!quizResult}/>
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {!quizResult ? (
                                    <button onClick={handleQuizSubmit} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400">Verificar Respostas</button>
                                ) : (
                                    <div className={`p-3 rounded-lg text-center font-bold ${quizResult.score / quizResult.total >= 0.7 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        Você acertou {quizResult.score} de {quizResult.total} perguntas!
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="border-t border-dark-800 pt-4">
                            <h3 className="font-semibold text-white mb-2">Pergunte à RSIA sobre esta aula</h3>
                            <div className="bg-dark-900/50 p-3 rounded-lg h-64 flex flex-col">
                                <div className="flex-grow space-y-3 overflow-y-auto pr-2 text-sm">
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`p-2 rounded-lg max-w-[80%] ${msg.sender === 'ai' ? 'bg-dark-700' : 'bg-yellow-600 text-black'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiLoading && <div className="flex justify-start"><SpinnerIcon className="w-5 h-5 text-gold-400"/></div>}
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input type="text" value={userQuestion} onChange={e => setUserQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Faça uma pergunta..." className="flex-grow bg-dark-800 border-2 border-dark-700 rounded-full py-2 px-4 text-white"/>
                                    <button onClick={handleSendMessage} className="p-2 bg-gold-500 rounded-full text-black"><SendIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Lesson List */}
                <div className="bg-black border border-dark-800 rounded-lg p-4 space-y-2 self-start">
                    <h3 className="font-bold text-lg text-white mb-2 px-2">{module.title}</h3>
                    {module.lessons.map((lesson, index) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isCurrent = currentLesson?.id === lesson.id;
                        return (
                             <button 
                                key={lesson.id}
                                onClick={() => setCurrentLesson(lesson)}
                                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${isCurrent ? 'bg-gold-500/10' : 'hover:bg-dark-800/50'}`}
                             >
                                {isCompleted ? <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" /> : <PlayCircleIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />}
                                <span className={`font-semibold ${isCurrent ? 'text-gold-400' : 'text-white'}`}>Aula {index+1}: {lesson.title}</span>
                            </button>
                        );
                    })}
                    <button onClick={() => onNavigate('addEditTraining', module)} className="w-full text-left font-bold text-gold-500 p-3 rounded-lg hover:bg-dark-800/50">+ Adicionar Aula</button>
                </div>
            </div>

             {aiModalContent && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setAiModalContent(null)}>
                    <div className="bg-black border border-dark-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-4 border-b border-dark-800">
                            <h2 className="text-xl font-bold text-white">{aiModalContent.title}</h2>
                            <button onClick={() => setAiModalContent(null)}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white"/></button>
                        </header>
                        <main className="p-6 overflow-y-auto prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiModalContent.content.replace(/\n/g, '<br />') }} />
                    </div>
                </div>
             )}
        </div>
    );
};

export default TrainingModuleDetail;