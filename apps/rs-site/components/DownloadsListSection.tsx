
import React, { useState } from 'react';
import DocumentViewerModal from './DocumentViewerModal';
import { useDownloadsContext } from '../context/DownloadsContext';
import { ContentContainer } from '../types';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import EditableText from './EditableText';

interface DownloadsListSectionProps {
  container: ContentContainer;
  // FIX: Changed onEdit prop to accept a MouseEvent to match the parent component's onClick handler.
  onEdit: (e: React.MouseEvent) => void;
  pageId: string;
}

const DownloadsListSection: React.FC<DownloadsListSectionProps> = ({ container, onEdit, pageId }) => {
  const { marketingPlanPages, productCatalogPages } = useDownloadsContext();
  const { isAdmin, isEditMode, setOpenAdminSection } = useAdmin();
  const [viewingDocument, setViewingDocument] = useState<{ title: string; pages: string[] } | null>(null);

  const pagesToDisplay = container.downloadType === 'marketingPlan' ? marketingPlanPages : productCatalogPages;
  const title = container.title || (container.downloadType === 'marketingPlan' ? 'Plano de Marketing' : 'Catálogo de Produtos');

  const handleOpenViewer = () => {
    if (pagesToDisplay && pagesToDisplay.length > 0) {
        setViewingDocument({ title, pages: pagesToDisplay });
    }
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
  };

  const sectionContent = (
    <div className="container mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center">
      <EditableText as="h2" className="text-2xl text-accent mb-8" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={title} />
      {pagesToDisplay && pagesToDisplay.length > 0 ? (
        <div
          className="relative w-full max-w-sm mx-auto aspect-[8.5/11] rounded-lg overflow-hidden shadow-2xl border-2 border-accent/30 group cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={handleOpenViewer}
          tabIndex={0}
          role="button"
          aria-label={`Ver ${title}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenViewer()}}
        >
          <img src={pagesToDisplay[0]} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div className="text-center text-white p-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
               <span className="text-xl font-bold">Ver Documento</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto aspect-[8.5/11] bg-surface border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          <p className="text-text-secondary">Nenhum documento disponível.</p>
        </div>
      )}
      {viewingDocument && (
        <DocumentViewerModal
          title={viewingDocument.title}
          pages={viewingDocument.pages}
          onClose={handleCloseViewer}
        />
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
          aria-label="Edit Downloads List Section"
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return sectionContent;
};

export default DownloadsListSection;