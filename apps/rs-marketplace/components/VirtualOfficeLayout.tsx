import React from 'react';

interface VirtualOfficeLayoutProps {
    children: React.ReactNode;
}

const VirtualOfficeLayout: React.FC<VirtualOfficeLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow">
                {children}
            </div>
        </div>
    );
};

export default VirtualOfficeLayout;