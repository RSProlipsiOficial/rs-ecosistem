import React, { useMemo, useState } from 'react';
import { Question, Answer } from '../types';
import { SendIcon } from './icons/SendIcon';

interface ProductQAProps {
    productId: string;
    questions: Question[];
    onQuestionSubmit: (questionData: Omit<Question, 'id' | 'createdAt' | 'answers'>) => void;
    onAnswerSubmit: (questionId: string, answerData: Omit<Answer, 'id' | 'createdAt'>) => void;
}

const ProductQA: React.FC<ProductQAProps> = ({ productId, questions, onQuestionSubmit, onAnswerSubmit }) => {

    const productQuestions = useMemo(() => {
        return questions
            .filter(q => q.productId === productId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [questions, productId]);

    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionAuthor, setNewQuestionAuthor] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const handleAskQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (newQuestionText.trim() && newQuestionAuthor.trim()) {
            onQuestionSubmit({
                productId,
                author: newQuestionAuthor,
                text: newQuestionText,
            });
            setNewQuestionText('');
            setNewQuestionAuthor('');
        }
    };

    const handlePostReply = (questionId: string) => {
        if (replyText.trim()) {
            onAnswerSubmit(questionId, {
                author: 'RS Prólipsi (Vendedor)', // Updated to use brand name
                text: replyText
            });
            setReplyingTo(null);
            setReplyText('');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold font-display text-white mb-4">Perguntas e Respostas</h2>

            <form onSubmit={handleAskQuestion} className="bg-dark-800/50 p-4 rounded-lg mb-6 space-y-3">
                <textarea
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                    placeholder="Faça sua pergunta sobre o produto..."
                    rows={3}
                    className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"
                />
                <div className="flex items-center gap-2">
                    <input
                        value={newQuestionAuthor}
                        onChange={e => setNewQuestionAuthor(e.target.value)}
                        placeholder="Seu nome"
                        className="flex-grow bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"
                    />
                    <button type="submit" className="bg-gold-500 text-black font-bold py-2 px-4 rounded-md">Enviar Pergunta</button>
                </div>
            </form>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {productQuestions.length > 0 ? (
                    productQuestions.map(q => (
                        <div key={q.id} className="border-b border-dark-800 pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                                <div className="font-bold text-gold-400 text-lg">P:</div>
                                <div className="flex-grow">
                                    <p className="text-gray-200">{q.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">{q.author} - {new Date(q.createdAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            <div className="pl-8 mt-2 space-y-2">
                                {q.answers.map(a => (
                                    <div key={a.id} className="flex items-start gap-3">
                                        <div className="font-bold text-cyan-400 text-lg">R:</div>
                                        <div className="flex-grow bg-dark-800/50 p-2 rounded-md">
                                            <p className="text-gray-300 text-sm">{a.text}</p>
                                            <p className="text-xs text-gray-500 mt-1">{a.author} - {new Date(a.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                ))}
                                {replyingTo === q.id ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Sua resposta..." className="flex-grow bg-dark-700 border border-dark-700 rounded-md py-1 px-2 text-sm text-white" />
                                        <button onClick={() => handlePostReply(q.id)} className="bg-cyan-500 text-black text-xs font-bold py-1 px-2 rounded-md">Postar</button>
                                        <button onClick={() => setReplyingTo(null)} className="text-gray-500 text-xs">Cancelar</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setReplyingTo(q.id)} className="text-xs font-semibold text-cyan-400 hover:underline mt-2">Responder</button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-4">Nenhuma pergunta foi feita ainda. Seja o primeiro!</p>
                )}
            </div>
        </div>
    );
};

export default ProductQA;
