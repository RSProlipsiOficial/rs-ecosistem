import React, { useRef, useState } from 'react';
import { UploadIcon } from './AIComponents';
import { siteBuilderApi } from '../services/siteBuilderApi';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  extraButtons?: React.ReactNode;
}

const MAX_FILE_BYTES = 1_500_000;

const ImageInput: React.FC<ImageInputProps> = ({ label, value, onChange, hint, extraButtons }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Falha ao processar a imagem selecionada.'));
      image.src = src;
    });

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Falha ao ler a imagem selecionada.'));
      reader.readAsDataURL(file);
    });

  const renderCompressedBlob = (image: HTMLImageElement, maxDimension: number, quality: number) =>
    new Promise<Blob | null>((resolve) => {
      const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const targetWidth = Math.max(1, Math.round(image.width * ratio));
      const targetHeight = Math.max(1, Math.round(image.height * ratio));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(null);
        return;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        blob => resolve(blob),
        'image/webp',
        quality
      );
    });

  const optimizeImage = async (file: File): Promise<File> => {
    if (file.type === 'image/gif') {
      return file;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);
    const candidates = [
      { maxDimension: 1400, quality: 0.82 },
      { maxDimension: 1080, quality: 0.76 },
      { maxDimension: 860, quality: 0.68 },
      { maxDimension: 720, quality: 0.6 },
      { maxDimension: 560, quality: 0.54 },
    ];

    for (const candidate of candidates) {
      const blob = await renderCompressedBlob(image, candidate.maxDimension, candidate.quality);
      if (blob && blob.size <= MAX_FILE_BYTES) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'imagem'}.webp`, {
          type: 'image/webp',
        });
      }
    }

    const fallbackBlob = await renderCompressedBlob(image, 480, 0.48);
    if (fallbackBlob) {
      return new File([fallbackBlob], `${file.name.replace(/\.[^.]+$/, '') || 'imagem'}.webp`, {
        type: 'image/webp',
      });
    }

    return file;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsProcessing(true);

    try {
      const optimizedFile = await optimizeImage(file);
      const result = await siteBuilderApi.uploadImage(optimizedFile);

      if (!result.success || !result.url) {
        throw new Error(String(result.error || 'Falha ao enviar a imagem.'));
      }

      onChange(result.url);
    } catch (error) {
      console.error('[ImageInput] Upload failed:', error);
      alert('Nao foi possivel enviar essa imagem. Tente outra imagem menor ou em JPG/PNG/WebP.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          placeholder="Cole a URL da imagem ou envie um arquivo"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
        />
        {extraButtons}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isProcessing}
          className="flex-shrink-0 bg-accent text-button-text font-semibold py-2 px-4 rounded-md hover:opacity-80 transition-opacity whitespace-nowrap flex items-center space-x-2 disabled:opacity-60"
        >
          <UploadIcon />
          <span>{isProcessing ? 'Enviando...' : 'Upload'}</span>
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
