
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Calendar as CalendarIcon, Download, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ListaHistoricaProps {
    alunos: any[];
}

export function ListaHistorica({ alunos }: ListaHistoricaProps) {
    const [mes, setMes] = useState(format(new Date(), 'yyyy-MM'));
    const [loading, setLoading] = useState(false);
    const [dadosHistoricos, setDadosHistoricos] = useState<any[]>([]);
    const [filtroNome, setFiltroNome] = useState('');

    const fetchHistorico = async () => {
        try {
            setLoading(true);
            const start = startOfMonth(new Date(mes + '-01'));
            const end = endOfMonth(new Date(mes + '-01'));

            const { data, error } = await supabase
                .from('lista_presenca')
                .select('*')
                .gte('data', format(start, 'yyyy-MM-dd'))
                .lte('data', format(end, 'yyyy-MM-dd'));

            if (error) throw error;

            // Processar dados para a tabela
            const consolidado = (alunos || []).map(aluno => {
                const presencasAluno = (data || []).filter(p => p.aluno_id === aluno.id);
                const presentes = presencasAluno.filter(p => p.status === 'presente').length;
                const ausentes = presencasAluno.filter(p => p.status === 'ausente').length;

                return {
                    ...aluno,
                    presentes,
                    ausentes,
                    totalMarcacoes: presencasAluno.length
                };
            });

            setDadosHistoricos(consolidado);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorico();
    }, [mes, alunos]);

    const alunosFiltrados = dadosHistoricos.filter(d =>
        d.nome_completo.toLowerCase().includes(filtroNome.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card className="bg-black/20 border-white/5 overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-sidebar-border/50 bg-black-secondary/30">
                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gold italic">
                        <CalendarIcon className="h-4 w-4 text-gold" />
                        Histórico Mensal
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5 bg-black/40">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3 space-y-2">
                            <Label htmlFor="mes-historico" className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Mês de Referência</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                                <Input
                                    id="mes-historico"
                                    type="month"
                                    value={mes}
                                    onChange={(e) => setMes(e.target.value)}
                                    className="h-10 bg-black-secondary border-gold/20 text-gold text-xs focus:border-gold/50 transition-all pl-9"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-6 space-y-2">
                            <Label htmlFor="busca-aluno" className="text-[10px] font-black uppercase tracking-tighter text-gold/90 ml-1 italic">Buscar Aluno</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/50" />
                                <Input
                                    id="busca-aluno"
                                    placeholder="Digite o nome do aluno..."
                                    value={filtroNome}
                                    onChange={(e) => setFiltroNome(e.target.value)}
                                    className="h-10 bg-black-secondary border-gold/20 text-gold placeholder:text-gold/20 text-xs focus:border-gold/50 transition-all pl-9"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <Button
                                onClick={fetchHistorico}
                                disabled={loading}
                                className="w-full h-10 gap-2 bg-gold hover:bg-gold/90 text-black font-black uppercase text-[10px] tracking-widest shadow-gold-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Atualizar
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow>
                                    <TableHead className="text-gold font-bold uppercase text-[10px]">Aluno</TableHead>
                                    <TableHead className="text-center text-gold font-bold uppercase text-[10px]">Colegio</TableHead>
                                    <TableHead className="text-center text-gold font-bold uppercase text-[10px]">Presentes</TableHead>
                                    <TableHead className="text-center text-gold font-bold uppercase text-[10px]">Ausentes</TableHead>
                                    <TableHead className="text-center text-gold font-bold uppercase text-[10px]">Aproveitamento</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gold" />
                                        </TableCell>
                                    </TableRow>
                                ) : alunosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-gray-500 uppercase font-bold text-xs">
                                            Nenhum dado encontrado para este mês.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    alunosFiltrados.map((d) => (
                                        <TableRow key={d.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-bold text-white uppercase text-xs truncate max-w-[150px]">
                                                {d.nome_completo}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-400 text-[10px] uppercase">
                                                {d.nome_colegio}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded text-xs">
                                                    {d.presentes}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded text-xs">
                                                    {d.ausentes}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center text-gray-300 font-mono text-xs">
                                                {d.totalMarcacoes > 0
                                                    ? Math.round((d.presentes / d.totalMarcacoes) * 100) + '%'
                                                    : '0%'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
