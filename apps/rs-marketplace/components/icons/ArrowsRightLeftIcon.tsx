import React from 'react';

interface ArrowsRightLeftIconProps {
    className?: string;
}

export const ArrowsRightLeftIcon: React.FC<ArrowsRightLeftIconProps> = ({ className }) => {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18m-6-8l4-4m0 0l-4-4m4 4H3" />
        </svg>
    );
};
