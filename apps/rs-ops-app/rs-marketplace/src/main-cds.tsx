import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from '../RS-CDS/AppWrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black text-yellow-500">Carregando RS-CDS...</div>}>
            <AppWrapper />
        </Suspense>
    </React.StrictMode>,
);
