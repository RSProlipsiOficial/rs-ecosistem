import { AdminLayout } from "@/components/layout/admin-layout";

export default function AdminUsuariosIndex() {
    return (
        <AdminLayout>
            <div className="p-10">
                <h1 className="text-2xl font-bold text-gold">DIAGNOSTIC MODE</h1>
                <p className="text-muted-foreground">Se você está vendo isso, o problema de auth foi resolvido e o erro está no conteúdo original do Index.tsx.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-gold text-black rounded"
                >
                    Recarregar
                </button>
            </div>
        </AdminLayout>
    );
}
