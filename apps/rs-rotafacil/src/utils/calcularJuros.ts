// Função para calcular juros por atraso
export const calcularJuros = (
    valorOriginal: number,
    dataVencimento: string | undefined,
    diaVencimentoAluno: number | undefined,
    profile: any
) => {
    // Se não tem aluno ou dia de vencimento, usa a data_evento como fallback
    if (!diaVencimentoAluno && !dataVencimento) {
        return { diasAtraso: 0, multa: 0, juros: 0, valorTotal: valorOriginal };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let vencimento: Date;

    // Priorizar dia_vencimento do aluno
    if (diaVencimentoAluno) {
        const diaVenc = diaVencimentoAluno;
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // Criar data de vencimento do mês atual
        vencimento = new Date(anoAtual, mesAtual, diaVenc);
        vencimento.setHours(0, 0, 0, 0);

        // Se o vencimento ainda não chegou neste mês, usar o mês anterior
        if (vencimento > hoje) {
            vencimento = new Date(anoAtual, mesAtual - 1, diaVenc);
            vencimento.setHours(0, 0, 0, 0);
        }
    } else {
        // Fallback: usar data_evento
        vencimento = new Date(dataVencimento!);
        vencimento.setHours(0, 0, 0, 0);
    }

    const diffTime = hoje.getTime() - vencimento.getTime();
    const diasAtraso = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    if (diasAtraso <= 0) return { diasAtraso: 0, multa: 0, juros: 0, valorTotal: valorOriginal };

    let multa = 0;
    let juros = 0;
    const type = profile?.juros_tipo || 'valor';

    if (type === 'valor') {
        multa = Number(profile?.juros_valor_multa) || 10;
        const jurosDia = Number(profile?.juros_valor_dia) || 2;
        juros = diasAtraso * jurosDia;
    } else {
        const multaPerc = Number(profile?.juros_percentual_multa) || 2;
        const jurosMesPerc = Number(profile?.juros_percentual_mes) || 1;

        multa = (valorOriginal * multaPerc) / 100;
        const taxaDiaria = (jurosMesPerc / 30) / 100;
        juros = valorOriginal * taxaDiaria * diasAtraso;
    }

    const valorTotal = valorOriginal + multa + juros;

    return { diasAtraso, multa, juros, valorTotal };
};
