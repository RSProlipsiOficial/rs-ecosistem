import React from 'react';
import { Collection, View } from '../types';
import CollectionCard from './CollectionCard';

interface FeaturedCollectionsProps {
  collections: Collection[];
  onNavigate: (view: View, data: Collection) => void;
}

const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ collections, onNavigate }) => {
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <section id="featured-collections" className="py-16 sm:py-24 bg-[rgb(var(--color-brand-gray))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-[rgb(var(--color-brand-text-light))]">Explore Nossas Coleções</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[rgb(var(--color-brand-text-dim))]">
            Descubra seleções de produtos curadas para o seu estilo de vida.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <CollectionCard 
                key={collection.id} 
                collection={collection} 
                onClick={() => onNavigate('collectionView', collection)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
