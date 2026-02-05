import { AdminLayout } from "@/components/layout/admin-layout";
import { ExternalLink, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const AutomacaoWhatsApp = () => {
    const rsAutoUrl = "http://localhost:5007";

    return (
        <AdminLayout>
            <div className="space-y-6 pb-10 h-[calc(100vh-100px)]">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Workflow className="w-8 h-8 text-gold" />
                            <h1 className="text-3xl font-bold text-gold">RS Auto (Multi-Agent)</h1>
                        </div>
                        <Button
                            variant="outline"
                            className="border-gold/50 text-gold hover:bg-gold/10"
                            onClick={() => window.open(rsAutoUrl, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" /> Abrir em Nova Aba
                        </Button>
                    </div>
                </div>

                <div className="border border-gold/10 rounded-xl overflow-hidden bg-black-lighter h-full">
                    <iframe src={rsAutoUrl} className="w-full h-full border-none" title="RS Auto Dashboard" />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AutomacaoWhatsApp;
