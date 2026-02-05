import { ReactNode } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TabItem {
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
}

interface MobileTabBarProps {
    tabs: TabItem[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const MobileTabBar = ({
    tabs,
    value,
    onChange,
    className = "",
}: MobileTabBarProps) => {
    return (
        <div
            className={cn(
                "sticky z-40 bg-black border-b border-gold/20",
                className
            )}
            style={{
                top: 'var(--mobile-header-height)',
            }}
        >
            <ScrollArea className="w-full">
                <div className="flex p-1 gap-1 min-h-mobile-tab">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => !tab.disabled && onChange(tab.value)}
                            disabled={tab.disabled}
                            className={cn(
                                "px-3 sm:px-4 h-10 flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-all flex-shrink-0",
                                "text-xs sm:text-sm font-bold uppercase tracking-wide",
                                value === tab.value
                                    ? "bg-gradient-gold text-black shadow-gold"
                                    : "text-muted-foreground hover:bg-gold/10 hover:text-gold",
                                tab.disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {tab.icon && (
                                <span className="w-4 h-4 flex items-center justify-center">
                                    {tab.icon}
                                </span>
                            )}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-1" />
            </ScrollArea>
        </div>
    );
};
