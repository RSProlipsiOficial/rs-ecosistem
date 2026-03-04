import React, { useRef, useState } from 'react';

interface VideoUploaderProps {
    currentVideo: string;
    onVideoChange: (url: string) => void;
    placeholderText?: string;
    maxSizeMB?: number;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
    currentVideo,
    onVideoChange,
    placeholderText = 'Vídeo de Fundo',
    maxSizeMB = 50,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sizeWarning, setSizeWarning] = useState('');

    const handleFileSelect = (files: FileList | null) => {
        if (!files || !files[0]) return;
        const file = files[0];

        // Size check
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            setSizeWarning(`Arquivo muito grande (${sizeMB.toFixed(1)}MB). Máximo: ${maxSizeMB}MB.`);
            return;
        }
        setSizeWarning('');
        setIsLoading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            onVideoChange(reader.result as string);
            setIsLoading(false);
        };
        reader.onerror = () => {
            setSizeWarning('Erro ao ler o arquivo. Tente novamente.');
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    if (currentVideo) {
        return (
            <div className="mt-2 rounded-lg overflow-hidden border border-[rgb(var(--color-brand-gray-light))] relative group">
                <video
                    src={currentVideo}
                    className="w-full aspect-video object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                />
                {/* Hover overlay with remove button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <span className="text-white text-xs font-semibold">🎬 Vídeo de Fundo</span>
                    <button
                        onClick={() => onVideoChange('')}
                        className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-500 transition-colors"
                    >
                        ✕ Remover vídeo
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[rgb(var(--color-brand-gray))] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[rgb(var(--color-brand-gray-light))] transition-colors"
                    >
                        🔄 Trocar vídeo
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <div className="mt-2">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center aspect-video ${isDragging
                        ? 'border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/[.10]'
                        : 'border-[rgb(var(--color-brand-gray-light))] hover:border-[rgb(var(--color-brand-gold))]/60'
                    }`}
            >
                {isLoading ? (
                    <>
                        <span className="text-2xl mb-2 animate-pulse">🎬</span>
                        <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Carregando vídeo...</p>
                    </>
                ) : (
                    <>
                        <span className="text-3xl mb-2">🎬</span>
                        <p className="text-sm font-semibold text-[rgb(var(--color-brand-text-dim))]">{placeholderText}</p>
                        <p className="text-[10px] text-[rgb(var(--color-brand-text-dim))]/70 mt-1">
                            Clique ou arraste um arquivo MP4/WebM<br />
                            Máximo {maxSizeMB}MB · Ideal: 30s–1min
                        </p>
                    </>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                />
            </div>
            {sizeWarning && (
                <p className="text-xs text-red-400 mt-1">{sizeWarning}</p>
            )}
            <p className="text-[10px] text-[rgb(var(--color-brand-text-dim))]/60 mt-1">
                O vídeo fica em loop, mudo e automático no fundo da loja (substitui a imagem).
            </p>
        </div>
    );
};

export default VideoUploader;
