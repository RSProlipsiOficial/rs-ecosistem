import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    Upload,
    Send,
    Image as ImageIcon,
    Loader2,
    AlertCircle
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SuggestionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function SuggestionModal({ open, onOpenChange, onSuccess }: SuggestionModalProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Financeiro");
    const [priority, setPriority] = useState("MEDIUM");
    const [context, setContext] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            toast({
                title: "Campos obrigatórios",
                description: "Título e descrição são necessários.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // TODO: Implementar upload de arquivo real no Storage se necessário
            // Por agora, salvamos os dados básicos
            const { error } = await supabase
                .from('app_suggestions')
                .insert({
                    tenant_id: user.id,
                    title,
                    description,
                    category,
                    priority,
                    context,
                    status: 'OPEN'
                });

            if (error) throw error;

            toast({
                title: "Sugestão enviada!",
                description: "Obrigado pelo seu feedback. Nossa equipe irá analisar.",
                className: "bg-green-600 text-white border-none",
            });

            // Reset
            setTitle("");
            setDescription("");
            setContext("");
            setAttachment(null);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error sending suggestion:', error);
            toast({
                title: "Erro ao enviar",
                description: error.message || "Tente novamente em instantes.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[600px] overflow-hidden rounded-[24px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gold/20 rounded-lg">
                            <Plus className="h-5 w-5 text-gold" />
                        </div>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                            Nova Sugestão
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400">
                        Envie melhorias que você gostaria de ver no aplicativo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Título</Label>
                            <Input
                                placeholder="Ex: Melhoria no relatório financeiro"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-[#0a0a0a] border-white/10 text-white h-12 rounded-xl focus:border-gold/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Categoria</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-full bg-[#0a0a0a] border-white/10 text-white h-12 rounded-xl focus:border-gold/50">
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                                    <SelectItem value="Alunos">Alunos</SelectItem>
                                    <SelectItem value="Motoristas">Motoristas</SelectItem>
                                    <SelectItem value="Mensalidades">Mensalidades</SelectItem>
                                    <SelectItem value="Notificações">Notificações</SelectItem>
                                    <SelectItem value="Layout">Layout</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Descrição Detalhada</Label>
                        <Textarea
                            placeholder="Explique o que você gostaria de mudar e por quê..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-[#0a0a0a] border-white/10 text-white min-h-[120px] rounded-xl focus:border-gold/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Prioridade</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="w-full bg-[#0a0a0a] border-white/10 text-white h-12 rounded-xl focus:border-gold/50">
                                    <SelectValue placeholder="Prioridade" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="LOW">Baixa</SelectItem>
                                    <SelectItem value="MEDIUM">Média</SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Onde no App?</Label>
                            <Input
                                placeholder="Ex: Financeiro > Relatórios"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                className="bg-[#0a0a0a] border-white/10 text-white h-12 rounded-xl focus:border-gold/50"
                            />
                        </div>
                    </div>

                    <div className="p-4 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center justify-center gap-2 group hover:border-gold/30 transition-colors cursor-pointer relative overflow-hidden">
                        <div className="p-3 bg-white/5 rounded-full group-hover:bg-gold/10 transition-colors">
                            <Upload className="h-6 w-6 text-gray-400 group-hover:text-gold" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-300">Anexar imagem (opcional)</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Clique para selecionar</p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                        />
                        {attachment && (
                            <div className="mt-2 flex items-center gap-2 bg-gold/20 px-3 py-1 rounded-full border border-gold/30">
                                <ImageIcon className="h-3 w-3 text-gold" />
                                <span className="text-xs text-white font-bold truncate max-w-[200px]">{attachment.name}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-gold text-black font-bold h-12 px-8 rounded-xl gap-2 hover:scale-105 transition-all shadow-lg shadow-gold/20"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Enviar Sugestão
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
