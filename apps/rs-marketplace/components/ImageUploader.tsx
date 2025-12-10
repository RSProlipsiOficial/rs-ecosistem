import React, { useState, useRef, DragEvent } from 'react';
import { PhotoIcon } from './icons/PhotoIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ImageUploaderProps {
    currentImage: string;
    onImageUpload: (url: string) => void;
    placeholderText: string;
    aspectRatio?: 'video' | 'square';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onImageUpload, placeholderText, aspectRatio = 'video' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

    const handleFileSelect = (files: FileList | null) => {
        if (files && files[0]) {
            const url = URL.createObjectURL(files[0]);
            onImageUpload(url);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const removeImage = () => {
        if(currentImage.startsWith('blob:')){
            URL.revokeObjectURL(currentImage);
        }
        onImageUpload('');
    }

    if (currentImage) {
        return (
            <div className={`relative group ${aspectClass}`}>
                <img src={currentImage} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={removeImage} className="bg-red-600 text-white rounded-full p-2">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-dark-700 rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${aspectClass} ${isDragging ? 'border-gold-500 bg-dark-800/50' : 'hover:border-dark-700'}`}
        >
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} accept="image/*" className="hidden" />
            <PhotoIcon className="w-8 h-8 text-gray-500 mb-2"/>
            <p className="text-gray-400 text-sm">{placeholderText}</p>
        </div>
    );
};