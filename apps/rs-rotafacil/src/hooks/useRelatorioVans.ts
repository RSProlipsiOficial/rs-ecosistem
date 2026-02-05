import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Van {
    id: string;
    nome: string;
    placa?: string;
}

export interface RelatorioVan {
    van: Van;
    receitaRealizada: number;
    receitaPrevista: number;
    despesasRealizadas: number;
    resultado: number;
    inadimplencia: number;
    totalAlunos: number;
    alunosAdimplentes: number;
    alunosInadimplentes: number;
}

export function useRelatorioVans(mes?: number, ano?: number) {
    const [relatorios, setRelatorios] = useState<RelatorioVan[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const mesAtual = mes || new Date().getMonth() + 1;
    const anoAtual = ano || new Date().getFullYear();
    const competenciaAtual = `${anoAtual}-${mesAtual.toString().padStart(2, '0')}`;

    const fetchRelatorios = async () => {
        try {
            setLoading(true);
            console.log('🚐 Buscando relatórios por van...');

            // 1. Buscar apenas vans ATIVAS e ÚNICAS
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: vans, error: vansError } = await supabase
                .from('vans')
                .select('id, nome, placa')
                .eq('user_id', user.id)
                .eq('ativo', true)
                .order('nome');

            if (vansError) {
                console.error('❌ Erro ao buscar vans:', vansError);
                throw vansError;
            }

            console.log('📊 Vans ativas encontradas:', vans);

            // Filtrar duplicatas por ID (caso existam)
            const vansUnicas = vans?.filter((van, index, self) =>
                index === self.findIndex(v => v.id === van.id)
            ) || [];

            console.log(`✅ Total de vans únicas: ${vansUnicas.length}`);

            if (vansUnicas.length === 0) {
                console.log('⚠️ Nenhuma van ativa cadastrada');
                setRelatorios([]);
                setLoading(false);
                return;
            }

            // 2. Buscar lançamentos da competência
            const { data: lancamentos, error: lancError } = await supabase
                .from('lancamentos_financeiros')
                .select('*')
                .eq('user_id', user.id)
                .eq('competencia', competenciaAtual);

            if (lancError) {
                console.error('❌ Erro ao buscar lançamentos:', lancError);
                throw lancError;
            }

            console.log(`💰 Total de lançamentos: ${lancamentos?.length || 0}`);
            console.log('💰 Lançamentos:', lancamentos);

            // 3. Para cada van ÚNICA ATIVA, calcular métricas
            const relatoriosPorVan: RelatorioVan[] = [];

            for (const van of vansUnicas) {
                try {
                    // Receitas da van (mensalidades)
                    const receitasVan = (lancamentos || []).filter(
                        l => l.tipo === 'receita' && l.van_id === van.id
                    );

                    const receitaRealizada = receitasVan
                        .filter(l => l.pagamento_status === 'pago')
                        .reduce((sum, l) => sum + Number(l.valor), 0);

                    const receitaPrevista = receitasVan
                        .filter(l => l.pagamento_status === 'pendente')
                        .reduce((sum, l) => sum + Number(l.valor), 0);

                    // Despesas da van
                    const despesasRealizadas = (lancamentos || [])
                        .filter(l => l.tipo === 'despesa' && l.van_id === van.id && l.pagamento_status === 'pago')
                        .reduce((sum, l) => sum + Number(l.valor), 0);

                    // Inadimplência (mensalidades atrasadas)
                    const dataAtual = new Date();
                    const inadimplencia = receitasVan
                        .filter(l => {
                            if (l.pagamento_status !== 'pendente') return false;
                            if (!l.data_evento) return false;
                            const dataEvento = new Date(l.data_evento);
                            return dataEvento < dataAtual;
                        })
                        .reduce((sum, l) => sum + Number(l.valor), 0);

                    // Contar alunos
                    const { count: totalAlunos } = await supabase
                        .from('alunos')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .eq('van_id', van.id)
                        .eq('ativo', true);

                    const alunosAdimplentes = receitasVan.filter(l => l.pagamento_status === 'pago').length;
                    const alunosInadimplentes = receitasVan.filter(l => {
                        if (l.pagamento_status !== 'pendente') return false;
                        if (!l.data_evento) return false;
                        const dataEvento = new Date(l.data_evento);
                        return dataEvento < dataAtual;
                    }).length;

                    const resultado = receitaRealizada - despesasRealizadas;

                    relatoriosPorVan.push({
                        van,
                        receitaRealizada,
                        receitaPrevista,
                        despesasRealizadas,
                        resultado,
                        inadimplencia,
                        totalAlunos: totalAlunos || 0,
                        alunosAdimplentes,
                        alunosInadimplentes
                    });

                    console.log(`✅ Van ${van.nome}: R$ ${resultado.toFixed(2)}`);
                } catch (error: any) {
                    console.error(`❌ Erro ao processar van ${van.nome}:`, error);
                    // Continuar mesmo com erro em uma van
                }
            }

            // Ordenar por resultado (maior para menor)
            relatoriosPorVan.sort((a, b) => b.resultado - a.resultado);

            console.log(`📈 Total de relatórios gerados: ${relatoriosPorVan.length}`);
            setRelatorios(relatoriosPorVan);

        } catch (error: any) {
            console.error('❌ Erro geral ao buscar relatórios:', error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível carregar os relatórios por van.",
                variant: "destructive"
            });
            setRelatorios([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRelatorios();
    }, [competenciaAtual]);

    // Função para exportar CSV
    const exportarCSV = () => {
        const headers = [
            'Van',
            'Receita Realizada',
            'Receita Prevista',
            'Despesas',
            'Resultado',
            'Inadimplência',
            'Total Alunos',
            'Adimplentes',
            'Inadimplentes'
        ];

        const rows = relatorios.map(r => [
            r.van.nome,
            r.receitaRealizada.toFixed(2),
            r.receitaPrevista.toFixed(2),
            r.despesasRealizadas.toFixed(2),
            r.resultado.toFixed(2),
            r.inadimplencia.toFixed(2),
            r.totalAlunos,
            r.alunosAdimplentes,
            r.alunosInadimplentes
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_vans_${competenciaAtual}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Exportado!",
            description: "Relatório exportado com sucesso.",
        });
    };

    return {
        relatorios,
        loading,
        refetch: fetchRelatorios,
        exportarCSV
    };
}
