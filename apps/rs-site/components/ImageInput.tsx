
import React, { useRef } from 'react';
import { UploadIcon } from './AIComponents'; // Import UploadIcon

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  // New prop to optionally render external AI button(s) beside this input
  extraButtons?: React.ReactNode; 
}

const ImageInput: React.FC<ImageInputProps> = ({ label, value, onChange, hint, extraButtons }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-text-primary focus:ring-accent focus:border-accent"
          placeholder="Enter image URL or upload"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
        />
        {extraButtons} {/* Render external buttons here */}
        <button
          type="button"
          onClick={handleUploadClick}
          className="flex-shrink-0 bg-accent text-button-text font-semibold py-2 px-4 rounded-md hover:opacity-80 transition-opacity whitespace-nowrap flex items-center space-x-2"
        >
            <UploadIcon />
            <span>Upload</span>
        </button>
        {value && (
            <img 
                src={value} 
                alt="preview" 
                className="w-10 h-10 object-cover rounded-md flex-shrink-0 bg-gray-900"
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = 'block';
                }}
            />
        )}
      </div>
    </div>
  );
};

export default ImageInput;
