import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';

interface ImportGastosModalProps {
    onSuccess: () => void;
}

export function ImportGastosModal({ onSuccess }: ImportGastosModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Map fields based on user request: 
            // A (Nome), B (Data), C (Valor), D (Status/Pago)
            // Trying to find columns by common names or index
            const mappedData = jsonData.map((row: any) => {
                // Find keys ignoring case
                const keys = Object.keys(row);
                const findKey = (search: string[]) => keys.find(k => search.some(s => k.toLowerCase().includes(s)));

                const nomeKey = findKey(['nome', 'gasto', 'descrição', 'descricao', 'item']);
                const dataKey = findKey(['data', 'dia', 'vencimento']);
                const valorKey = findKey(['valor', 'preço', 'total']);
                const statusKey = findKey(['status', 'pago', 'situação']);

                const rawDate = row[dataKey || ''] || new Date();
                let dataEvento = rawDate;

                // Handle Excel Serial Date
                if (typeof rawDate === 'number') {
                    dataEvento = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
                }

                const rawStatus = String(row[statusKey || '']).toLowerCase();
                const pagamentoStatus = rawStatus.includes('pago') || rawStatus === 'sim' || rawStatus === 'ok' ? 'pago' : 'pendente';

                return {
                    descricao: row[nomeKey || ''] || 'Despesa Importada',
                    data_evento: dataEvento instanceof Date ? dataEvento.toISOString().split('T')[0] : String(dataEvento),
                    valor: Number(String(row[valorKey || '']).replace('R$', '').replace('.', '').replace(',', '.')) || 0,
                    pagamento_status: pagamentoStatus,
                    status: 'ativo', // Record valid
                    tipo: 'despesa',
                    categoria: 'Geral' // Default category
                };
            });

            setPreviewData(mappedData.slice(0, 5)); // Show preview of 5 items
        } catch (error) {
            console.error("Erro ao ler arquivo:", error);
            toast({
                title: "Erro na Leitura",
                description: "Não foi possível ler o arquivo. Verifique se é um Excel válido.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const recordsToInsert = jsonData.map((row: any) => {
                const keys = Object.keys(row);
                const findKey = (search: string[]) => keys.find(k => search.some(s => k.toLowerCase().includes(s)));

                const nomeKey = findKey(['nome', 'gasto', 'descrição', 'descricao', 'item']);
                const dataKey = findKey(['data', 'dia', 'vencimento']);
                const valorKey = findKey(['valor', 'preço', 'total']);
                const statusKey = findKey(['status', 'pago', 'situação']);
                const categoriaKey = findKey(['categoria', 'tipo']);

                let rawDate = row[dataKey || ''];
                let dataEvento: Date;

                if (typeof rawDate === 'number') {
                    // Excel date
                    dataEvento = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
                } else if (typeof rawDate === 'string') {
                    // Try parsing string date (e.g., DD/MM/YYYY)
                    const parts = rawDate.split('/');
                    if (parts.length === 3) {
                        dataEvento = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    } else {
                        dataEvento = new Date(rawDate);
                    }
                } else {
                    dataEvento = new Date();
                }

                // Fallback for invalid date
                if (isNaN(dataEvento.getTime())) {
                    dataEvento = new Date();
                }

                const rawStatus = String(row[statusKey || '']).toLowerCase();
                const pagamentoStatus = rawStatus.includes('pago') || rawStatus === 'sim' || rawStatus === 'ok' ? 'pago' : 'pendente';

                // Derive competencia (YYYY-MM)
                const competencia = dataEvento.toISOString().substring(0, 7);

                // Clean value
                let valor = row[valorKey || ''];
                if (typeof valor === 'string') {
                    valor = Number(valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
                }

                // Mapeamento de Categorias
                const categoriaRaw = String(row[categoriaKey || ''] || 'Geral').toUpperCase();
                let categoriaValid = 'OUTROS';
                const mapCategoria = {
                    'COMBUSTIVEL': ['COMBUSTIVEL', 'GASOLINA', 'DIESEL', 'ABASTECIMENTO', 'ALCOOL'],
                    'MANUTENCAO': ['MANUTENCAO', 'MECANICO', 'OFICINA', 'REVISAO', 'PECA'],
                    'PNEUS': ['PNEU', 'PNEUS', 'BORRACHARIA'],
                    'MULTAS': ['MULTA', 'INFRACAO'],
                    'IMPOSTOS': ['IMPOSTO', 'IPVA', 'LICENCIAMENTO', 'TAXA'],
                    'SALARIOS_DIARIAS': ['SALARIO', 'DIARIA', 'MOTORISTA', 'AJUDANTE'],
                    'ADMIN': ['ADMIN', 'ADMINISTRATIVO', 'ESCRITORIO'],
                    'FIXO': ['FIXO', 'ALUGUEL', 'INTERNET'],
                    'VARIAVEL': ['VARIAVEL']
                };

                for (const [validInfo, keywords] of Object.entries(mapCategoria)) {
                    if (keywords.some(k => categoriaRaw.includes(k))) {
                        categoriaValid = validInfo;
                        break;
                    }
                }

                return {
                    user_id: user.id,
                    descricao: row[nomeKey || ''] || 'Despesa Importada',
                    data_evento: dataEvento.toISOString().split('T')[0],
                    valor: Number(valor) || 0,
                    pagamento_status: pagamentoStatus,
                    status: 'realizado',
                    tipo: 'despesa',
                    categoria: categoriaValid,
                    competencia: competencia
                };
            });

            const { error } = await supabase.from('lancamentos_financeiros' as any).insert(recordsToInsert);
            if (error) throw error;

            toast({
                title: "Importação Concluída",
                description: `${recordsToInsert.length} despesas importadas com sucesso!`,
            });
            setIsOpen(false);
            setFile(null);
            setPreviewData([]);
            onSuccess();
        } catch (error: any) {
            console.error("Erro na importação:", error);
            toast({
                title: "Erro ao Importar",
                description: error.message || "Ocorreu um erro ao salvar os dados.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { 'Nome do Gasto': 'Combustível', 'Data': '01/01/2025', 'Valor': 250.00, 'Status': 'Pago', 'Categoria': 'Transporte' },
            { 'Nome do Gasto': 'Manutenção', 'Data': '15/01/2025', 'Valor': 150.50, 'Status': 'Pendente', 'Categoria': 'Manutenção' },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Modelo Gastos");
        XLSX.writeFile(wb, "Modelo_Importacao_Gastos.xlsx");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-9 px-4 rounded-xl font-bold text-xs gap-2 border-dashed border-2">
                    <Upload className="w-4 h-4" /> Importar Gastos
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-green-500" />
                        Importar Despesas
                    </DialogTitle>
                    <DialogDescription>
                        Carregue sua planilha de gastos para alimentar o sistema automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                <p className="font-bold text-foreground">1. Baixe o modelo</p>
                                <p>Use nossa planilha padrão para garantir que (Nome, Data, Valor) sejam lidos corretamente.</p>
                            </div>
                            <Button onClick={downloadTemplate} size="sm" variant="outline" className="gap-2">
                                <Download className="w-4 h-4" /> Baixar Modelo
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-bold">2. Selecione o arquivo preenchido</p>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileSelect}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    {previewData.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-muted-foreground uppercase text-[10px]">Pré-visualização (5 itens)</p>
                            <div className="border rounded-lg overflow-hidden text-xs">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{row.descricao}</TableCell>
                                                <TableCell>{row.data_evento}</TableCell>
                                                <TableCell>R$ {row.valor?.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className={row.pagamento_status === 'pago' ? 'text-green-500 font-bold' : 'text-yellow-500'}>
                                                        {row.pagamento_status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Confirmar Importação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
