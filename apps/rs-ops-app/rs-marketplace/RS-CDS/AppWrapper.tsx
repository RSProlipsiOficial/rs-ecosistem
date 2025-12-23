import React from 'react';
import App from './App';

interface AppWrapperProps {
    onBack?: () => void;
    cdId?: string;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ onBack, cdId }) => {
    return (
        <App
            cdId={cdId}
            onBackToAdmin={onBack}
        />
    );
};

export default AppWrapper;
