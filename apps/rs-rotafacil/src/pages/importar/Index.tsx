import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, FileSpreadsheet, Users, DollarSign, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ImportarExportarPage = () => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState("");
  const [exportType, setExportType] = useState("");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          file.type === "application/vnd.ms-excel" || 
          file.name.endsWith('.csv')) {
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

  const handleImport = () => {
    if (!importFile || !importType) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um arquivo e o tipo de importação",
        variant: "destructive",
      });
      return;
    }

    // Simular processamento de importação
    toast({
      title: "Importação iniciada",
      description: `Processando ${importFile.name}...`,
    });

    // Aqui você implementaria a lógica real de importação
    setTimeout(() => {
      toast({
        title: "Importação concluída",
        description: `Dados de ${importType} importados com sucesso!`,
      });
    }, 2000);
  };

  const handleExport = () => {
    if (!exportType) {
      toast({
        title: "Tipo não selecionado",
        description: "Selecione o tipo de dados para exportar",
        variant: "destructive",
      });
      return;
    }

    // Simular geração de arquivo
    toast({
      title: "Exportação iniciada",
      description: `Gerando planilha de ${exportType}...`,
    });

    // Aqui você implementaria a lógica real de exportação
    setTimeout(() => {
      toast({
        title: "Exportação concluída",
        description: `Planilha de ${exportType} gerada com sucesso!`,
      });
    }, 1500);
  };

  const importTypes = [
    { value: "alunos", label: "Alunos", icon: Users },
    { value: "financeiro", label: "Dados Financeiros", icon: DollarSign },
    { value: "educacao", label: "Educação Financeira", icon: GraduationCap },
  ];

  const exportTypes = [
    { value: "alunos", label: "Lista de Alunos" },
    { value: "mensalidades", label: "Relatório de Mensalidades" },
    { value: "financeiro", label: "Relatório Financeiro" },
    { value: "presencas", label: "Relatório de Presenças" },
    { value: "manutencoes", label: "Histórico de Manutenções" },
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
                  Importe dados de planilhas Excel (.xlsx, .xls) ou arquivos CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="import-type">Tipo de Dados</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de dados para importar" />
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
                  <Label htmlFor="import-file">Arquivo de Planilha</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {importFile && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{importFile.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({(importFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Formato da Planilha
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Primeira linha deve conter os cabeçalhos das colunas</li>
                    <li>• Dados devem estar organizados em colunas</li>
                    <li>• Formatos aceitos: .xlsx, .xls, .csv</li>
                    <li>• Tamanho máximo: 10MB</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleImport} 
                  disabled={!importFile || !importType}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </Button>
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
                  Exporte dados do sistema em formato Excel para análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="export-type">Tipo de Relatório</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de relatório para exportar" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">Data Inicial (opcional)</Label>
                    <Input
                      id="date-from"
                      type="date"
                      placeholder="Data inicial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to">Data Final (opcional)</Label>
                    <Input
                      id="date-to"
                      type="date"
                      placeholder="Data final"
                    />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Relatórios Disponíveis
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• <strong>Lista de Alunos:</strong> Dados cadastrais e informações de contato</li>
                    <li>• <strong>Mensalidades:</strong> Status de pagamentos e valores</li>
                    <li>• <strong>Financeiro:</strong> Receitas, despesas e relatório geral</li>
                    <li>• <strong>Presenças:</strong> Histórico de presenças dos alunos</li>
                    <li>• <strong>Manutenções:</strong> Histórico de manutenções das vans</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleExport} 
                  disabled={!exportType}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Planilha
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