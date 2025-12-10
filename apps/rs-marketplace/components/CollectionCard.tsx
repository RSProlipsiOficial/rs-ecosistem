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
            className="relative aspect-video sm:aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer border-2 border-transparent hover:border-[rgb(var(--color-brand-gold))] focus-within:border-[rgb(var(--color-brand-gold))] transition-all duration-300 shadow-lg"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onClick()}
        >
            <img
                src={collection.imageUrl}
                alt={collection.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold font-display text-white transition-colors duration-300 group-hover:text-[rgb(var(--color-brand-gold))]">{collection.title}</h3>
                <p className="text-sm text-[rgb(var(--color-brand-text-dim))] mt-1 line-clamp-2">{collection.description}</p>
            </div>
        </div>
    );
}

export default CollectionCard;
