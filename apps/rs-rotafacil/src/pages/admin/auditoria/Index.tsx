import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { badgeVariants } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminAuditoriaIndex() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error("Erro ao carregar logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-mobile-gap md:space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 md:h-8 md:h-8 text-primary" />
                        Auditoria do Sistema
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">Monitoramento de ações críticas realizadas por administradores</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-4">
                            <div className="relative flex-1 w-full md:max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar logs..." className="pl-8 w-full" />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        {loading ? (
                            <p>Carregando logs...</p>
                        ) : (
                            <div className="overflow-x-auto"> {/* Added overflow-x-auto for table scroll */}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Ação</TableHead>
                                            <TableHead>Admin</TableHead>
                                            <TableHead>Alvo</TableHead>
                                            <TableHead>Detalhes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString('pt-BR')}
                                                </TableCell>
                                                <TableCell className="font-semibold">{log.action}</TableCell>
                                                <TableCell className="text-xs">{log.admin_id?.substring(0, 8)}...</TableCell>
                                                <TableCell>{log.target_type}</TableCell>
                                                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                                                    {JSON.stringify(log.new_data)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {logs.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                                                    Nenhum log de auditoria encontrado.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
