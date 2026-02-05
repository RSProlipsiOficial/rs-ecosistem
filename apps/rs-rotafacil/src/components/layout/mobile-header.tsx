import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileHeaderProps {
    title?: string;
    showBack?: boolean;
    showMenu?: boolean;
    actions?: ReactNode;
    className?: string;
    onMenuClick?: () => void;
}

export const MobileHeader = ({
    title,
    showBack = false,
    showMenu = false,
    actions,
    className = "",
    onMenuClick,
}: MobileHeaderProps) => {
    const navigate = useNavigate();

    return (
        <header
            className={`sticky top-0 z-50 bg-black border-b border-gold/20 backdrop-blur-sm ${className}`}
            style={{
                paddingTop: 'var(--safe-area-top)',
            }}
        >
            <div className="h-mobile-header px-4 flex items-center justify-between gap-3">
                {/* Left: Back or Menu */}
                <div className="flex items-center gap-2">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="h-10 w-10 flex-shrink-0"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    {showMenu && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onMenuClick}
                            className="h-10 w-10 flex-shrink-0"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Center: Title */}
                {title && (
                    <h1 className="text-base sm:text-lg font-bold text-gold truncate flex-1 text-center">
                        {title}
                    </h1>
                )}

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {actions}
                </div>
            </div>
        </header>
    );
};
