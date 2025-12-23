import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Mic, Square, Trash2, Zap, Link as LinkIcon, Wand2, Sparkles, Facebook, Instagram, Linkedin, Image as ImageIcon, X, Layers, Eraser, Target, Smile, Frown, Meh, Star } from 'lucide-react';
import { Platform, CopyFramework, EmojiLevel, PostObjective } from '../types';

interface PromptInputProps {
  onGenerate: (topic: string, tone: string, platform: Platform, framework: CopyFramework, objective: PostObjective, emojiLevel: EmojiLevel, targetUrl: string, audioBase64?: string, audioMimeType?: string, imageBase64?: string, imageMimeType?: string) => void;
  isLoading: boolean;
}

type ToneCategory = 'Essenciais' | 'Vendas' | 'Conexão' | 'Viral';

const TONE_OPTIONS: Record<ToneCategory, string[]> = {
  'Essenciais': ['Profissional & Engajador', 'Divertido & Energético', 'Curto & Direto'],
  'Vendas': ['Urgente & Escassez', 'Focado em Benefícios', 'Oferta Hard-Sell'],
  'Conexão': ['Storytelling Pessoal', 'Inspiracional (Coach)', 'Empático & Suave'],
  'Viral': ['Polêmico & Opinião', 'Sarcástico / Humor', 'Educativo / Tutorial']
};

