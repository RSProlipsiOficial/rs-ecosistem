
import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { useButtonStyle } from '../context/ButtonStyleContext';

interface EditableButtonProps {
  buttonKey: string;
  children: React.ReactElement;
}

const shadowClasses = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

const EditableButton: React.FC<EditableButtonProps> = ({ buttonKey, children }) => {
  const { isAdmin, openButtonStyleEditor } = useAdmin();
  const { getStyle } = useButtonStyle();
  const style = getStyle(buttonKey);

  const styleProps: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    borderColor: style.borderColor,
    borderWidth: `${style.borderWidth}px`,
    borderRadius: `${style.borderRadius}px`,
    boxShadow: shadowClasses[style.shadow] || 'none',
    textTransform: style.textTransform,
    fontWeight: style.fontWeight,
    padding: style.padding,
    borderStyle: 'solid',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    ...children.props.style,
  };

  if (style.backgroundColor && style.backgroundColor.includes('gradient')) {
      styleProps.backgroundImage = style.backgroundColor;
      styleProps.backgroundColor = 'transparent';
  } else {
      styleProps.backgroundImage = 'none';
  }

  const styledChild = React.cloneElement(children, {
    style: styleProps
  });

  if (!isAdmin) {
    return styledChild;
  }

  return (
    <span className="editable-wrapper group" style={{ position: 'relative', display: 'inline-block' }}>
      {styledChild}
      <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openButtonStyleEditor(buttonKey);
        }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30 hover:bg-blue-600"
        aria-label={`Style ${buttonKey}`}
      >
        <PaintBrushIcon />
      </button>
      <style>{`
        .editable-wrapper:hover {
          outline: 2px dashed var(--color-accent);
          outline-offset: 4px;
        }
      `}</style>
    </span>
  );
};

const PaintBrushIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

export default EditableButton;
