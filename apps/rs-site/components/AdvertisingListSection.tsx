


import React from 'react';
import { useAdvertisingContext } from '../context/AdvertisingContext';
import { Advertisement, ContentContainer } from '../types';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';

const AdCard: React.FC<{ ad: Advertisement }> = ({ ad }) => {
  const { isAdmin, isEditMode, setOpenAdminSection } = useAdmin();

  const handleEdit = () => {
    // @google/genai-linter-fix: Pass explicit undefined for optional containerId and fieldPath
    // FIX: Pass explicit undefined for optional containerId and fieldPath.
    setOpenAdminSection('pages', ad.id, undefined, undefined);
  };

  const cardContent = (
    <div className="bg-surface border border-border rounded-lg overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20 flex flex-col h-full">
      <div className="overflow-hidden aspect-video">
        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-accent mb-2">{ad.title}</h3>
        <div className="text-text-secondary leading-relaxed flex-grow prose-static" dangerouslySetInnerHTML={{ __html: ad.description }} />
      </div>
      <div className="p-6 pt-2">
        <a
          href={ad.ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-button-bg text-button-text font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:opacity-80"
        >
          {ad.ctaText}
        </a>
      </div>
    </div>
  );

  if (isAdmin && isEditMode) {
    return (
      <div className="relative group editable-wrapper h-full">
        {cardContent}
        <button
          onClick={handleEdit}
          className="absolute top-2 right-2 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label={`Edit ${ad.title}`}
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
         <style>{`.editable-wrapper:hover { outline: 2px dashed var(--color-accent); border-radius: 8px; }`}</style>
      </div>
    );
  }

  return cardContent;
};

interface AdvertisingListSectionProps {
  container: ContentContainer;
  // FIX: Update onEdit prop to accept a MouseEvent to match the onClick handler.
  onEdit: (e: React.MouseEvent) => void;
}

const AdvertisingListSection: React.FC<AdvertisingListSectionProps> = ({ container, onEdit }) => {
  const { advertisements } = useAdvertisingContext();
  const { isAdmin, isEditMode } = useAdmin();
  const { t } = useLanguage();
  
  const activeAds = advertisements.filter(ad => ad.isActive); // Filter active ads

  const sectionContent = (
    <div className="container mx-auto px-6 py-24 md:py-32">
      {activeAds.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeAds.map(ad => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg border border-border">
          <p className="text-text-secondary text-lg">{t('advertising_no_ads')}</p>
        </div>
      )}
    </div>
  );

  if (isAdmin && isEditMode) {
    return (
      <div className="relative group editable-section-wrapper">
        {sectionContent}
        <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-accent transition-all pointer-events-none"></div>
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
          aria-label="Edit Advertising List Section"
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return sectionContent;
}

export default AdvertisingListSection;