const FRAMEWORKS: { id: CopyFramework; label: string; desc: string }[] = [
  { id: 'livre', label: 'Criativo (Livre)', desc: 'Fluxo natural sem regras rígidas' },
  { id: 'aida', label: 'A.I.D.A.', desc: 'Atenção, Interesse, Desejo, Ação' },
  { id: 'pas', label: 'P.A.S.', desc: 'Problema, Agitação, Solução' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Narrativa envolvente com lição' },
];

const OBJECTIVES: { id: PostObjective; label: string }[] = [
    { id: 'engagement', label: 'Gerar Comentários' },
    { id: 'sales', label: 'Vendas / Promoção' },
    { id: 'traffic', label: 'Cliques no Link' },
    { id: 'authority', label: 'Autoridade / Ensino' },
];

// Helper to compress images before sending to API
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 800px to ensure payload is small enough for API
        const MAX_SIZE = 800; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        // Remove prefix to get raw base64
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [tone, setTone] = useState('Profissional & Engajador');
  const [activeToneTab, setActiveToneTab] = useState<ToneCategory>('Essenciais');
  const [framework, setFramework] = useState<CopyFramework>('livre');
  const [objective, setObjective] = useState<PostObjective>('engagement');
  const [emojiLevel, setEmojiLevel] = useState<EmojiLevel>('standard');
  const [topicStrength, setTopicStrength] = useState<'Fraco' | 'Bom' | 'Excelente'>('Fraco');
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string>("audio/webm");
  
  // Image State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Topic Strength Calculation
  useEffect(() => {
    const len = topic.length;
    if (len === 0) setTopicStrength('Fraco');
    else if (len < 30) setTopicStrength('Fraco');
    else if (len < 100) setTopicStrength('Bom');
    else setTopicStrength('Excelente');
  }, [topic]);

  const getStrengthColor = () => {
    if (!topic) return 'bg-zinc-800';
    switch (topicStrength) {
      case 'Fraco': return 'bg-red-500';
      case 'Bom': return 'bg-yellow-500';
      case 'Excelente': return 'bg-green-500';
      default: return 'bg-zinc-800';
    }
  };

  const handleClearForm = () => {
      setTopic('');
      setTargetUrl('');
      clearAudio();
      clearImage();
      setTone('Profissional & Engajador');
      setActiveToneTab('Essenciais');
      setPlatform('facebook');
      setFramework('livre');
      setObjective('engagement');
      setEmojiLevel('standard');
  };

  const generateIdea = () => {
      let ideas: string[] = [];

      if (platform === 'linkedin') {
        ideas = [
            "Escreva sobre um erro profissional que me ensinou uma lição valiosa em [SUA ÁREA].",
            "Crie uma análise técnica simplificada sobre a tendência [TENDÊNCIA] do meu mercado.",
            "Liste 3 soft skills que todo profissional de [CARGO] precisa ter hoje.",
            "Faça um post 'Behind the scenes' mostrando a cultura da minha empresa."
        ];
      } else if (platform === 'instagram') {
        ideas = [
            "Crie uma legenda curta e inspiradora para uma foto minha trabalhando.",
            "3 Mitos sobre [TEMA] que precisam ser quebrados agora.",
            "Um checklist rápido para quem quer começar em [ÁREA].",
            "Uma frase motivacional 'tapa na cara' sobre disciplina em [ÁREA]."
        ];
      } else { // Facebook/General
        ideas = [
            "Crie um post polêmico (respeitoso) perguntando a opinião das pessoas sobre [ASSUNTO].",
            "Conte uma história de transformação de um cliente que usou [PRODUTO].",
            "Escreva um post de 'Agradecimento' celebrando uma conquista recente.",
            "Faça uma pergunta 'Você prefere A ou B?' relacionada ao meu nicho para gerar comentários."
        ];
      }
      
      const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
      setTopic(randomIdea);
  };

  // --- AUDIO HANDLING ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = { mimeType: 'audio/webm' };
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
      
      setMimeType(options.mimeType);

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Permissão de microfone necessária para gravar áudio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    chunksRef.current = [];
  };

  // --- IMAGE HANDLING ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !audioBlob && !selectedImage) return;

    let audioBase64 = undefined;
    if (audioBlob) {
      audioBase64 = await blobToBase64(audioBlob);
    }

    let imageBase64 = undefined;
    let imageMime = undefined;
    
    if (selectedImage) {
      try {
        imageBase64 = await compressImage(selectedImage);
        imageMime = "image/jpeg";
      } catch (err) {
        console.error("Failed to compress image", err);
        alert("Erro ao processar imagem. Tente uma imagem menor.");
        return;
      }
    }

    onGenerate(topic, tone, platform, framework, objective, emojiLevel, targetUrl, audioBase64, mimeType, imageBase64, imageMime);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-1 relative z-10">
      {/* Gold border gradient wrapper */}
      <div className="relative rounded-xl bg-gradient-to-br from-amber-800 via-yellow-600 to-amber-900 p-[1px] shadow-2xl">
        <div className="bg-zinc-950 rounded-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
             {/* Top Bar */}
             <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                 <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> Estúdio de Criação
                 </h3>
                 <button 
                    type="button" 
                    onClick={handleClearForm}
                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                 >
                     <Eraser className="w-3 h-3" /> Limpar Tudo
                 </button>
             </div>

             {/* 1. Context Selection (Platform & Objective) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Platform */}
                 <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-3 uppercase tracking-wider">
                       1. Rede Social
                    </label>
                    <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPlatform('facebook')}
                          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-all ${platform === 'facebook' ? 'bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                        >
                          <Facebook className="w-5 h-5" />
                          <span className="text-[10px] font-bold">Facebook</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlatform('instagram')}
                          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-all ${platform === 'instagram' ? 'bg-pink-600/10 border-pink-500 text-pink-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                        >
                          <Instagram className="w-5 h-5" />
                          <span className="text-[10px] font-bold">Insta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlatform('linkedin')}
                          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-all ${platform === 'linkedin' ? 'bg-[#0A66C2]/10 border-[#0A66C2] text-[#0A66C2]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                        >
                          <Linkedin className="w-5 h-5" />
                          <span className="text-[10px] font-bold">LinkedIn</span>
                        </button>
                    </div>
                 </div>

                 {/* Objective */}
                 <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-3 h-3" />
                       Objetivo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {OBJECTIVES.map((obj) => (
                            <button
                                key={obj.id}
                                type="button"
                                onClick={() => setObjective(obj.id)}
                                className={`text-[10px] font-bold py-3 px-2 rounded-lg border transition-all truncate ${
                                    objective === obj.id
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                }`}
                            >
                                {obj.label}
                            </button>
                        ))}
                    </div>
                 </div>
             </div>

             {/* 2. Structure (Framework & Emojis) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Framework */}
                <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3 h-3" />
                       2. Estrutura (Framework)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FRAMEWORKS.map((fw) => (
                        <button
                          key={fw.id}
                          type="button"
                          onClick={() => setFramework(fw.id)}
                          className={`p-2 rounded-lg border text-left transition-all group ${
                            framework === fw.id 
                            ? 'bg-amber-500/10 border-amber-500' 
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] font-bold ${framework === fw.id ? 'text-amber-500' : 'text-zinc-300'}`}>
                              {fw.label}
                            </span>
                            {framework === fw.id && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>}
                          </div>
                          <span className="text-[9px] text-zinc-500 block truncate">{fw.desc}</span>
                        </button>
                      ))}
                    </div>
                </div>

                {/* Emoji Meter */}
                <div className="md:col-span-1">
                     <label className="block text-zinc-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Smile className="w-3 h-3" />
                       Emojis
                    </label>
                    <div className="flex justify-between bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setEmojiLevel('none')}
                            className={`p-2 rounded flex-1 flex justify-center transition-all ${emojiLevel === 'none' ? 'bg-red-500/20 text-red-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                            title="Sem Emojis"
                        >
                            <span className="text-sm font-bold block">🚫</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setEmojiLevel('minimal')}
                            className={`p-2 rounded flex-1 flex justify-center transition-all ${emojiLevel === 'minimal' ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                            title="Mínimo"
                        >
                            <Meh className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setEmojiLevel('standard')}
                            className={`p-2 rounded flex-1 flex justify-center transition-all ${emojiLevel === 'standard' ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                            title="Padrão"
                        >
                            <Smile className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setEmojiLevel('max')}
                            className={`p-2 rounded flex-1 flex justify-center transition-all ${emojiLevel === 'max' ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                            title="Exagerado"
                        >
                            <Star className="w-4 h-4" />
                        </button>
                    </div>
                </div>

             </div>

            {/* 3. Main Input + Media Controls */}
            <div className="space-y-3">
               <div className="flex justify-between items-end">
                  <label htmlFor="topic" className="block text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      3. Conteúdo do Post
                  </label>
                  
                  <div className="flex gap-2">
                    {/* Ideas Button */}
                    <button 
                        type="button"
                        onClick={generateIdea}
                        className="text-[10px] bg-zinc-900 hover:bg-amber-900/20 text-amber-500 hover:text-amber-400 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-amber-500/50 flex items-center gap-2 transition-colors"
                      >
                         <Sparkles className="w-3 h-3" />
                         Ideia {platform === 'linkedin' ? 'B2B' : 'Viral'}
                    </button>

                    {/* Upload Image Button */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {!selectedImage && (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-800 flex items-center gap-2 transition-colors"
                      >
                         <ImageIcon className="w-3 h-3" />
                         Foto
                      </button>
                    )}

                    {/* Audio Button */}
                    {!isRecording && !audioBlob && (
                      <button 
                        type="button"
                        onClick={startRecording}
                        className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-800 flex items-center gap-2 transition-colors"
                      >
                         <Mic className="w-3 h-3" />
                         Gravar
                      </button>
                    )}
                  </div>
               </div>

               {/* Media Active Status Bar */}
               <div className="flex flex-col gap-2">
                 {/* Audio Active UI */}
                 {(isRecording || audioBlob) && (
                   <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex items-center justify-between animate-fade-in">
                      {isRecording ? (
                          <div className="flex items-center gap-3">
                               <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                               </span>
                               <span className="text-red-400 text-sm font-bold animate-pulse">Gravando...</span>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2 text-amber-400">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium">Áudio pronto para transcrição</span>
                          </div>
                      )}
                      
                      <div className="flex gap-2">
                          {isRecording ? (
                              <button type="button" onClick={stopRecording} className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-full transition-colors">
                                  <Square className="w-4 h-4 fill-current" />
                              </button>
                          ) : (
                              <button type="button" onClick={clearAudio} className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-full transition-colors">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          )}
                      </div>
                   </div>
                 )}

                 {/* Image Active UI */}
                 {imagePreview && (
                    <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 flex items-center justify-between animate-fade-in">
                       <div className="flex items-center gap-3">
                          <img src={imagePreview} alt="Preview" className="w-10 h-10 object-cover rounded bg-black" />
                          <div>
                              <p className="text-zinc-300 text-xs font-bold">Imagem anexada</p>
                              <p className="text-[10px] text-zinc-500">A IA irá analisar o conteúdo visual</p>
                          </div>
                       </div>
                       <button type="button" onClick={clearImage} className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-full transition-colors">
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                 )}
               </div>

              <div className="relative">
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    (audioBlob || selectedImage) 
                    ? "Mídia anexada! Adicione detalhes extras sobre preço ou link se desejar..." 
                    : "Digite o tema, cole um texto ou use uma 'Ideia Mágica'..."
                  }
                  className="w-full bg-zinc-900/50 text-zinc-100 border border-zinc-800 rounded-lg p-4 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all h-28 resize-none placeholder-zinc-600 text-base shadow-inner"
                />
                {/* Topic Strength Indicator */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-800 rounded-b-lg overflow-hidden flex">
                   <div 
                      className={`h-full transition-all duration-500 ${getStrengthColor()}`} 
                      style={{ width: `${Math.min((topic.length / 100) * 100, 100)}%` }}
                   />
                </div>
              </div>
              <div className="flex justify-end">
                 <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                    Qualidade do Prompt: <span className={topicStrength === 'Fraco' ? 'text-red-500' : topicStrength === 'Bom' ? 'text-yellow-500' : 'text-green-500'}>{topicStrength}</span>
                 </span>
              </div>
            </div>

            {/* 4. Link Input */}
            <div className="relative">
               <label htmlFor="url" className="block text-zinc-400 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-3 h-3" />
                Link de Destino (Opcional)
              </label>
              <div className="relative">
                  <input
                    type="url"
                    id="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://seusite.com"
                    className="w-full bg-zinc-900/50 text-zinc-300 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 focus:outline-none focus:border-zinc-600 transition-all text-sm font-mono"
                  />
                  {targetUrl && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500">
                          <Sparkles className="w-3 h-3" />
                      </div>
                  )}
              </div>
            </div>

            {/* 5. Tone Selection */}
            <div>
              <label className="block text-zinc-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3" />
                5. Estilo de Voz (Tom)
              </label>
              
              {/* Tabs */}
              <div className="flex border-b border-zinc-800 mb-4 overflow-x-auto scrollbar-hide">
                 {(Object.keys(TONE_OPTIONS) as ToneCategory[]).map((cat) => (
                     <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveToneTab(cat)}
                        className={`
                           pb-2 px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 uppercase tracking-wide
                           ${activeToneTab === cat 
                             ? 'border-amber-500 text-amber-500' 
                             : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}
                        `}
                     >
                        {cat}
                     </button>
                 ))}
              </div>

              {/* Pills */}
              <div className="flex flex-wrap gap-2 animate-fade-in">
                  {TONE_OPTIONS[activeToneTab].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTone(option)}
                        className={`
                           px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all transform active:scale-95 uppercase
                           ${tone === option 
                             ? 'bg-amber-500 text-zinc-900 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                             : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'}
                        `}
                      >
                          {option}
                      </button>
                  ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!topic.trim() && !audioBlob && !selectedImage)}
              className={`
                group relative w-full py-4 rounded-lg font-bold text-base uppercase tracking-widest
                transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden mt-2
                ${isLoading || (!topic.trim() && !audioBlob && !selectedImage)
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-amber-600 hover:bg-amber-500 text-zinc-950 shadow-lg hover:shadow-amber-500/20'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  Criando...
                </span>
              ) : (
                <>
                  <span>Gerar Copy com RS-IA</span>
                  <PenTool className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;