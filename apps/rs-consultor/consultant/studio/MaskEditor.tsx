import React, { useRef, useEffect, useState, FC, MouseEvent, TouchEvent } from 'react';
import Modal from '../../components/Modal';
import { IconX } from '../../components/icons';

interface MaskEditorProps {
    imageUrl: string;
    onApply: (maskBase64: string) => void;
    onClose: () => void;
}

const MaskEditor: FC<MaskEditorProps> = ({ imageUrl, onApply, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [isErasing, setIsErasing] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        img.crossOrigin = "anonymous";
        img.src = imageUrl;

        const handleImageLoad = () => {
            if (canvas && ctx) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
            }
        };

        img.addEventListener('load', handleImageLoad);
        return () => img.removeEventListener('load', handleImageLoad);
    }, [imageUrl]);

    const getCoords = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) / (rect.width / canvas.width),
            y: (clientY - rect.top) / (rect.height / canvas.height)
        };
    };

    const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoords(e);

        ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        
        if(lastPos) {
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        setLastPos({ x, y });
    };

    const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        setLastPos(getCoords(e));
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setLastPos(null);
    };

    const handleApply = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a temporary canvas for the mask
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return;

        // Get original drawing
        const originalCtx = canvas.getContext('2d');
        if (!originalCtx) return;
        const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Process the image data to create a black and white mask
        for (let i = 0; i < data.length; i += 4) {
            // Check if pixel is part of the user's drawing (white) or erased (transparent)
            const isDrawn = data[i+3] > 0;
            if (isDrawn) {
                // If it's part of the drawing, make it white
                data[i] = 255;
                data[i+1] = 255;
                data[i+2] = 255;
            } else {
                // Otherwise, make it black
                data[i] = 0;
                data[i+1] = 0;
                data[i+2] = 0;
            }
            // Ensure full opacity for the mask
            data[i+3] = 255;
        }

        maskCtx.putImageData(imageData, 0, 0);
        const maskBase64 = maskCanvas.toDataURL('image/png').split(',')[1];
        onApply(maskBase64);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
             <div className="bg-brand-gray border border-brand-gray-light rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-brand-gray-light">
                    <h2 className="text-xl font-bold text-brand-gold">Criar Máscara</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-brand-gray-light"><IconX size={24} /></button>
                </header>
                <main className="flex-1 p-4 overflow-auto flex items-center justify-center">
                     <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full object-contain cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </main>
                <footer className="p-4 border-t border-brand-gray-light flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm">Pincel:</label>
                        <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-32 accent-brand-gold" />
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={isErasing} onChange={() => setIsErasing(!isErasing)} className="accent-brand-gold"/>
                            Borracha
                        </label>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="bg-brand-gray-light font-semibold px-6 py-2 rounded-lg hover:bg-brand-gray">Cancelar</button>
                        <button onClick={handleApply} className="bg-brand-gold text-brand-dark font-bold px-6 py-2 rounded-lg hover:bg-yellow-400">Aplicar Máscara</button>
                    </div>
                </footer>
             </div>
        </div>
    );
};

export default MaskEditor;
