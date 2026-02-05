import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Send,
    Loader2,
    MessageSquare,
    ShieldCheck,
    User,
    Clock,
    ArrowLeft,
    XCircle,
    CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Comment {
    id: string;
    suggestion_id: string;
    user_id: string;
    content: string;
    is_admin: boolean;
    created_at: string;
}

interface Suggestion {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    priority: string;
    context?: string;
}

interface SuggestionChatProps {
    suggestionId: string;
    onBack: () => void;
}

export function SuggestionChat({ suggestionId, onBack }: SuggestionChatProps) {
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSuggestionDetails();
        fetchComments();

        // Inscrição em tempo real para novos comentários
        const channel = supabase
            .channel(`suggestion_${suggestionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'suggestion_comments',
                filter: `suggestion_id=eq.${suggestionId}`
            }, (payload) => {
                setComments(current => [...current, payload.new as Comment]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [suggestionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const fetchSuggestionDetails = async () => {
        const { data, error } = await supabase
            .from('app_suggestions')
            .select('*')
            .eq('id', suggestionId)
            .single();

        if (data) setSuggestion(data);
    };

    const fetchComments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('suggestion_comments')
                .select('*')
                .eq('suggestion_id', suggestionId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        try {
            setSending(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('suggestion_comments')
                .insert({
                    suggestion_id: suggestionId,
                    user_id: user.id,
                    content: newComment,
                    is_admin: false, // Dono sempre é false aqui, no admin será true
                });

            if (error) throw error;
            setNewComment("");
        } catch (error: any) {
            toast({
                title: "Erro ao comentar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    if (loading && !suggestion) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando conversa...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[700px] bg-[#121212] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-tight truncate max-w-[300px]">
                            {suggestion?.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-gold/20 text-gold bg-gold/5">
                                {suggestion?.category}
                            </Badge>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                ID: {suggestionId.split('-')[0]}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Status</span>
                    <Badge className="bg-gold/10 text-gold border-gold/20 font-black">
                        {suggestion?.status}
                    </Badge>
                </div>
            </div>

            {/* Suggestion Description & Context */}
            <div className="p-6 bg-white/5 border-b border-white/5">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    "{suggestion?.description}"
                </p>
                {suggestion?.context && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Clock className="w-3 h-3 text-gold/50" />
                        <span>Contexto: <strong className="text-gold/70">{suggestion.context}</strong></span>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent"
            >
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-30">
                        <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aguardando resposta do suporte...</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className={cn(
                                "flex gap-4 max-w-[85%]",
                                comment.is_admin ? "mr-auto" : "ml-auto flex-row-reverse"
                            )}
                        >
                            <Avatar className={cn(
                                "h-10 w-10 border-2",
                                comment.is_admin ? "border-gold shadow-lg shadow-gold/20" : "border-white/10"
                            )}>
                                <AvatarFallback className={cn(
                                    "font-bold",
                                    comment.is_admin ? "bg-gradient-gold text-black" : "bg-black text-gold"
                                )}>
                                    {comment.is_admin ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn(
                                "flex flex-col",
                                !comment.is_admin && "items-end"
                            )}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-500 font-black uppercase tracking-widest">
                                        {comment.is_admin ? "Suporte RotaFácil" : "Você"}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {format(new Date(comment.created_at), "HH:mm")}
                                    </span>
                                </div>

                                <div className={cn(
                                    "p-4 rounded-[20px] text-sm leading-relaxed",
                                    comment.is_admin
                                        ? "bg-[#1A1A1A] text-white border border-gold/20 rounded-tl-none shadow-xl"
                                        : "bg-gold text-black-primary font-medium rounded-tr-none shadow-lg shadow-gold/10"
                                )}>
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-black/40 border-t border-white/5 relative z-10">
                <div className="relative group">
                    <Textarea
                        placeholder="Digite seu comentário ou resposta..."
                        className="bg-[#1A1A1A] border-white/10 text-white min-h-[80px] pr-20 rounded-2xl focus:border-gold/50 transition-all resize-none shadow-inner"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendComment();
                            }
                        }}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        <Button
                            size="icon"
                            className="h-10 w-10 bg-gradient-gold text-black hover:scale-105 transition-all shadow-lg shadow-gold/20 rounded-xl"
                            onClick={handleSendComment}
                            disabled={sending || !newComment.trim()}
                        >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center font-bold uppercase tracking-widest opacity-50">
                    Pressione Enter para enviar
                </p>
            </div>
        </div>
    );
}
