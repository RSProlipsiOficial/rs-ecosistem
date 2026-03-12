
import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';

interface EditableTextProps {
  pageId: string;
  containerId: string;
  fieldPath: string; // e.g., "title", "features.0.title"
  htmlContent: string;
  as?: React.ElementType;
  className?: string;
  onClick?: () => void;
}

const EditableText: React.FC<EditableTextProps> = ({ pageId, containerId, fieldPath, htmlContent, as: Component = 'span', className, onClick }) => {
  const { isAdmin, isEditMode, isPreviewEditor, setOpenAdminSection } = useAdmin();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenAdminSection('pages', pageId, containerId, fieldPath);
  };

  const handleContentClick = (event: React.MouseEvent) => {
    if (isAdmin && isEditMode && isPreviewEditor) {
      handleEdit(event);
      return;
    }

    onClick?.();
  };

  const content = (
    <Component
      className={[className, isAdmin && isEditMode && isPreviewEditor ? 'cursor-pointer' : ''].filter(Boolean).join(' ')}
      onClick={handleContentClick}
      dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
    />
  );

  if (isAdmin && isEditMode && htmlContent) {
    return (
      <div className="relative group/editabletext inline-block">
        {content}
        <button
          onClick={handleEdit}
          className={`absolute -top-1 -right-6 w-5 h-5 bg-yellow-500 text-black rounded-full flex items-center justify-center transition-opacity z-30 ${isPreviewEditor ? 'opacity-100' : 'opacity-0 group-hover/editabletext:opacity-100'}`}
          aria-label={`Edit ${fieldPath}`}
        >
          <PencilSquareIcon className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return content;
};

export default EditableText;
