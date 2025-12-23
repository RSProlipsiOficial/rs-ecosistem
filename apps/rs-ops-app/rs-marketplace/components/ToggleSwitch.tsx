import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    labelId: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, labelId }) => {
    return (
        <label htmlFor={labelId} className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                id={labelId}
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
        </label>
    );
};