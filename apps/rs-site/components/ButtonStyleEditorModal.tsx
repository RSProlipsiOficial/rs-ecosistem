


import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useButtonStyle } from '../context/ButtonStyleContext';
import { useTheme } from '../context/ThemeContext';
import { ButtonStyle, ButtonPreset } from '../types';
import AdvancedColorInput from './AdvancedColorInput';
import { useLanguage } from '../context/LanguageContext';

const shadowClasses = {
  none: '0 0 #0000',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

const fontWeights = [
    { label: 'Light', value: '300'}, { label: 'Normal', value: '400'},
    { label: 'Medium', value: '500'}, { label: 'Semi-Bold', value: '600'},
    { label: 'Bold', value: '700'}, { label: 'Extra-Bold', value: '800'},
];
const textTransforms = ['none', 'uppercase', 'capitalize', 'lowercase'];

const getPresetStyle = (preset: ButtonPreset, theme: ReturnType<typeof useTheme>['theme']): Omit<ButtonStyle, 'preset' | 'padding'> => {
    const { colors } = theme;
    switch(preset) {
        case 'outline':
            return { backgroundColor: 'transparent', textColor: colors.accent, borderColor: colors.accent, borderWidth: 2, borderRadius: 8, shadow: 'none', textTransform: 'none', fontWeight: '700' };
        case 'ghost':
            return { backgroundColor: 'transparent', textColor: colors.textPrimary, borderColor: 'transparent', borderWidth: 0, borderRadius: 8, shadow: 'none', textTransform: 'none', fontWeight: '700' };
        case 'glass':
            return { backgroundColor: 'rgba(255, 255, 255, 0.1)', textColor: colors.textPrimary, borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1, borderRadius: 12, shadow: 'md', textTransform: 'none', fontWeight: '700' };
        case 'gradient':
            return { backgroundColor: `linear-gradient(to right, ${colors.accent}, ${colors.buttonBg})`, textColor: colors.buttonText, borderColor: 'transparent', borderWidth: 0, borderRadius: 9999, shadow: 'lg', textTransform: 'none', fontWeight: '700' };
        case 'solid':
        default:
            return { backgroundColor: colors.buttonBg, textColor: colors.buttonText, borderColor: 'transparent', borderWidth: 0, borderRadius: 9999, shadow: 'lg', textTransform: 'none', fontWeight: '700' };
    }
};

const ButtonStyleEditorModal: React.FC = () => {
    const { editingButtonKey, closeButtonStyleEditor } = useAdmin();
    const { getStyle, updateStyle, applyToAll } = useButtonStyle();
    const { theme } = useTheme();
    const [style, setStyle] = useState<ButtonStyle | null>(null);
    const { t } = useLanguage();
    
    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        if (editingButtonKey) {
            hasChanged.current = JSON.stringify(getStyle(editingButtonKey)) !== JSON.stringify(style);
        } else {
            hasChanged.current = false;
        }
    }, [style, editingButtonKey, getStyle]);

    useEffect(() => {
        if (editingButtonKey) {
            setStyle(getStyle(editingButtonKey));
        } else {
            setStyle(null);
        }
    }, [editingButtonKey, getStyle]);

    if (!editingButtonKey || !style) return null;

    const handleSave = () => {
        updateStyle(editingButtonKey, style);
        closeButtonStyleEditor();
    };
    
    const handleApplyToAll = () => {
        if (window.confirm(t('button_editor_apply_all_confirm'))) {
            applyToAll(editingButtonKey, style);
            closeButtonStyleEditor();
        }
    };

    const handlePresetChange = (preset: ButtonPreset) => {
        setStyle(prev => ({
            ...prev!,
            preset,
            ...getPresetStyle(preset, theme),
        }));
    };
    
    const handleStyleChange = (prop: keyof ButtonStyle, value: any) => {
        setStyle(prev => prev ? ({ ...prev, [prop]: value }) : null);
    };

    const previewStyle: React.CSSProperties = {
        backgroundColor: style.backgroundColor, color: style.textColor, borderColor: style.borderColor,
        borderWidth: `${style.borderWidth}px`, borderRadius: `${style.borderRadius}px`,
        boxShadow: shadowClasses[style.shadow], textTransform: style.textTransform,
        fontWeight: style.fontWeight, padding: style.padding, borderStyle: 'solid',
        transition: 'transform 0.2s',
    };
    if (style.backgroundColor && style.backgroundColor.includes('gradient')) {
        previewStyle.backgroundImage = style.backgroundColor;
        previewStyle.backgroundColor = 'transparent';
    } else {
        previewStyle.backgroundImage = 'none';
    }

    const presets: { id: ButtonPreset; labelKey: string }[] = [
        { id: 'solid', labelKey: 'button_editor_preset_solid' }, { id: 'outline', labelKey: 'button_editor_preset_outline' },
        { id: 'ghost', labelKey: 'button_editor_preset_ghost' }, { id: 'glass', labelKey: 'button_editor_preset_glass' },
        { id: 'gradient', labelKey: 'button_editor_preset_gradient' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-accent">{t('button_editor_title')}: <span className="text-text-primary font-mono">{editingButtonKey}</span></h3>
                     <button onClick={closeButtonStyleEditor} className="text-text-secondary hover:text-text-primary"><CloseIcon/></button>
                </header>

                <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-3">{t('button_editor_presets')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {presets.map(p => (
                                    <button key={p.id} onClick={() => handlePresetChange(p.id)} className={`px-4 py-2 text-sm rounded-md border-2 ${style.preset === p.id ? 'border-accent bg-accent/20' : 'border-border bg-gray-800'}`}>{t(p.labelKey)}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-3">{t('button_editor_colors')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <AdvancedColorInput label={style.preset === 'gradient' ? t('button_editor_gradient') : t('button_editor_background')} value={style.backgroundColor} onChange={v => handleStyleChange('backgroundColor', v)} hint={style.preset === 'gradient' ? 'e.g., linear-gradient(...)' : ''} />
                                <AdvancedColorInput label={t('button_editor_text')} value={style.textColor} onChange={v => handleStyleChange('textColor', v)} />
                            </div>
                        </div>

                         <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-3">{t('button_editor_border_shape')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <AdvancedColorInput label={t('button_editor_border_color')} value={style.borderColor} onChange={v => handleStyleChange('borderColor', v)} />
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('button_editor_border_width')} ({style.borderWidth}px)</label>
                                    <input type="range" min="0" max="5" value={style.borderWidth} onChange={e => handleStyleChange('borderWidth', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('button_editor_corner_radius')} ({style.borderRadius}px)</label>
                                    <input type="range" min="0" max="50" value={style.borderRadius} onChange={e => handleStyleChange('borderRadius', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('button_editor_shadow')}</label>
                                    <select value={style.shadow} onChange={e => handleStyleChange('shadow', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                                        {Object.keys(shadowClasses).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-3">{t('button_editor_typography_spacing')}</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('button_editor_padding')}</label>
                                    <input type="text" value={style.padding} onChange={e => handleStyleChange('padding', e.target.value)} placeholder="e.g. 12px 24px" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('theme_editor_font_weight')}</label>
                                     <select value={style.fontWeight} onChange={e => handleStyleChange('fontWeight', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                                        {fontWeights.map(fw => <option key={fw.value} value={fw.value}>{t(`font_weight_${fw.label.toLowerCase().replace('-', '')}`)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('theme_editor_transform')}</label>
                                     <select value={style.textTransform} onChange={e => handleStyleChange('textTransform', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                                        {textTransforms.map(tt => <option key={tt} value={tt}>{tt}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Preview */}
                    <div className="bg-background rounded-lg flex flex-col items-center justify-center p-6 border-2 border-dashed border-border space-y-4">
                        <h4 className="text-lg font-semibold text-text-primary">{t('button_editor_preview')}</h4>
                        <button style={previewStyle} className="hover:scale-105">{t('button_editor_preview_text')}</button>
                    </div>
                </div>

                <footer className="p-4 border-t border-border flex justify-between items-center">
                     {editingButtonKey.startsWith('buy_now') && (
                        <button onClick={handleApplyToAll} type="button" className="text-sm text-blue-400 hover:underline">{t('button_editor_apply_all_buy_now')}</button>
                     )}
                     <div className="flex-grow"></div>
                     <div className="flex space-x-3">
                        <button onClick={closeButtonStyleEditor} type="button" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700">{t('admin_button_cancel')}</button>
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

export default ButtonStyleEditorModal;