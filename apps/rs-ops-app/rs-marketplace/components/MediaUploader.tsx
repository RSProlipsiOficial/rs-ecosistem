import React, { useState, useRef, DragEvent } from 'react';
import { PhotoIcon } from './icons/PhotoIcon';
import { CloseIcon } from './icons/CloseIcon';

interface MediaUploaderProps {
    currentMedia: { url: string; type: 'image' | 'video' } | null;
    onMediaUpload: (url: string, type: 'image' | 'video', file: File) => void;
    onMediaRemove: () => void;
    placeholderText: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ currentMedia, onMediaUpload, onMediaRemove, placeholderText }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('video') ? 'video' : 'image';
            onMediaUpload(url, type, file);
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
    
    const removeMedia = () => {
        if(currentMedia?.url.startsWith('blob:')){
            URL.revokeObjectURL(currentMedia.url);
        }
        onMediaRemove();
    }

    if (currentMedia) {
        return (
            <div className="relative group aspect-square">
                {currentMedia.type === 'image' ? (
                     <img src={currentMedia.url} alt="Preview" className="w-full h-full object-cover rounded-md" />
                ) : (
                    <video src={currentMedia.url} controls className="w-full h-full object-cover rounded-md bg-black"></video>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={removeMedia} className="bg-red-600 text-white rounded-full p-2">
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
            className={`border-2 border-dashed border-dark-700 rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center aspect-square ${isDragging ? 'border-gold-500 bg-dark-800/50' : 'hover:border-dark-700'}`}
        >
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} accept="image/*,video/*" className="hidden" />
            <PhotoIcon className="w-8 h-8 text-gray-500 mb-2"/>
            <p className="text-gray-400 text-sm">{placeholderText}</p>
        </div>
    );
};