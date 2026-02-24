
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-sm text-gray-300 text-center sm:text-left">
                    <p>
                        Utilizamos cookies para melhorar sua experiência na plataforma. Ao continuar navegando,
                        você concorda com nossa{" "}
                        <Link to="/politica-privacidade" className="text-white underline hover:text-blue-400">
                            Política de Privacidade
                        </Link>{" "}
                        e{" "}
                        <Link to="/termos-de-uso" className="text-white underline hover:text-blue-400">
                            Termos de Uso
                        </Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-white sm:hidden"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button onClick={acceptCookies} className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
                        Aceitar e Continuar
                    </Button>
                </div>
            </div>
        </div>
    );
}
