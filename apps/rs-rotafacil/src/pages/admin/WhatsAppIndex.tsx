import { AdminLayout } from "@/components/layout/admin-layout";

const AdminWhatsAppIndex = () => {
    // URL do Multi-Agente (RS Auto)
    const rsAutoUrl = "http://localhost:5007?view=simple";

    return (
        <AdminLayout>
            <div className="w-full h-[calc(100vh-140px)] bg-[#050505] overflow-hidden rounded-lg">
                <iframe
                    src={rsAutoUrl}
                    className="w-full h-full border-none"
                    title="RS Auto Multi-Agente"
                    allow="camera; microphone; clipboard-read; clipboard-write; display-capture"
                />
            </div>
        </AdminLayout>
    );
};

export default AdminWhatsAppIndex;
