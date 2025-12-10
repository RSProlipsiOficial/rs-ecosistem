import React from 'react';
import { View } from '../types';

interface PlaceholderViewProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    onNavigate?: (view: View) => void;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, description, icon }) => {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-8 border border-[rgb(var(--color-brand-gray-light))]">
                    <div className="flex flex-col items-center text-center space-y-4">
                        {icon && <div className="text-[rgb(var(--color-brand-gold))]">{icon}</div>}
                        <h1 className="text-3xl font-bold text-[rgb(var(--color-brand-gold))]">{title}</h1>
                        <p className="text-[rgb(var(--color-brand-text-dim))] text-lg">{description}</p>
                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg max-w-md">
                            <p className="text-blue-400 text-sm">
                                ℹ️ Esta funcionalidade está em desenvolvimento e estará disponível em breve.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderView;
