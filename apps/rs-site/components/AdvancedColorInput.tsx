
import React, { useState, useEffect } from 'react';

function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function parseRgba(rgba: string): { r: number, g: number, b: number, a: number } | null {
    if (!rgba || typeof rgba !== 'string') return null;
    const match = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!match) return null;
    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

interface AdvancedColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

const AdvancedColorInput: React.FC<AdvancedColorInputProps> = ({ label, value, onChange, hint }) => {
    const isGradient = value && value.includes('gradient');
    
    const [solidColor, setSolidColor] = useState('#000000');
    const [alpha, setAlpha] = useState(1);

    useEffect(() => {
        if (!isGradient && value) {
            const parsed = parseRgba(value);
            if (parsed) {
                setSolidColor(rgbToHex(parsed.r, parsed.g, parsed.b));
                setAlpha(parsed.a);
            } else if (value.startsWith('#')) {
                setSolidColor(value);
                setAlpha(1);
            }
        } else if (!isGradient && !value) {
            // Default or clear state
            setSolidColor('#FFFFFF');
            setAlpha(1);
        }
    }, [value, isGradient]);

    const handleColorChange = (hex: string) => {
        setSolidColor(hex);
        const rgb = hexToRgb(hex);
        if (rgb) {
            onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
        }
    };

    const handleAlphaChange = (newAlpha: number) => {
        setAlpha(newAlpha);
        const rgb = hexToRgb(solidColor);
        if (rgb) {
            onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${newAlpha})`);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <div className="flex items-center space-x-2 p-2 bg-gray-800 border border-gray-600 rounded-md">
                <div className="relative w-8 h-8 rounded flex-shrink-0" style={{ background: isGradient ? value : 'transparent' }}>
                    <input 
                        type="color" 
                        value={isGradient ? '#000000' : solidColor} 
                        onChange={e => handleColorChange(e.target.value)} 
                        className="w-full h-full p-0 border-none rounded cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isGradient}
                        title={isGradient ? "Gradients must be edited as text" : "Select color"}
                    />
                </div>
                <input 
                    type="text" 
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)} 
                    className="w-full bg-transparent text-text-primary focus:outline-none" 
                    placeholder="rgba(...) or linear-gradient(...)"
                />
            </div>
            {!isGradient && (
                <div className="mt-2">
                    <label className="block text-xs font-medium text-text-secondary mb-1">Opacity ({Math.round(alpha * 100)}%)</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={alpha} 
                        onChange={e => handleAlphaChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                    />
                </div>
            )}
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
    );
};

export default AdvancedColorInput;
