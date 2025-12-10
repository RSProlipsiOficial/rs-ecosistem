import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { defaultTheme } from '../context/ThemeContext';
import { Theme, TypographyStyle, MobileMenuStyle } from '../types';
import AdvancedColorInput from './AdvancedColorInput';
import { useLanguage } from '../context/LanguageContext';

const fonts = ['Inter', 'Roboto', 'Lato', 'Montserrat', 'Open Sans'];
const fontWeights = [
    { label: 'Light', value: '300'},
    { label: 'Normal', value: '400'},
    { label: 'Medium', value: '500'},
    { label: 'Semi-Bold', value: '600'},
    { label: 'Bold', value: '700'},
    { label: 'Extra-Bold', value: '800'},
];
const textTransforms = ['none', 'uppercase', 'capitalize', 'lowercase'];

type TypographyElement = keyof Theme['typography'];
type NavigationElement = keyof Theme['navigation'];

const TypographyControlGroup: React.FC<{
    label: string;
    styles: TypographyStyle;
    onStyleChange: (newStyles: TypographyStyle) => void;
}> = ({ label, styles, onStyleChange }) => {
    const { t } = useLanguage();

    const handleChange = (property: keyof TypographyStyle, value: string) => {
        onStyleChange({
            ...styles,
            [property]: value,
        });
    };

    return (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-border">
            <h4 className="text-lg font-semibold text-text-primary mb-3">{label}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">{t('theme_editor_font_family')}</label>
                    <select value={styles.fontFamily} onChange={e => handleChange('fontFamily', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-text-primary text-sm focus:ring-accent focus:border-accent">
                        {fonts.map(font => <option key={font} value={font}>{font}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">{t('theme_editor_font_weight')}</label>
                    <select value={styles.fontWeight} onChange={e => handleChange('fontWeight', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-text-primary text-sm focus:ring-accent focus:border-accent">
                        {fontWeights.map(fw => <option key={fw.value} value={fw.value}>{t(`font_weight_${fw.label.toLowerCase().replace('-', '')}`)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">{t('theme_editor_transform')}</label>
                    <select value={styles.textTransform} onChange={e => handleChange('textTransform', e.target.value as TypographyStyle['textTransform'])} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-text-primary text-sm focus:ring-accent focus:border-accent">
                        {textTransforms.map(tt => <option key={tt} value={tt}>{tt}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
}

const ThemeEditor: React.FC = () => {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(theme);
  const { t } = useLanguage();

  // Deep comparison to check if form data has changed
  const hasChanged = useRef(false);
  useEffect(() => {
    hasChanged.current = JSON.stringify(theme) !== JSON.stringify(localTheme);
  }, [localTheme, theme]);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleColorChange = (key: keyof Theme['colors'], value: string) => {
    setLocalTheme(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };
  
  const handleTypographyChange = (element: TypographyElement, newStyles: TypographyStyle) => {
    setLocalTheme(prev => ({
        ...prev,
        typography: {
            ...prev.typography,
            [element]: newStyles
        }
    }));
  };
  
  const handleNavigationChange = (prop: NavigationElement, value: any) => {
    setLocalTheme(prev => ({
        ...prev,
        navigation: {
            ...prev.navigation,
            [prop]: value,
        }
    }));
  };

  const handleSave = () => {
    updateTheme(localTheme.colors, 'colors');
    updateTheme(localTheme.typography, 'typography');
    updateTheme(localTheme.navigation, 'navigation');
    alert(t('theme_editor_saved_success'));
  };

  const handleResetToDefault = () => {
    if (window.confirm(t('theme_editor_reset_confirm'))) {
        resetTheme(); // This will trigger the useEffect and update localTheme
    }
  };

  const colorFields: { key: keyof Theme['colors']; labelKey: string }[] = [
      { key: 'background', labelKey: 'theme_editor_bg_color' },
      { key: 'accent', labelKey: 'theme_editor_accent_color' },
      { key: 'textPrimary', labelKey: 'theme_editor_text_primary_color' },
      { key: 'textSecondary', labelKey: 'theme_editor_text_secondary_color' },
      { key: 'buttonBg', labelKey: 'theme_editor_btn_bg_color' },
      { key: 'buttonText', labelKey: 'theme_editor_btn_text_color' },
      { key: 'surface', labelKey: 'theme_editor_surface_color' },
      { key: 'border', labelKey: 'theme_editor_border_color' },
  ]
  
  const mobileMenuColorFields: { key: keyof Theme['colors']; labelKey: string }[] = [
      { key: 'mobileMenuBackground', labelKey: 'theme_editor_mobile_menu_bg' },
      { key: 'mobileMenuText', labelKey: 'theme_editor_mobile_menu_text' },
      { key: 'mobileMenuAccent', labelKey: 'theme_editor_mobile_menu_accent' },
  ];

  return (
    <div className="bg-surface rounded-lg border border-border space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-accent">{t('theme_editor_title')}</h2>
        <button 
            onClick={handleResetToDefault}
            className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm"
        >
            {t('theme_editor_reset')}
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-accent mb-4 border-b border-border pb-2">{t('theme_editor_header_nav')}</h3>
        <div className="pt-4 space-y-6">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{t('theme_editor_mobile_menu_style')}</label>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="mobileMenuStyle" value="overlay" checked={localTheme.navigation.mobileMenuStyle === 'overlay'} onChange={(e) => handleNavigationChange('mobileMenuStyle', e.target.value as MobileMenuStyle)} className="text-accent focus:ring-accent" />
                        <span>{t('theme_editor_mobile_menu_overlay')}</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="mobileMenuStyle" value="sidepanel" checked={localTheme.navigation.mobileMenuStyle === 'sidepanel'} onChange={(e) => handleNavigationChange('mobileMenuStyle', e.target.value as MobileMenuStyle)} className="text-accent focus:ring-accent" />
                        <span>{t('theme_editor_mobile_menu_sidepanel')}</span>
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {mobileMenuColorFields.map(field => (
                    <AdvancedColorInput 
                        key={field.key}
                        label={t(field.labelKey)}
                        value={localTheme.colors[field.key]}
                        onChange={value => handleColorChange(field.key, value)}
                    />
                ))}
            </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-accent mb-4 border-b border-border pb-2">{t('theme_editor_global_colors')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {colorFields.map(field => (
                <AdvancedColorInput 
                    key={field.key}
                    label={t(field.labelKey)}
                    value={localTheme.colors[field.key]}
                    onChange={value => handleColorChange(field.key, value)}
                />
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-accent mb-4 border-b border-border pb-2">{t('theme_editor_typography')}</h3>
        <div className="space-y-4 pt-4">
           {(Object.keys(localTheme.typography) as Array<TypographyElement>).map(element => (
               <TypographyControlGroup 
                    key={element}
                    label={element.charAt(0).toUpperCase() + element.slice(1).replace(/([A-Z])/g, ' $1')}
                    styles={localTheme.typography[element]}
                    onStyleChange={(newStyles) => handleTypographyChange(element, newStyles)}
                />
           ))}
        </div>
      </div>

       <div className="mt-8 pt-6 border-t border-border flex justify-end space-x-3">
            <button onClick={() => setLocalTheme(theme)} type="button" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700">{t('theme_editor_discard')}</button>
            <button onClick={handleSave} type="button" className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80" disabled={!hasChanged.current}>{t('admin_button_save_short')}</button>
        </div>
    </div>
  );
};

export default ThemeEditor;