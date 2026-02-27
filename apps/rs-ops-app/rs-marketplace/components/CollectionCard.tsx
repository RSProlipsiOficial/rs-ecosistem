import React from 'react';
import { Collection } from '../types';

interface CollectionCardProps {
    collection: Collection;
    onClick: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-[rgb(var(--color-brand-gold))]/[0.1] hover:border-[rgb(var(--color-brand-gold))] transition-all duration-300 shadow-lg"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onClick()}
        >
            <img
                src={collection.imageUrl}
                alt={collection.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg md:text-xl font-bold font-display text-white transition-colors duration-300 group-hover:text-[rgb(var(--color-brand-gold))] uppercase tracking-tight">{collection.title}</h3>
                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">{collection.description}</p>
            </div>
        </div>
    );
}

export default CollectionCard;
