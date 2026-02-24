import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, User, Bus, UserCheck, Loader2, MessageCircle } from "lucide-react";

interface Contact {
    role: 'dono' | 'motorista' | 'monitora';
    name: string;
    phone: string;
}

interface ContactSelectionModalProps {
    open: boolean;
    onClose: () => void;
    contacts: Contact[];
    loading?: boolean;
    whatsappGroupLink?: string;
}

export function ContactSelectionModal({ open, onClose, contacts, loading, whatsappGroupLink }: ContactSelectionModalProps) {
    const handleCall = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, "");
        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-black-primary border-gold/20 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-gold italic uppercase text-xl">
                        <Phone className="w-5 h-5" /> Falar com Transporte
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 pt-4">
                    {loading ? (
                        <div className="flex flex-col items-center py-10 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-gold" />
                            <p className="text-sm opacity-50">Buscando contatos...</p>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhum contato encontrado para esta van.
                        </div>
                    ) : (
                        contacts.map((contact, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="w-full h-16 justify-start gap-4 border-white/10 bg-white/5 hover:bg-gold hover:text-black transition-all group"
                                onClick={() => handleCall(contact.phone)}
                            >
                                <div className="p-2 rounded-lg bg-black/40 text-gold group-hover:bg-white/20 group-hover:text-black">
                                    {contact.role === 'dono' && <User className="w-5 h-5" />}
                                    {contact.role === 'motorista' && <Bus className="w-5 h-5" />}
                                    {contact.role === 'monitora' && <UserCheck className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase opacity-50 leading-none mb-1">
                                        {contact.role === 'dono' ? 'Dono da Empresa' : contact.role.toUpperCase()}
                                    </p>
                                    <p className="font-bold">{contact.name}</p>
                                </div>
                            </Button>
                        ))
                    )}

                    {!loading && whatsappGroupLink && (
                        <Button
                            className="w-full h-16 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-[0_8px_16px_rgba(34,197,94,0.3)] mt-2"
                            onClick={() => window.open(whatsappGroupLink, '_blank')}
                        >
                            <MessageCircle className="w-6 h-6" />
                            Entrar no Grupo da Van
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
