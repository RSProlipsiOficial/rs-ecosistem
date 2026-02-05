import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, FileSpreadsheet, Users, DollarSign, GraduationCap, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { formatToPascalCase } from "@/lib/utils";

const ImportarExportarPage = () => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState("");
  const [exportType, setExportType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')) {
        setImportFile(file);
        toast({
          title: "Arquivo selecionado",
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV",
          variant: "destructive",
        });
      }
    }
  };

  const downloadTemplate = (type: string) => {
    let headers: string[] = [];
    let sampleData: any[] = [];
    let fileName = "";

    if (type === "alunos") {
      headers = [
        "Nome Completo",
        "Nome do Responsável",
        "Telefone/WhatsApp (apenas números)",
        "Valor Mensalidade",
        "Dia Vencimento",
        "Nome da Van",
        "Turno (Manhã/Tarde)",
        "Escola",
        "CEP",
        "Endereço",
        "Número",
        "Bairro",
        "Cidade"
      ];
      sampleData = [
        ["João Silva", "Maria Silva", "11999999999", 350.00, 10, "Van 01", "Tarde", "Escola Estadual", "01234000", "Rua das Flores", "123", "Centro", "São Paulo"]
      ];
      fileName = "modelo_importacao_alunos.xlsx";
    } else if (type === "financeiro") {
      headers = [
        "Descrição",
        "Valor",
        "Data (DD/MM/AAAA)",
        "Tipo (Combustível, Manutenção, Outros)",
        "Status (Pago/Pendente)",
        "Observações"
      ];
      sampleData = [
        ["Abastecimento Posto X", 250.00, "25/12/2024", "Combustível", "Pago", "Tanque cheio"]
      ];
      fileName = "modelo_importacao_financeiro.xlsx";
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, fileName);
  };

  const processAlunos = async (data: any[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    // Buscar vans para mapear nomes
    const { data: existingVans } = await supabase.from('vans').select('id, nome').eq('user_id', user.id);
    const vanMap = new Map((existingVans || []).map(v => [v.nome.toLowerCase(), v.id]));

    // Função para obter ou criar van
    const getOrCreateVan = async (nomeVan: string) => {
      const normalized = String(nomeVan || '').trim();
      if (!normalized) return null;

      const lower = normalized.toLowerCase();
      // Tenta encontrar em ordem de precisão:
      // 1. Match exato (já normalizado)
      if (vanMap.has(lower)) return vanMap.get(lower);

      // 2. Procura se o nome da van da planilha está contido no nome da van do banco ou vice-versa
      for (const [vNome, vId] of vanMap.entries()) {
        if (lower.includes(vNome) || vNome.includes(lower)) {
          console.log(`Match flexível: ${normalized} -> ${vNome}`);
          return vId;
        }
      }

      // Criar nova van se não existir
      console.log(`Criando nova van: ${normalized}`);
      const { data: newVan, error } = await supabase
        .from('vans')
        .insert([{ user_id: user.id, nome: normalized, modelo: 'Padrão', placa: 'AAA-0000' }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar van automática:', error);
        return null;
      }

      vanMap.set(lower, newVan.id);
      return newVan.id;
    };

    // Criar uma van padrão se não houver nenhuma
    let defaultVanId = existingVans && existingVans.length > 0 ? existingVans[0].id : null;
    if (!defaultVanId) {
      defaultVanId = await getOrCreateVan('Van 01');
    }

    const batch: any[] = [];

    for (const row of data) {
      // Mapeamento flexível das colunas (tenta encontrar pelo nome ou índice)
      const findValue = (keys: string[], index: number) => {
        for (const key of keys) {
          if (row[key] !== undefined) return row[key];
        }
        // Tenta encontrar por case-insensitive search em todas as chaves
        const rowKeys = Object.keys(row);
        for (const k of rowKeys) {
          const lowerK = k.toLowerCase();
          if (keys.some(key => lowerK === key.toLowerCase() || lowerK.includes(key.toLowerCase()))) {
            return row[k];
          }
        }
        return row[index];
      };

      const nome = findValue(['Nome Completo', 'Nome', 'Aluno', 'Estudante'], 0);
      const responsavel = findValue(['Nome do Responsável', 'Responsável', 'Pai', 'Mãe'], 1);
      const whatsapp = findValue(['Telefone', 'WhatsApp', 'Celular', 'Contato'], 2);
      const valor = findValue(['Valor Mensalidade', 'Mensalidade', 'Valor', 'Preço'], 3);
      const diaVencimento = findValue(['Dia Vencimento', 'Vencimento', 'Dia', 'Cobranca'], 4);
      const vanNome = findValue(['Nome da Van', 'Van', 'Veículo', 'Motorista'], 5);
      const turno = findValue(['Turno', 'Período', 'Horário'], 6);
      const escola = findValue(['Escola', 'Colégio', 'Instituição'], 7);
      const cep = findValue(['CEP', 'Código Postal'], 8);
      const rua = findValue(['Endereço', 'Rua', 'Logradouro'], 9);
      const numero = findValue(['Número', 'Nº'], 10);
      const bairro = findValue(['Bairro'], 11);
      const cidade = findValue(['Cidade', 'Município'], 12);

      if (!nome) continue; // Pula linhas vazias

      // Tenta encontrar ou criar van pelo nome
      let vanId = defaultVanId;
      if (vanNome) {
        const id = await getOrCreateVan(vanNome);
        if (id) vanId = id;
      }

      const normalizeTurno = (t: string) => {
        const val = String(t || '').toLowerCase().trim();
        if (val.includes('manh')) return 'manha';
        if (val.includes('tard')) return 'tarde';
        if (val.includes('noit')) return 'noite';
        if (val.includes('integ')) return 'integral';
        return 'manha'; // Default
      };

      batch.push({
        user_id: user.id,
        nome_completo: formatToPascalCase(nome),
        nome_responsavel: formatToPascalCase(responsavel || nome), // Fallback
        whatsapp_responsavel: String(whatsapp || '').replace(/\D/g, ''),
        valor_mensalidade: Number(valor) || 0,
        dia_vencimento: Number(diaVencimento) || 10,
        van_id: vanId,
        turno: normalizeTurno(turno),
        nome_colegio: formatToPascalCase(escola || ''),
        endereco_cep: String(cep || ''),
        endereco_rua: formatToPascalCase(rua || ''),
        endereco_numero: String(numero || ''),
        endereco_bairro: formatToPascalCase(bairro || ''),
        endereco_cidade: formatToPascalCase(cidade || ''),
        endereco_estado: '',
        ativo: true,
        serie: '',
        tipo_residencia: 'casa'
      });
    }

    if (batch.length === 0) throw new Error("Nenhum dado válido encontrado na planilha.");

    const { error } = await supabase.from('alunos').insert(batch);
    if (error) throw error;
    return batch.length;
  };

  const processFinanceiro = async (data: any[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const batch: any[] = [];

    for (const row of data) {
      const descricao = row['Descrição'] || row['descricao'] || row[0];
      const valor = row['Valor'] || row['valor'] || row[1];
      const dataStr = row['Data (DD/MM/AAAA)'] || row['data'] || row[2];
      const tipo = row['Tipo (Combustível, Manutenção, Outros)'] || row['tipo'] || row[3];
      const status = row['Status (Pago/Pendente)'] || row['status'] || row[4];
      const obs = row['Observações'] || row['obs'] || row[5];

      if (!descricao) continue;

      // Conversão de data simples
      // Assumindo formato DD/MM/AAAA ou objeto Date do Excel
      let dataFinal = new Date().toISOString(); // Fallback hoje

      if (dataStr instanceof Date) {
        dataFinal = dataStr.toISOString();
      } else if (typeof dataStr === 'string' && dataStr.includes('/')) {
        const parts = dataStr.split('/');
        if (parts.length === 3) {
          // DD/MM/AAAA -> YYYY-MM-DD
          const dt = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(dt.getTime())) dataFinal = dt.toISOString();
        }
      }

      const competencia = dataFinal.substring(0, 7); // YYYY-MM format to match filter

      // Mapeamento de Categorias Válidas
      const categoriaRaw = String(tipo || '').toUpperCase();
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

      batch.push({
        user_id: user.id,
        descricao: descricao,
        valor: Number(valor) || 0,
        data_evento: dataFinal.split('T')[0], // YYYY-MM-DD
        pagamento_status: String(status).toLowerCase().includes('pago') ? 'pago' : 'pendente',
        tipo: 'despesa',
        categoria: categoriaValid,
        status: 'realizado',
        competencia: competencia,
        observacoes: obs || null,
        created_at: new Date().toISOString()
      });
    }

    if (batch.length === 0) throw new Error("Nenhum dado válido encontrado.");

    // Using 'any' cast to avoid strict type checks if table definition is missing in local types
    const { error } = await supabase.from('lancamentos_financeiros' as any).insert(batch);
    if (error) throw error;
    return batch.length;
  };

  const handleImport = async () => {
    if (!importFile || !importType) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um arquivo e o tipo de importação",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    toast({
      title: "Processando...",
      description: "Lendo arquivo e preparando importação.",
    });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let count = 0;
          if (importType === 'alunos') {
            count = await processAlunos(jsonData);
          } else if (importType === 'financeiro') {
            count = await processFinanceiro(jsonData);
          }

          toast({
            title: "Sucesso!",
            description: `${count} registros importados com sucesso!`,
            className: "bg-green-500 text-white"
          });
          setImportFile(null); // Reset file
        } catch (error: any) {
          console.error(error);
          toast({
            title: "Erro na Importação",
            description: error.message || "Verifique se a planilha segue o modelo padrão.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(importFile);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast({ title: "Erro", description: "Falha ao ler arquivo.", variant: "destructive" });
    }
  };

  const handleExport = async () => {
    if (!exportType) {
      toast({ title: "Erro", description: "Selecione o tipo de relatório", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    toast({ title: "Gerando relatório...", description: "Aguarde enquanto buscamos os dados." });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      let data: any[] = [];
      let fileName = `relatorio_${exportType}_${new Date().toISOString().split('T')[0]}.xlsx`;

      if (exportType === 'alunos') {
        const { data: alunos, error } = await supabase.from('alunos').select('*').eq('user_id', user.id);
        if (error) throw error;
        data = alunos || [];
      } else if (exportType === 'financeiro') {
        const { data: gastos, error } = await supabase.from('gastos').select('*').eq('user_id', user.id);
        if (error) throw error;
        data = gastos || [];
      } else if (exportType === 'mensalidades') {
        // Exemplo: buscar de tabela de mensalidades se existir, ou gerar dos alunos
        // Aqui vamos buscar recebimentos se houver tabela, ou apenas alunos com valor
        const { data: alunos } = await supabase.from('alunos').select('nome_completo, valor_mensalidade, dia_vencimento').eq('user_id', user.id);
        data = ((alunos as any[]) || []).map(a => ({
          Aluno: a.nome_completo,
          Valor: a.valor_mensalidade,
          Vencimento: a.dia_vencimento
        }));
      }

      if (data.length === 0) {
        toast({ title: "Aviso", description: "Nenhum dado encontrado para exportar." });
        setIsProcessing(false);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados");
      XLSX.writeFile(wb, fileName);

      toast({ title: "Sucesso!", description: "Download iniciado." });

    } catch (error: any) {
      console.error(error);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const importTypes = [
    { value: "alunos", label: "Alunos", icon: Users },
    { value: "financeiro", label: "Dados Financeiros (Gastos)", icon: DollarSign },
  ];

  const exportTypes = [
    { value: "alunos", label: "Lista de Alunos" },
    { value: "mensalidades", label: "Previsão de Mensalidades" },
    { value: "financeiro", label: "Relatório de Despesas" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Importar/Exportar Planilhas</h1>
          <p className="text-muted-foreground">
            Importe dados de planilhas Excel/CSV ou exporte relatórios do sistema
          </p>
        </div>

        <Tabs defaultValue="importar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="importar" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="exportar" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="importar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Dados
                </CardTitle>
                <CardDescription>
                  Siga os passos abaixo para importar seus dados corretamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Passo 1: Baixar Modelo */}
                <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-xs">1</span>
                    Baixe a Planilha Modelo
                  </div>
                  <p className="text-sm text-muted-foreground px-8">
                    Para que a importação funcione, você precisa seguir o nosso modelo padrão. Baixe a planilha vazia abaixo e preencha com seus dados.
                  </p>
                  <div className="flex gap-3 px-8">
                    <Button variant="outline" size="sm" onClick={() => downloadTemplate('alunos')} className="gap-2 border-blue-300 hover:bg-blue-100">
                      <Users className="h-4 w-4" /> Modelo Alunos
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadTemplate('financeiro')} className="gap-2 border-blue-300 hover:bg-blue-100">
                      <DollarSign className="h-4 w-4" /> Modelo Financeiro
                    </Button>
                  </div>
                </div>

                {/* Passo 2: Selecionar e Enviar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 text-xs">2</span>
                    Selecione o Arquivo e o Tipo
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 px-8">
                    <div className="space-y-2">
                      <Label htmlFor="import-type">Tipo de Dados</Label>
                      <Select value={importType} onValueChange={setImportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="O que você vai importar?" />
                        </SelectTrigger>
                        <SelectContent>
                          {importTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="import-file">Arquivo Preenchido</Label>
                      <Input
                        id="import-file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        className="bg-muted/30"
                      />
                    </div>
                  </div>

                  {importFile && (
                    <div className="px-8 flex flex-col gap-2">
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 rounded-md text-green-700">
                        <FileSpreadsheet className="h-5 w-5" />
                        <span className="font-medium">{importFile.name}</span>
                        <span className="text-xs opacity-70">({(importFile.size / 1024).toFixed(1)} KB)</span>
                        <CheckCircle className="h-4 w-4 ml-auto" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleImport}
                    disabled={!importFile || !importType || isProcessing}
                    className="w-full md:w-auto md:min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>Processando...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Iniciar Importação
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exportar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Relatórios
                </CardTitle>
                <CardDescription>
                  Exporte seus dados para backup ou análise em planilhas externas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="export-type">Tipo de Relatório</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o relatório desejado" />
                    </SelectTrigger>
                    <SelectContent>
                      {exportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg flex gap-3 text-yellow-800 dark:text-yellow-200 border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    O relatório será gerado no formato .xlsx (Excel) e conterá todos os dados disponíveis no sistema para o módulo selecionado.
                  </p>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={!exportType || isProcessing}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Relatório Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ImportarExportarPage;