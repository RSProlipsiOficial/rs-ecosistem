import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsavelLayout } from "@/components/layout/responsavel-layout";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Baby, MapPin, Phone, School, FileText, ArrowRight } from "lucide-react";
import { AlunoForm } from "@/components/responsavel/AlunoForm";
import { ContactSelectionModal } from "@/components/responsavel/ContactSelectionModal";
import { ContractModal } from "@/components/public/ContractModal";
import { Aluno } from "@/types/alunos";
import { toast } from "@/hooks/use-toast";

interface Contact {
    role: 'dono' | 'motorista' | 'monitora';
    name: string;
    phone: string;
}

export default function MeusFilhos() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showContacts, setShowContacts] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [vanGroupLink, setVanGroupLink] = useState<string | null>(null);

    const [showContract, setShowContract] = useState(false);
    const [tenantData, setTenantData] = useState<any>(null);

    useEffect(() => {
        async function loadAlunos() {
            try {
                // Busca os alunos vinculados ao responsável atual via RPC segura
                const { data: students, error } = await supabase
                    .rpc('get_my_students' as any);

                if (error) {
                    console.error("Erro ao carregar alunos:", error);
                    return;
                }

                const studentsList = (students as any) || [];
                setAlunos(studentsList);

                // Lógica para abrir contatos automaticamente via query param
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('openContacts') === 'true' && studentsList.length > 0) {
                    // Abre o contato da van do primeiro filho (mais comum ter uma van só)
                    fetchContacts(studentsList[0].van_id);
                }

            } catch (error) {
                console.error("Erro::", error);
            } finally {
                setLoading(false);
            }
        }
        loadAlunos();
    }, []);

    const refreshAlunos = async () => {
        try {
            const { data: students, error } = await supabase
                .rpc('get_my_students' as any);
            if (!error) setAlunos((students as any) || []);
        } catch (error) {
            console.error("Erro ao atualizar lista:", error);
        }
    };

    const fetchContacts = async (vanId: string) => {
        if (!vanId) return;
        setLoadingContacts(true);
        setShowContacts(true);
        try {
            // 1. Logica de Contingência Frontend: Buscar dono e equipe vinculada
            // Tentamos o RPC primeiro
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_van_contacts' as any, {
                p_van_id: vanId
            });

            if (!rpcError && rpcData && (rpcData as any[]).length > 0) {
                setContacts((rpcData as any) || []);
                return;
            }

            // Se o RPC falhar ou retornar vazio, fazemos o fallback manual
            // a) Buscar dono da van
            const { data: van, error: vanError } = await supabase
                .from('vans')
                .select('user_id')
                .eq('id', vanId)
                .single();

            if (vanError) throw vanError;

            const ownerId = van.user_id;
            const contactsList: Contact[] = [];

            // b) Buscar perfis dos usuários vinculados a esta van (metadata van_id) ou ao dono (boss_id)
            // Como não podemos filtrar metadata diretamente no join de forma eficiente via JS client,
            // buscamos os perfis dos usuários que têm este user_id como boss_id ou que estão na van.
            // Para isso, precisamos de uma query mais ampla ou de dados já conhecidos.

            // BUSCA MANUAL DE FALLBACK (Melhorada)
            const { data: profiles, error: profilesError } = await supabase
                .from('user_profiles')
                .select('nome_completo, telefone, user_id');

            if (profilesError) throw profilesError;

            // Filtramos o dono
            const ownerProfile = profiles.find(p => p.user_id === ownerId);
            if (ownerProfile) {
                contactsList.push({
                    role: 'dono',
                    name: ownerProfile.nome_completo || 'Dono da Empresa',
                    phone: ownerProfile.telefone || ''
                });
            }

            // Aqui o ideal é o RPC, mas como medida de segurança, se o RPC estiver vazio,
            // mostramos ao menos o dono. No mundo real, o RPC deve ser corrigido no DB.
            setContacts(contactsList);

            // c) Buscar link do grupo de WhatsApp da van
            const { data: vanData } = await supabase
                .from('vans')
                .select('whatsapp_group_link')
                .eq('id', vanId)
                .maybeSingle();

            if (vanData?.whatsapp_group_link) {
                setVanGroupLink(vanData.whatsapp_group_link);
            } else {
                setVanGroupLink(null);
            }

        } catch (err) {
            console.error("Erro ao buscar contatos:", err);
            toast({
                title: "Aviso",
                description: "Não foi possível carregar todos os contatos da equipe no momento.",
                variant: "default"
            });
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleViewContract = (aluno: Aluno) => {
        setSelectedAluno(aluno);
        setShowContract(true);
    };

    return (
        <ResponsavelLayout>
            <div className="space-y-mobile-gap md:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase italic">Filhos</h1>
                    {alunos.length > 0 && (
                        <Button
                            variant="outline"
                            className="w-full md:w-auto h-11 border-gold/20 text-gold hover:bg-gold/10 font-bold uppercase text-[10px] tracking-widest"
                            onClick={() => fetchContacts(alunos[0].van_id)}
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Contato Transporte
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-muted-foreground">Carregando...</div>
                ) : alunos.length === 0 ? (
                    <Card className="bg-black-secondary border-dashed border-2 border-slate-700">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Baby className="h-12 w-12 text-slate-500 mb-4" />
                            <h3 className="text-xl font-medium text-white">Nenhum aluno vinculado</h3>
                            <p className="text-muted-foreground mt-2 text-center max-w-md">
                                Se você já realizou o cadastro, aguarde a aprovação ou entre em contato com o suporte para vincular seu filho.
                            </p>
                            <Button className="mt-6 bg-gold text-black hover:bg-yellow-500">
                                Entrar em Contato
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {alunos.map((aluno) => (
                            <Card key={aluno.id} className="bg-black-secondary border-gold/20 overflow-hidden group hover:border-gold/50 transition-all">
                                <CardHeader className="pb-2 p-mobile-padding-x md:p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-gold/20 shrink-0">
                                                <AvatarFallback className="bg-black-primary text-gold font-black">
                                                    {aluno.nome_completo.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <CardTitle className="text-lg text-white font-black leading-tight uppercase italic truncate">
                                                    {aluno.nome_completo}
                                                </CardTitle>
                                                <div className="flex items-center mt-1">
                                                    <Badge variant="secondary" className="bg-gold/10 text-gold text-[9px] font-black uppercase tracking-widest border border-gold/20">
                                                        {aluno.status || 'Ativo'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 p-mobile-padding-x md:p-6">
                                    <div className="space-y-2 text-xs md:text-sm text-gray-400 font-bold uppercase tracking-wide">
                                        <div className="flex items-center gap-2">
                                            <School className="w-3.5 h-3.5 text-gold/70 shrink-0" />
                                            <span className="truncate">{aluno.nome_colegio || 'Não informado'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-gold/70 shrink-0" />
                                            <span>{aluno.serie} • {aluno.turno}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full h-11 md:h-9 border-white/10 hover:bg-white/5 text-gray-300 font-black uppercase text-[10px] tracking-widest"
                                            onClick={() => handleViewContract(aluno)}
                                        >
                                            <FileText className="w-3.5 h-3.5 mr-2" />
                                            Contrato
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="w-full h-11 md:h-9 bg-gold text-black-primary hover:bg-gold/90 border-none font-black uppercase text-[10px] tracking-widest"
                                            onClick={() => {
                                                setSelectedAluno(aluno);
                                                setShowDetails(true);
                                            }}
                                        >
                                            Detalhes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modais */}
            <AlunoForm
                open={showDetails}
                onClose={() => setShowDetails(false)}
                aluno={selectedAluno}
                onSuccess={refreshAlunos}
            />

            <ContactSelectionModal
                open={showContacts}
                onClose={() => setShowContacts(false)}
                contacts={contacts}
                loading={loadingContacts}
                whatsappGroupLink={vanGroupLink || undefined}
            />
            {selectedAluno && (
                <ContractModal
                    open={showContract}
                    onClose={() => setShowContract(false)}
                    tenantId={selectedAluno.user_id}
                    alunoId={selectedAluno.id}
                    alunoData={{
                        nome_completo: selectedAluno.nome_completo,
                        nome_responsavel: selectedAluno.nome_responsavel,
                        cpf: selectedAluno.cpf || '',
                        endereco: `${selectedAluno.endereco_rua}, ${selectedAluno.endereco_numero} - ${selectedAluno.endereco_bairro}, ${selectedAluno.endereco_cidade}/${selectedAluno.endereco_estado}`,
                        valor_mensalidade: selectedAluno.valor_mensalidade,
                        dia_vencimento: selectedAluno.dia_vencimento || 10,
                        nome_colegio: selectedAluno.nome_colegio
                    }}
                    tenantData={tenantData || { nome: 'Transportador' }}
                />
            )}
        </ResponsavelLayout>
    );
}
