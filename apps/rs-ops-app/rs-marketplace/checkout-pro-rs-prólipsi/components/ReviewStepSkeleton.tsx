
import React from 'react';
import { Skeleton } from './ui/Skeleton';
import { User, MapPin, Truck } from 'lucide-react';

export const ReviewStepSkeleton: React.FC = () => {
    return (
        <div className="bg-rs-card p-6 md:p-8 rounded-2xl border border-rs-border space-y-8 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-rs-border pb-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-48 h-6" />
                </div>
            </div>

            <div className="space-y-6">
                {/* Personal Data Skeleton */}
                <div className="p-4 bg-[#161920] rounded-lg border border-rs-border/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-rs-text uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-rs-gold" /> Dados Pessoais
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-3/4 h-4" />
                        <Skeleton className="w-1/2 h-4" />
                    </div>
                </div>

                {/* Shipping Address Skeleton */}
                <div className="p-4 bg-[#161920] rounded-lg border border-rs-border/50">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-rs-text uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-rs-gold" /> Endereço de Entrega
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-2/3 h-4" />
                    </div>
                </div>
                
                {/* Shipping Method Skeleton */}
                <div className="p-4 bg-[#161920] rounded-lg border border-rs-border/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-rs-text uppercase tracking-wider flex items-center gap-2">
                            <Truck className="w-4 h-4 text-rs-gold" /> Método de Envio
                        </h3>
                    </div>
                     <div className="space-y-3">
                        <Skeleton className="w-1/2 h-4" />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-rs-border/50">
                <Skeleton className="w-full h-14 rounded-xl" />
            </div>
        </div>
    );
};
