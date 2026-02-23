

import React, { FC, useState } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import * as icons from '../../components/icons';
import { GoogleGenAI, Type } from "@google/genai";
import type { Workflow } from '../../types';

interface AutomationsViewProps {
    onSelectWorkflow: (workflow: Workflow) => void;
    onCreateNew: () => void;
}

const workflowTemplates: (Workflow & { iconFlow: React.ElementType[] })[] = [
    {
        id: 'template-welcome-whatsapp',
        name: 'Boas-vindas para Novo Indicado',
        description: 'Envia uma mensagem de boas-vindas no WhatsApp para cada novo consultor cadastrado.',
        iconFlow: [icons.IconUser, icons.IconWhatsapp],
        nodes: [
            { id: 'start-1', type: 'newUser', label: 'Novo Indicado', position: { x: 50, y: 150 }, parameters: [], outputs: [{ name: 'trigger.newUser.name', label: 'Nome do Novo Indicado' }, { name: 'trigger.newUser.email', label: 'Email do Novo Indicado' }] },
            { id: 'action-1', type: 'whatsappMessage', label: 'Enviar WhatsApp', position: { x: 350, y: 150 }, parameters: [{ name: 'message', label: 'Mensagem', type: 'textarea', value: 'Olá, {{trigger.newUser.name}}! Seja muito bem-vindo(a) à nossa equipe na RS Prólipsi. Estou aqui para te ajudar a começar. Meu WhatsApp é {{USER_WHATSAPP}}.' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
    {
        id: 'template-post-sale-followup',
        name: 'Pós-Venda (E-commerce)',
        description: 'Envia um e-mail de agradecimento e followup 1 dia após uma nova compra na sua loja.',
        iconFlow: [icons.IconShoppingCart, icons.IconFileClock, icons.IconSend],
        nodes: [
            { id: 'start-1', type: 'newSale', label: 'Nova Venda', position: { x: 50, y: 150 }, parameters: [], outputs: [{ name: 'trigger.sale.customerName', label: 'Nome do Cliente' }] },
            { id: 'delay-1', type: 'delay', label: 'Aguardar 1 dia', position: { x: 300, y: 150 }, parameters: [{ name: 'duration', label: 'Duração', type: 'text', value: '1 dia' }] },
            { id: 'action-1', type: 'sendEmail', label: 'Enviar Email de Followup', position: { x: 550, y: 150 }, parameters: [{ name: 'subject', label: 'Assunto', type: 'text', value: 'Obrigado pela sua compra!' }, { name: 'body', label: 'Corpo do Email', type: 'textarea', value: 'Olá, {{trigger.sale.customerName}}! Muito obrigado por comprar na minha loja. Espero que goste do seu produto!' }] }
        ],
        edges: [
            { id: 'e1-2', source: 'start-1', target: 'delay-1' },
            { id: 'e2-3', source: 'delay-1', target: 'action-1' }
        ],
    },
    {
        id: 'template-birthday-whatsapp',
        name: 'Parabéns de Aniversário',
        description: 'Envia uma mensagem de feliz aniversário para seus indicados diretos no dia do aniversário deles.',
        iconFlow: [icons.IconCalendar, icons.IconWhatsapp],
        nodes: [
            { id: 'start-1', type: 'birthday', label: 'Aniversário do Indicado', position: { x: 50, y: 150 }, parameters: [], outputs: [{ name: 'trigger.birthday.consultantName', label: 'Nome do Aniversariante' }] },
            { id: 'action-1', type: 'whatsappMessage', label: 'Enviar Parabéns', position: { x: 350, y: 150 }, parameters: [{ name: 'message', label: 'Mensagem', type: 'textarea', value: 'Olá, {{trigger.birthday.consultantName}}! 🎉 Feliz aniversário! Muita saúde, paz e sucesso. Que seu novo ciclo seja incrível!' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
    {
        id: 'template-scheduled-instagram-post',
        name: 'Post Agendado (Instagram)',
        description: 'Publica uma imagem e legenda no seu Instagram em um dia e horário agendado.',
        iconFlow: [icons.IconCalendar, icons.IconFacebook], // IconFacebook is used for instagram
        nodes: [
            { id: 'start-1', type: 'schedule', label: 'Agendamento', position: { x: 50, y: 150 }, parameters: [{ name: 'cron', label: 'Quando', type: 'text', value: 'Toda Sexta-feira às 10:00' }] },
            { id: 'action-1', type: 'instagramPost', label: 'Postar no Instagram', position: { x: 350, y: 150 }, parameters: [{ name: 'image_url', label: 'URL da Imagem', type: 'text', value: 'https://...' }, { name: 'caption', label: 'Legenda', type: 'textarea', value: 'Sextou com S de Sucesso! ✨ #rsprolipsi #mmn #sucesso' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
    {
        id: 'template-scheduled-facebook-post',
        name: 'Post Agendado (Facebook)',
        description: 'Publica uma mensagem e imagem no seu Facebook em um horário programado.',
        iconFlow: [icons.IconCalendar, icons.IconFacebook],
        nodes: [
            { id: 'start-1', type: 'schedule', label: 'Agendamento', position: { x: 50, y: 150 }, parameters: [{ name: 'cron', label: 'Quando', type: 'text', value: 'Toda Terça-feira às 14:00' }] },
            { id: 'action-1', type: 'facebookPost', label: 'Postar no Facebook', position: { x: 350, y: 150 }, parameters: [{ name: 'image_url', label: 'URL da Imagem', type: 'text', value: '' }, { name: 'message', label: 'Mensagem', type: 'textarea', value: 'Uma ótima tarde a todos! Pensamento do dia: O sucesso é a soma de pequenos esforços repetidos dia após dia.' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
    {
        id: 'template-scheduled-tiktok-video',
        name: 'Vídeo Agendado (TikTok/Reels)',
        description: 'Publica um vídeo no seu TikTok (ou Reels) em um dia e horário específico.',
        iconFlow: [icons.IconCalendar, icons.IconTikTok],
        nodes: [
            { id: 'start-1', type: 'schedule', label: 'Agendamento Semanal', position: { x: 50, y: 150 }, parameters: [{ name: 'cron', label: 'Quando', type: 'text', value: 'Toda Quarta-feira às 18:00' }] },
            { id: 'action-1', type: 'tiktokPost', label: 'Postar Vídeo', position: { x: 350, y: 150 }, parameters: [{ name: 'video_url', label: 'URL do Vídeo', type: 'text', value: 'https://...' }, { name: 'caption', label: 'Legenda', type: 'textarea', value: 'Um vídeo incrível para inspirar sua semana! #videomarketing #rsprolipsi' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
     {
        id: 'template-pin-achieved',
        name: 'Reconhecimento de PIN',
        description: 'Posta uma mensagem de parabéns no Facebook quando alguém da sua equipe atinge um novo PIN.',
        iconFlow: [icons.IconAward, icons.IconFacebook],
        nodes: [
            { id: 'start-1', type: 'pinAchieved', label: 'Novo PIN Atingido', position: { x: 50, y: 150 }, parameters: [], outputs: [{ name: 'trigger.pin.consultantName', label: 'Nome do Consultor' }, { name: 'trigger.pin.newPin', label: 'Novo PIN' }] },
            { id: 'action-1', type: 'facebookPost', label: 'Postar Reconhecimento', position: { x: 350, y: 150 }, parameters: [{ name: 'message', label: 'Mensagem', type: 'textarea', value: 'Parabéns, {{trigger.pin.consultantName}}, pela incrível conquista do PIN de {{trigger.pin.newPin}}! Seu sucesso inspira a todos nós! 🚀 #Sucesso #RSPrólipsi' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
    {
        id: 'template-lead-to-google-sheets',
        name: 'Salvar Leads no Google Sheets',
        description: 'Quando um novo consultor se cadastra, salva o nome e email dele em uma planilha do Google.',
        iconFlow: [icons.IconUser, icons.IconGoogle],
        nodes: [
            { id: 'start-1', type: 'newUser', label: 'Novo Indicado', position: { x: 50, y: 150 }, parameters: [], outputs: [{ name: 'trigger.newUser.name', label: 'Nome do Indicado' }, { name: 'trigger.newUser.email', label: 'Email do Indicado' }] },
            { id: 'action-1', type: 'googleSheetAddRow', label: 'Adicionar à Planilha', position: { x: 350, y: 150 }, parameters: [{ name: 'sheet_url', label: 'URL da Planilha', type: 'text', value: 'https://docs.google.com/spreadsheets/d/...' }, { name: 'data', label: 'Dados (JSON)', type: 'textarea', value: '{"Nome": "{{trigger.newUser.name}}", "Email": "{{trigger.newUser.email}}"}' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
     {
        id: 'template-motivational-linkedin',
        name: 'Post Motivacional (LinkedIn)',
        description: 'Publica um post inspirador sobre carreira e empreendedorismo toda segunda-feira.',
        iconFlow: [icons.IconCalendar, icons.IconLinkedin],
        nodes: [
            { id: 'start-1', type: 'schedule', label: 'Toda Segunda às 9h', position: { x: 50, y: 150 }, parameters: [{ name: 'cron', label: 'Quando', type: 'text', value: 'Toda Segunda-feira às 09:00' }] },
            { id: 'action-1', type: 'linkedInPost', label: 'Postar no LinkedIn', position: { x: 350, y: 150 }, parameters: [{ name: 'content', label: 'Conteúdo', type: 'textarea', value: 'Comece a semana com foco total nos seus objetivos. Cada passo, por menor que seja, te aproxima do sucesso. #Empreendedorismo #MarketingDeRede #Liderança #DesenvolvimentoPessoal' }] }
        ],
        edges: [{ id: 'e1-2', source: 'start-1', target: 'action-1' }],
    },
];

const mockUserWorkflows: Workflow[] = [
    {
        ...workflowTemplates[0],
        id: 'user-wf-1',
        name: 'Minha Mensagem de Boas-Vindas',
        isActive: true,
    },
    {
        id: 'user-wf-2',
        name: 'Post Motivacional Semanal',
        description: 'Posta uma imagem motivacional toda segunda de manhã.',
        nodes: [],
        edges: [],
        isActive: false,
    }
];

const AiBuilderModal: FC<{ isOpen: boolean, onClose: () => void, onWorkflowGenerated: (wf: Workflow) => void }> = ({ isOpen, onClose, onWorkflowGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Por favor, descreva a automação que você deseja criar.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `Sua tarefa é converter uma descrição em linguagem natural em um objeto JSON válido que representa um fluxo de trabalho (Workflow).
            
            Estrutura do Workflow JSON:
            - id: string (use um timestamp, ex: "ai-wf-1722294026365")
            - name: string (um nome descritivo, ex: "Lembrete de Aniversário")
            - description: string (a descrição original do usuário)
            - nodes: WorkflowNode[]
            - edges: WorkflowEdge[]
            - isActive: boolean (sempre 'false' por padrão)

            Estrutura do Nó (WorkflowNode):
            - id: string (único, ex: "start-1", "action-1")
            - type: WorkflowNodeType (um dos tipos válidos abaixo)
            - label: string (um rótulo curto para o nó, ex: "Enviar WhatsApp")
            - position: { x: number, y: number } (posicione os nós da esquerda para a direita, x aumenta em ~300 por passo, y é 150)
            - parameters: WorkflowNodeParameter[] (parâmetros padrão para o tipo de nó)

            Estrutura da Aresta (WorkflowEdge):
            - id: string (único, ex: "e-start-1-action-1")
            - source: string (id do nó de origem)
            - target: string (id do nó de destino)
            - sourceHandle: string (opcional, para nós com múltiplas saídas como 'condition')

            Tipos de Nós (WorkflowNodeType) e seus parâmetros padrão:
            - start: Ponto de partida. Sempre o primeiro nó.
            - newUser: Gatilho para novo indicado.
            - schedule: Gatilho de agendamento. Tente extrair a frequência (cron).
            - whatsappMessage: Ação para enviar mensagem no WhatsApp. Parâmetro principal: 'message'.
            - delay: Ação de espera. Parâmetro principal: 'duration'.
            - condition: Lógica condicional. Parâmetro principal: 'condition'. Use variáveis como {{trigger.sale.amount}}.
            - instagramPost: Ação para postar no Instagram. Parâmetros: 'image_url', 'caption'.
            - birthday: Gatilho para aniversário de indicado.
            - pinAchieved: Gatilho para novo PIN na equipe.
            - newSale: Gatilho para nova venda na loja.
            - sendEmail: Ação de enviar e-mail.
            - facebookPost: Ação de postar no Facebook.
            - tiktokPost: Ação de postar no TikTok.

            Sempre comece com um nó do tipo 'start'. O primeiro nó após o 'start' deve ser um gatilho (ex: 'schedule', 'newUser'). Conecte os nós sequencialmente. Seja lógico ao criar os parâmetros, preenchendo-os com base na solicitação do usuário.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Gere um JSON de workflow para a seguinte solicitação: "${prompt}"`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                }
            });

            const jsonString = response.text.trim();
            const generatedWorkflow = JSON.parse(jsonString);
            
            // Basic validation
            if (generatedWorkflow && generatedWorkflow.nodes && generatedWorkflow.edges) {
                onWorkflowGenerated(generatedWorkflow);
                onClose();
            } else {
                throw new Error("A IA retornou um formato de JSON inválido.");
            }

        } catch (e) {
            console.error(e);
            setError("Ocorreu um erro ao gerar a automação. A IA pode ter retornado uma resposta inesperada. Tente ser mais específico na sua descrição.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Automação com RSIA">
            <div className="space-y-4">
                <p className="text-sm text-gray-300">Descreva o que você quer automatizar. A RSIA vai construir o fluxo de trabalho inicial para você.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="Ex: Toda segunda-feira às 8h da manhã, envie uma mensagem motivacional para mim no WhatsApp."
                    className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div>
                    ) : (
                        <><icons.IconSparkles /> Gerar Fluxo de Trabalho</>
                    )}
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        </Modal>
    );
};


const AutomationsView: FC<AutomationsViewProps> = ({ onSelectWorkflow, onCreateNew }) => {
    const [userWorkflows, setUserWorkflows] = useState(mockUserWorkflows);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    const toggleWorkflowStatus = (id: string) => {
        setUserWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, isActive: !wf.isActive } : wf));
    };
    
    const duplicateWorkflow = (id: string) => {
        const original = userWorkflows.find(wf => wf.id === id) || workflowTemplates.find(wf => wf.id === id);
        if (original) {
            const newWorkflow = {
                ...JSON.parse(JSON.stringify(original)), // Deep copy
                id: `user-wf-${Date.now()}`,
                name: `${original.name} (Cópia)`,
                isActive: false,
            };
            setUserWorkflows(prev => [newWorkflow, ...prev]);
        }
    };
    
    const deleteWorkflow = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este fluxo de trabalho?")) {
            setUserWorkflows(prev => prev.filter(wf => wf.id !== id));
        }
    };
    
    const handleWorkflowGenerated = (newWorkflow: Workflow) => {
        setUserWorkflows(prev => [newWorkflow, ...prev]);
        onSelectWorkflow(newWorkflow); // Open the new workflow in the builder
    };

    const filteredWorkflows = userWorkflows
        .filter(wf => {
            if (statusFilter === 'all') return true;
            return statusFilter === 'active' ? wf.isActive : !wf.isActive;
        })
        .filter(wf =>
            wf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wf.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="space-y-8 animate-fade-in">
            <Card>
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                    <icons.IconRepeat size={48} className="mx-auto md:mx-0 text-brand-gold opacity-80 flex-shrink-0"/>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Automações RSIA</h2>
                        <p className="text-gray-400 mt-2">
                           Crie fluxos de trabalho para automatizar suas tarefas de marketing e comunicação. Deixe a RSIA trabalhar por você.
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-white">Meus Fluxos de Trabalho</h3>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                         <div className="relative flex-grow">
                            <icons.IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                            <input 
                                type="text"
                                placeholder="Buscar fluxos..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-brand-gray border border-brand-gray-light rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-gold focus:outline-none text-sm"
                            />
                        </div>
                        <button onClick={() => setIsAiModalOpen(true)} title="Criar com Inteligência Artificial" className="flex items-center gap-2 bg-brand-gray text-brand-gold font-bold py-2 px-4 rounded-lg hover:bg-brand-dark flex-shrink-0">
                            <icons.IconSparkles/> Criar com IA
                        </button>
                        <button onClick={onCreateNew} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 flex-shrink-0">
                            <icons.IconPlus/> Novo Fluxo
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    {(['all', 'active', 'inactive'] as const).map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === status ? 'bg-brand-gold text-brand-dark' : 'bg-brand-gray-light text-gray-300 hover:bg-brand-gray'}`}
                        >
                            {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : 'Inativos'}
                        </button>
                    ))}
                </div>

                 <div className="space-y-4">
                    {filteredWorkflows.length > 0 ? filteredWorkflows.map(wf => (
                        <Card key={wf.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-gray-dark">
                            <div className="flex-1">
                                <h4 className="font-semibold text-white">{wf.name}</h4>
                                <p className="text-sm text-gray-400 mt-1">{wf.description}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{wf.isActive ? 'Ativo' : 'Inativo'}</span>
                                    <label htmlFor={`toggle-${wf.id}`} className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id={`toggle-${wf.id}`} className="sr-only peer" checked={wf.isActive} onChange={() => toggleWorkflowStatus(wf.id)} />
                                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                                    </label>
                                </div>
                                <button onClick={() => onSelectWorkflow(wf)} title="Editar" className="p-2 hover:bg-brand-gray rounded-full"><icons.IconEdit size={18}/></button>
                                <button onClick={() => duplicateWorkflow(wf.id)} title="Duplicar" className="p-2 hover:bg-brand-gray rounded-full"><icons.IconCopyPlus size={18}/></button>
                                <button onClick={() => deleteWorkflow(wf.id)} title="Excluir" className="p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-full"><icons.IconTrash size={18}/></button>
                            </div>
                        </Card>
                    )) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>Nenhum fluxo de trabalho encontrado.</p>
                            <p className="text-sm">Tente ajustar seus filtros ou crie um novo fluxo.</p>
                        </div>
                    )}
                </div>
            </Card>
            
            <Card>
                <h3 className="text-xl font-bold text-white mb-4">Comece com um Modelo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* FIX: To use an array element as a JSX component, assign it to a capitalized variable first. */}
                    {workflowTemplates.map(template => {
                        const iconFlow = template.iconFlow.map((Icon, index) => (
                            <React.Fragment key={index}>
                                <Icon className="text-brand-gold" />
                                {index < template.iconFlow.length - 1 && <icons.IconChevronRight className="text-gray-500" />}
                            </React.Fragment>
                        ));

                        return (
                         <Card key={template.id} className="p-6 flex flex-col bg-brand-gray-dark hover:shadow-gold-glow transition-shadow duration-300">
                            <div className="flex items-center gap-2 mb-3 h-6">
                                {iconFlow}
                            </div>
                            <h4 className="font-semibold text-white text-lg h-12">{template.name}</h4>
                            <p className="text-sm text-gray-400 flex-grow mt-2">{template.description}</p>
                            <button onClick={() => onSelectWorkflow(template)} className="mt-6 bg-brand-gray text-brand-gold font-semibold py-2 px-4 rounded-lg hover:bg-brand-dark self-start">
                                Usar este Modelo
                            </button>
                        </Card>
                        );
                    })}
                </div>
            </Card>
            <AiBuilderModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onWorkflowGenerated={handleWorkflowGenerated} />
        </div>
    );
};

export default AutomationsView;
