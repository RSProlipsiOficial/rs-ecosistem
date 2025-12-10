

import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';
import IconPickerModal from './IconPickerModal'; // Kept for IconPickerModal

interface EditableIconProps {
  contentKey: string;
  className?: string;
  size?: string; // e.g., 'h-10 w-10'
}

const EditableIcon: React.FC<EditableIconProps> = ({ contentKey, size = 'h-6 w-6', className }) => {
  const { isAdmin, setEditMode, setActiveAdminTab } = useAdmin();
  const { t } = useLanguage();

  const svgPath = t(contentKey);

  // When in edit mode, clicking the icon or the pencil should trigger the PageEditor for that section.
  // This EditableIcon will no longer have its own modal for editing icons.
  const handleEditClick = () => {
    setEditMode(true);
    setActiveAdminTab('pages'); // Navigate to the Pages tab in the Admin Panel
    // In a future iteration, this would ideally also open the specific container editor.
    // For now, it just takes them to the general Pages tab.
  };
  
  const iconElement = (
      <div className={className}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={size}
          viewBox="0 0 24 24" 
          dangerouslySetInnerHTML={{ __html: svgPath }}
         />
      </div>
  );

  if (!isAdmin) {
    return iconElement;
  }

  return (
    <>
      <div className="editable-wrapper group relative" style={{ display: 'inline-block' }}>
        {iconElement}
        <button 
          onClick={handleEditClick}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-5 h-5 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30"
          aria-label={`Edit ${contentKey}`}
          >
          <PencilIcon />
        </button>
        <style>{`
          .editable-wrapper:hover {
            outline: 1px dashed var(--color-accent);
          }
        `}</style>
      </div>
    </>
  );
};

const PencilIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

export default EditableIcon;