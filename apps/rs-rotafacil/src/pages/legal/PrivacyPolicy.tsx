import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-8 sm:p-12">
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                    <div className="flex items-center gap-2 text-primary">
                        <ShieldCheck className="h-6 w-6" />
                        <span className="font-semibold">Privacidade e Dados</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
                <p className="text-gray-500 mb-8">Última atualização: 24 de Dezembro de 2024</p>

                <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
                    <p className="lead">
                        A sua privacidade é fundamental para nós. Esta política descreve como a RS RotaFácil coleta,
                        usa e protege suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                    </p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Dados Coletados</h2>
                        <p>Coletamos apenas as informações essenciais para a prestação do serviço:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Dados de Conta:</strong> Nome, email, telefone e dados da empresa.</li>
                            <li><strong>Dados Financeiros:</strong> Histórico de pagamentos (não armazenamos dados completos de cartão de crédito; estes são processados de forma segura pelo MercadoPago).</li>
                            <li><strong>Dados de Uso:</strong> Logs de acesso, interações com a plataforma e dados operacionais inseridos no sistema (rotas, alunos).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Uso das Informações</h2>
                        <p>Utilizamos seus dados para:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Fornecer e manter o serviço operacional.</li>
                            <li>Processar pagamentos e gerenciar assinaturas.</li>
                            <li>Enviar notificações importantes sobre sua conta.</li>
                            <li>Melhorar nossos recursos de Inteligência Artificial e roteirização.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Compartilhamento de Dados</h2>
                        <p>
                            Não vendemos seus dados para terceiros. Compartilhamos informações apenas com provedores de serviço
                            essenciais para a operação, como:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Supabase:</strong> Para hospedagem de banco de dados e autenticação segura.</li>
                            <li><strong>MercadoPago:</strong> Para processamento de pagamentos.</li>
                            <li><strong>OpenAI/OpenRouter:</strong> Para funcionalidades de IA (apenas dados anonimizados ou estritamente necessários para o prompt).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies e Tecnologias de Rastreamento</h2>
                        <p>
                            Utilizamos cookies essenciais para autenticação e segurança. Também podemos usar cookies analíticos
                            para entender como os usuários interagem com a plataforma e melhorar a experiência.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Seus Direitos (LGPD)</h2>
                        <p>Você tem direito a:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Confirmar a existência de tratamento de dados.</li>
                            <li>Acessar seus dados.</li>
                            <li>Corrigir dados incompletos ou desatualizados.</li>
                            <li>Solicitar a exclusão de seus dados (sujeito a obrigações legais de retenção).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Segurança</h2>
                        <p>
                            Implementamos medidas robustas de segurança, incluindo criptografia em trânsito e em repouso,
                            controles de acesso rigorosos (RLS) e monitoramento contínuo para proteger seus dados contra acesso não autorizado.
                        </p>
                    </section>

                    <div className="pt-8 border-t mt-8 text-sm text-gray-500">
                        <p>Para exercer seus direitos de privacidade, entre em contato através do email: suporte@rsrotafacil.com.br</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
