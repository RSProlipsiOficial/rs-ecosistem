


import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useCardStyle } from '../context/CardStyleContext';
import { CardStyle } from '../types';
import AdvancedColorInput from './AdvancedColorInput';
import { useLanguage } from '../context/LanguageContext';

const shadowClasses = {
  none: '0 0 #0000',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

const CardStyleEditorModal: React.FC = () => {
    const { editingCardKey, closeCardStyleEditor } = useAdmin();
    const { getStyle, updateStyle } = useCardStyle();
    const [style, setStyle] = useState<CardStyle | null>(null);
    const { t } = useLanguage();
    
    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        if (editingCardKey) {
            hasChanged.current = JSON.stringify(getStyle(editingCardKey)) !== JSON.stringify(style);
        } else {
            hasChanged.current = false;
        }
    }, [style, editingCardKey, getStyle]);

    useEffect(() => {
        if (editingCardKey) {
            setStyle(getStyle(editingCardKey));
        } else {
            setStyle(null);
        }
    }, [editingCardKey, getStyle]);

    if (!editingCardKey || !style) return null;

    const handleSave = () => {
        updateStyle(editingCardKey, style);
        closeCardStyleEditor();
    };
    
    const handleStyleChange = (prop: keyof CardStyle, value: any) => {
        setStyle(prev => prev ? ({ ...prev, [prop]: value }) : null);
    };

    const previewStyle: React.CSSProperties = {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: `${style.borderWidth}px`,
        borderRadius: `${style.borderRadius}px`,
        boxShadow: shadowClasses[style.shadow],
        borderStyle: 'solid',
        transition: 'all 0.2s',
    };

    if (style.backgroundColor && style.backgroundColor.includes('gradient')) {
        previewStyle.backgroundImage = style.backgroundColor;
        previewStyle.backgroundColor = 'transparent';
    } else {
        previewStyle.backgroundImage = 'none';
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-accent">{t('card_editor_title')}: <span className="text-text-primary font-mono">{editingCardKey}</span></h3>
                     <button onClick={closeCardStyleEditor} className="text-text-secondary hover:text-text-primary"><CloseIcon/></button>
                </header>

                <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-3">{t('card_editor_fill_stroke')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <AdvancedColorInput label={t('card_editor_background')} value={style.backgroundColor} onChange={v => handleStyleChange('backgroundColor', v)} />
                                <AdvancedColorInput label={t('card_editor_border')} value={style.borderColor} onChange={v => handleStyleChange('borderColor', v)} />
                            </div>
                        </div>

                         <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-3">{t('card_editor_shape_shadow')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('card_editor_border_width')} ({style.borderWidth}px)</label>
                                    <input type="range" min="0" max="10" value={style.borderWidth} onChange={e => handleStyleChange('borderWidth', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('card_editor_corner_radius')} ({style.borderRadius}px)</label>
                                    <input type="range" min="0" max="32" value={style.borderRadius} onChange={e => handleStyleChange('borderRadius', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('card_editor_shadow')}</label>
                                    <select value={style.shadow} onChange={e => handleStyleChange('shadow', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                                        {Object.keys(shadowClasses).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                         <div className="bg-background rounded-lg flex flex-col items-center justify-center p-6 border-2 border-dashed border-border space-y-4 mt-6">
                            <h4 className="text-lg font-semibold text-text-primary">{t('card_editor_preview')}</h4>
                            <div style={previewStyle} className="w-48 h-32 flex items-center justify-center">
                                <span className="text-text-secondary">{t('card_editor_preview_text')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t border-border flex justify-end items-center">
                     <div className="flex space-x-3">
                        <button onClick={closeCardStyleEditor} type="button" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700">{t('admin_button_cancel')}</button>
                        <button onClick={handleSave} type="button" className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80" disabled={!hasChanged.current}>{t('admin_button_save_short')}</button>
                    </div>
                </footer>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none; appearance: none;
                    width: 16px; height: 16px;
                    background: var(--color-accent);
                    cursor: pointer; border-radius: 50%;
                }
                input[type="range"]::-moz-range-thumb {
                    width: 16px; height: 16px;
                    background: var(--color-accent);
                    cursor: pointer; border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

const CloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>

export default CardStyleEditorModal;