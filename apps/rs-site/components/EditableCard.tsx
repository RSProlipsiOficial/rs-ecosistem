
import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { useCardStyle } from '../context/CardStyleContext';

interface EditableCardProps {
  cardKey: string;
  children: React.ReactElement;
  className?: string;
}

const shadowClasses = {
  none: 'drop-shadow-none',
  sm: 'drop-shadow-sm',
  md: 'drop-shadow-md',
  lg: 'drop-shadow-lg',
  xl: 'drop-shadow-xl',
};

const hoverClasses = {
    none: '',
    lift: 'transition-transform duration-300 hover:-translate-y-2',
    glow: 'transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20',
};


const EditableCard: React.FC<EditableCardProps> = ({ cardKey, children, className }) => {
  const { isAdmin, openCardStyleEditor } = useAdmin();
  const { getStyle } = useCardStyle();
  const style = getStyle(cardKey);

  const styleProps: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderWidth: `${style.borderWidth}px`,
    borderRadius: `${style.borderRadius}px`,
    ...children.props.style,
  };

  if (style.backgroundColor && style.backgroundColor.includes('gradient')) {
      styleProps.backgroundImage = style.backgroundColor;
      styleProps.backgroundColor = 'transparent';
  } else {
      styleProps.backgroundImage = 'none';
  }

  const combinedClassName = [
      className,
      shadowClasses[style.shadow] || '',
      hoverClasses[style.hoverEffect] || '',
      'transition-all duration-300', // Base transition for smooth style changes
      children.props.className
  ].filter(Boolean).join(' ');


  const styledChild = React.cloneElement(children, {
    style: styleProps,
    className: combinedClassName,
  });

  if (!isAdmin) {
    return styledChild;
  }

  return (
    <div className="editable-wrapper group relative">
      {styledChild}
      <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openCardStyleEditor(cardKey);
        }}
        className="absolute top-2 right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30 hover:bg-purple-600"
        aria-label={`Style ${cardKey}`}
      >
        <PaintBrushIcon />
      </button>
      <style>{`
        .editable-wrapper:hover {
          outline: 2px dashed var(--color-accent);
          outline-offset: 4px;
        }
      `}</style>
    </div>
  );
};

const PaintBrushIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

export default EditableCard;
