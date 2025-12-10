

import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';
import ImageInput from './ImageInput'; // Kept for admin panel, not directly by EditableImage

interface EditableImageProps {
  contentKey: string;
  className?: string;
  alt: string;
}

const EditableImage: React.FC<EditableImageProps> = ({ contentKey, className, alt }) => {
  const { isAdmin, setEditMode, setActiveAdminTab } = useAdmin();
  const { t } = useLanguage();

  const imageUrl = t(contentKey);
  
  // When in edit mode, clicking the image itself or the pencil should trigger the PageEditor for that section.
  // This EditableImage will no longer have its own modal for editing image URLs.
  const handleEditClick = () => {
    setEditMode(true);
    setActiveAdminTab('pages'); // Navigate to the Pages tab in the Admin Panel
    // In a future iteration, this would ideally also open the specific container editor.
    // For now, it just takes them to the general Pages tab.
  };

  const imageElement = <img src={imageUrl} alt={alt} className={className} />;

  if (!isAdmin) {
    return imageElement;
  }

  return (
    <>
      <div className="editable-wrapper group relative" style={{ display: 'inline-block' }}>
        {imageElement}
        <button 
          onClick={handleEditClick}
          className="absolute top-2 right-2 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30"
          aria-label={`Edit ${contentKey}`}
          >
          <PencilIcon />
        </button>
        <style>{`
          .editable-wrapper:hover {
            outline: 2px dashed var(--color-accent);
          }
        `}</style>
      </div>
    </>
  );
};

const PencilIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

export default EditableImage;