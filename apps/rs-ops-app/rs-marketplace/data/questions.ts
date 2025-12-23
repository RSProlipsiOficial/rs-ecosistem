import { Question } from '../types';

export const initialQuestions: Question[] = [
    {
        id: 'q-1',
        productId: '1',
        author: 'Carlos P.',
        text: 'A pulseira é de couro legítimo mesmo? É resistente?',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        answers: [
            {
                id: 'a-1',
                author: 'Ana Carolina (Vendedor)',
                text: 'Olá, Carlos! Sim, a pulseira é de couro genuíno de alta qualidade, muito resistente e confortável para o uso diário.',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            }
        ]
    },
    {
        id: 'q-2',
        productId: '1',
        author: 'Mariana F.',
        text: 'É à prova d\'água? Posso nadar com ele?',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        answers: [
            {
                id: 'a-2',
                author: 'Ana Carolina (Vendedor)',
                text: 'Olá, Mariana. Ele tem resistência à água de 5 ATM, o que significa que é adequado para banho e respingos, mas não recomendamos para natação ou mergulho.',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
            },
            {
                id: 'a-3',
                author: 'Carlos P.',
                text: 'Eu tenho um e já tomei chuva com ele sem problemas.',
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            }
        ]
    },
];
