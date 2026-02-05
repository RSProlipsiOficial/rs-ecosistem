import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfUse() {
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
                        <FileText className="h-6 w-6" />
                        <span className="font-semibold">Documento Legal</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
                <p className="text-gray-500 mb-8">Última atualização: 24 de Dezembro de 2024</p>

                <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e usar a plataforma RS RotaFácil ("Serviço"), você concorda em cumprir estes Termos de Uso.
                            Se você não concordar com algum destes termos, não deverá utilizar nosso serviço.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
                        <p>
                            A RS RotaFácil é uma plataforma SaaS (Software as a Service) destinada a gestão de transporte escolar,
                            controle financeiro, roteirização e comunicação via WhatsApp e Inteligência Artificial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cadastro e Conta</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
                            <li>As informações fornecidas no cadastro devem ser precisas e atualizadas.</li>
                            <li>É proibido o uso de contas automatizadas (bots) não autorizadas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Planos e Pagamentos</h2>
                        <p>
                            O serviço é oferecido em modalidades gratuita e paga. Os pagamentos são processados de forma segura
                            através do MercadoPago. Ao assinar um plano pago, você concorda com a cobrança recorrente (mensal ou anual)
                            conforme selecionado. O cancelamento pode ser feito a qualquer momento através do painel do usuário.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Uso Aceitável</h2>
                        <p>
                            Você concorda em não usar o serviço para:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Violar leis ou regulamentos aplicáveis.</li>
                            <li>Enviar spam ou mensagens não solicitadas em massa via integração de WhatsApp.</li>
                            <li>Tentar violar a segurança ou integridade do sistema.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Propriedade Intelectual</h2>
                        <p>
                            Todo o conteúdo, design, código e funcionalidades da plataforma são propriedade exclusiva da RS RotaFácil
                            ou de seus licenciadores e são protegidos por leis de direitos autorais.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitação de Responsabilidade</h2>
                        <p>
                            O serviço é fornecido "como está". A RS RotaFácil não se responsabiliza por danos indiretos,
                            perda de dados ou interrupções temporárias do serviço, embora nos esforcemos para manter 99.9% de uptime.
                        </p>
                    </section>

                    <div className="pt-8 border-t mt-8 text-sm text-gray-500">
                        <p>Dúvidas? Entre em contato com nosso suporte através do painel do usuário.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
