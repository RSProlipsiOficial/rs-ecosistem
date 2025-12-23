import React, { useRef, useState, useEffect } from 'react';
import { AdFormat, TextLayer } from '../types';

interface EditorCanvasProps {
  format: AdFormat;
  backgroundImage: string | null;
  layers: TextLayer[];
  selectedLayerId: string | null;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onSelectLayer: (id: string | null) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  backgroundColor: string;
}

interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  format,
  backgroundImage,
  layers,
  selectedLayerId,
  onUpdateLayer,
  onSelectLayer,
  canvasRef,
  backgroundColor
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const dragDimensions = useRef<{ width: number; height: number } | null>(null);

  // Auto-fit canvas to container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const xRatio = (clientWidth - 48) / format.width; // 48px padding
        const yRatio = (clientHeight - 48) / format.height;
        const newScale = Math.min(xRatio, yRatio, 1); // Never scale up past 1x for sharpness preview
        setScale(newScale);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [format]);

  const handleMouseDown = (e: React.MouseEvent, layer: TextLayer) => {
    e.stopPropagation();
    onSelectLayer(layer.id);
    setIsDragging(true);

    // Calculate offset from top-left of the element
    setDragOffset({
      x: e.clientX - layer.x * scale,
      y: e.clientY - layer.y * scale
    });

    // Measure element for snapping calculations
    const element = document.getElementById(layer.id);
    if (element) {
      dragDimensions.current = {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedLayerId) {
      let newX = (e.clientX - dragOffset.x) / scale;
      let newY = (e.clientY - dragOffset.y) / scale;

      // Snapping Logic
      const SNAP_THRESHOLD = 5;
      const guides: SnapGuide[] = [];

      if (dragDimensions.current) {
         const { width, height } = dragDimensions.current;
         
         const currentLeft = newX;
         const currentRight = newX + width;
         const currentCenterX = newX + width / 2;
         
         const currentTop = newY;
         const currentBottom = newY + height;
         const currentCenterY = newY + height / 2;

         let snappedX = false;
         let snappedY = false;

         // --- Vertical Snapping (X Axis) ---
         
         // 1. Canvas Center
         const canvasCenterX = format.width / 2;
         if (Math.abs(currentCenterX - canvasCenterX) < SNAP_THRESHOLD) {
             newX = canvasCenterX - width / 2;
             guides.push({ type: 'vertical', position: canvasCenterX });
             snappedX = true;
         }
         
         // 2. Canvas Edges (Left/Right)
         if (!snappedX) {
            if (Math.abs(currentLeft) < SNAP_THRESHOLD) {
                newX = 0;
                guides.push({ type: 'vertical', position: 0 });
                snappedX = true;
            } else if (Math.abs(currentRight - format.width) < SNAP_THRESHOLD) {
                newX = format.width - width;
                guides.push({ type: 'vertical', position: format.width });
                snappedX = true;
            }
         }

         // 3. Other Layers (Center/Edges)
         if (!snappedX) {
            for (const other of layers) {
                if (other.id === selectedLayerId) continue;
                const otherEl = document.getElementById(other.id);
                if (!otherEl) continue;
                
                const otherW = otherEl.offsetWidth;
                const otherL = other.x;
                const otherR = other.x + otherW;
                const otherCX = other.x + otherW / 2;

                if (Math.abs(currentCenterX - otherCX) < SNAP_THRESHOLD) {
                    newX = otherCX - width / 2;
                    guides.push({ type: 'vertical', position: otherCX });
                    snappedX = true;
                    break;
                } else if (Math.abs(currentLeft - otherL) < SNAP_THRESHOLD) {
                    newX = otherL;
                    guides.push({ type: 'vertical', position: otherL });
                    snappedX = true;
                    break;
                } else if (Math.abs(currentRight - otherR) < SNAP_THRESHOLD) {
                    newX = otherR - width;
                    guides.push({ type: 'vertical', position: otherR });
                    snappedX = true;
                    break;
                }
            }
         }

         // --- Horizontal Snapping (Y Axis) ---

         // 1. Canvas Center
         const canvasCenterY = format.height / 2;
         if (Math.abs(currentCenterY - canvasCenterY) < SNAP_THRESHOLD) {
             newY = canvasCenterY - height / 2;
             guides.push({ type: 'horizontal', position: canvasCenterY });
             snappedY = true;
         }

         // 2. Canvas Edges (Top/Bottom)
         if (!snappedY) {
             if (Math.abs(currentTop) < SNAP_THRESHOLD) {
                 newY = 0;
                 guides.push({ type: 'horizontal', position: 0 });
                 snappedY = true;
             } else if (Math.abs(currentBottom - format.height) < SNAP_THRESHOLD) {
                 newY = format.height - height;
                 guides.push({ type: 'horizontal', position: format.height });
                 snappedY = true;
             }
         }

         // 3. Other Layers (Center/Edges)
         if (!snappedY) {
             for (const other of layers) {
                 if (other.id === selectedLayerId) continue;
                 const otherEl = document.getElementById(other.id);
                 if (!otherEl) continue;

                 const otherH = otherEl.offsetHeight;
                 const otherT = other.y;
                 const otherB = other.y + otherH;
                 const otherCY = other.y + otherH / 2;

                 if (Math.abs(currentCenterY - otherCY) < SNAP_THRESHOLD) {
                     newY = otherCY - height / 2;
                     guides.push({ type: 'horizontal', position: otherCY });
                     snappedY = true;
                     break;
                 } else if (Math.abs(currentTop - otherT) < SNAP_THRESHOLD) {
                     newY = otherT;
                     guides.push({ type: 'horizontal', position: otherT });
                     snappedY = true;
                     break;
                 } else if (Math.abs(currentBottom - otherB) < SNAP_THRESHOLD) {
                     newY = otherB - height;
                     guides.push({ type: 'horizontal', position: otherB });
                     snappedY = true;
                     break;
                 }
             }
         }
      }

      setSnapGuides(guides);
      onUpdateLayer(selectedLayerId, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSnapGuides([]);
    dragDimensions.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-obsidian-900 flex items-center justify-center p-6 relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => onSelectLayer(null)}
    >
      <div 
        style={{ 
          width: format.width, 
          height: format.height,
          transform: `scale(${scale})`,
          boxShadow: '0 0 50px rgba(0,0,0,0.5)'
        }}
        className="relative bg-black transition-all duration-300 ease-out origin-center"
      >
        {/* Render for Export */}
        <div 
          ref={canvasRef} 
          className="w-full h-full relative overflow-hidden transition-colors duration-300"
          style={{ backgroundColor: backgroundColor }}
        >
          {backgroundImage && (
            <img 
              src={backgroundImage} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
          )}

          {/* Grid Overlay (Visual Guide) */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
               <div className="border-r border-b border-white"></div>
               <div className="border-r border-b border-white"></div>
               <div className="border-b border-white"></div>
               <div className="border-r border-b border-white"></div>
               <div className="border-r border-b border-white"></div>
               <div className="border-b border-white"></div>
               <div className="border-r border-white"></div>
               <div className="border-r border-white"></div>
               <div></div>
            </div>
          </div>

          {/* Snap Guides */}
          {snapGuides.map((guide, i) => (
             <div
                key={i}
                style={{
                  position: 'absolute',
                  backgroundColor: '#D4AF37', // Gold 400
                  zIndex: 50,
                  pointerEvents: 'none',
                  ...(guide.type === 'vertical' ? {
                     left: guide.position,
                     top: 0,
                     bottom: 0,
                     width: '1px',
                  } : {
                     top: guide.position,
                     left: 0,
                     right: 0,
                     height: '1px',
                  })
                }}
             />
          ))}

          {layers.map(layer => (
            <div
              key={layer.id}
              id={layer.id}
              style={{
                position: 'absolute',
                left: layer.x,
                top: layer.y,
                fontSize: `${layer.fontSize}px`,
                fontFamily: layer.fontFamily,
                fontWeight: layer.fontWeight,
                color: layer.color,
                textAlign: layer.align,
                cursor: 'move',
                textTransform: layer.uppercase ? 'uppercase' : 'none',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap',
                zIndex: 10,
                opacity: layer.opacity ?? 1,
                letterSpacing: `${layer.letterSpacing ?? 0}em`,
                textShadow: layer.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
                padding: layer.type === 'cta' ? '12px 24px' : '4px',
                backgroundColor: layer.type === 'cta' ? '#C5A059' : 'transparent',
                // Outline to show selection
                border: selectedLayerId === layer.id ? '2px solid #C5A059' : '2px solid transparent'
              }}
              onMouseDown={(e) => handleMouseDown(e, layer)}
              className="hover:border-white/20 transition-colors"
            >
              {layer.text}
            </div>
          ))}
        </div>
      </div>
      
      {/* Zoom Indicator */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-gold-500 text-xs px-2 py-1 rounded font-mono border border-white/10">
        {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default EditorCanvas;