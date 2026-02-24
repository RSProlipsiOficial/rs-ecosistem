
import * as XLSX from 'xlsx';
import { LancamentoFinanceiro, CATEGORIAS_LABELS } from '@/types/financeiro';

export const exportFinanceiroToExcel = (data: LancamentoFinanceiro[], filename: string) => {
    const worksheetData = data.map(item => ({
        'Data': new Date(item.data_evento).toLocaleDateString('pt-BR'),
        'Descrição': item.descricao,
        'Categoria': CATEGORIAS_LABELS[item.categoria as keyof typeof CATEGORIAS_LABELS] || item.categoria,
        'Tipo': item.tipo === 'receita' ? 'Receita' : 'Despesa',
        'Valor': item.valor,
        'Alocação': item.alocacao === 'empresa' ? 'Empresa' : item.alocacao === 'dono' ? 'Pró-labore' : 'Misto',
        'Status': item.pagamento_status === 'pago' ? 'Pago' : 'Pendente',
        'Origem': item.origem,
        'Referência': item.referencia_id || '',
        'Observações': (item as any).observacoes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financeiro');

    // Ajustar largura das colunas
    const maxWidths = [
        { wch: 12 }, // Data
        { wch: 40 }, // Descrição
        { wch: 20 }, // Categoria
        { wch: 10 }, // Tipo
        { wch: 15 }, // Valor
        { wch: 15 }, // Alocação
        { wch: 10 }, // Status
        { wch: 15 }, // Origem
        { wch: 20 }, // Referência
        { wch: 40 }, // Observações
    ];
    worksheet['!cols'] = maxWidths;

    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportContadorReport = (data: LancamentoFinanceiro[], mes: string) => {
    // Separar receitas e despesas
    const receitas = data.filter(i => i.tipo === 'receita');
    const despesas = data.filter(i => i.tipo === 'despesa');

    const workbook = XLSX.utils.book_new();

    // Aba de Receitas
    const receitasSheet = XLSX.utils.json_to_sheet(receitas.map(i => ({
        'Data': new Date(i.data_evento).toLocaleDateString('pt-BR'),
        'Descrição': i.descricao,
        'Valor': i.valor,
        'Status': i.pagamento_status.toUpperCase()
    })));
    XLSX.utils.book_append_sheet(workbook, receitasSheet, 'Receitas');

    // Aba de Despesas (Empresa)
    const despesasEmpresa = despesas.filter(i => i.alocacao !== 'dono');
    const despesasEmpresaSheet = XLSX.utils.json_to_sheet(despesasEmpresa.map(i => ({
        'Data': new Date(i.data_evento).toLocaleDateString('pt-BR'),
        'Descrição': i.descricao,
        'Categoria': CATEGORIAS_LABELS[i.categoria as keyof typeof CATEGORIAS_LABELS] || i.categoria,
        'Valor': i.valor,
        'Status': i.pagamento_status.toUpperCase()
    })));
    XLSX.utils.book_append_sheet(workbook, despesasEmpresaSheet, 'Despesas Empresa');

    // Aba de Pró-labore (Dono)
    const retiradasDono = despesas.filter(i => i.alocacao === 'dono');
    const retiradasDonoSheet = XLSX.utils.json_to_sheet(retiradasDono.map(i => ({
        'Data': new Date(i.data_evento).toLocaleDateString('pt-BR'),
        'Descrição': i.descricao,
        'Valor': i.valor,
        'Status': i.pagamento_status.toUpperCase()
    })));
    XLSX.utils.book_append_sheet(workbook, retiradasDonoSheet, 'Pró-labore');

    XLSX.writeFile(workbook, `Relatorio_Contabilidade_RS_${mes.replace('/', '_')}.xlsx`);
};
