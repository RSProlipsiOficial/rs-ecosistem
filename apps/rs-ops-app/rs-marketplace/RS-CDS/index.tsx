import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Login from './components/Login';
import { supabase } from './services/supabaseClient';

const Root: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verifica sessão existente ao carregar
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setChecking(false);
    });

    // Ouve mudanças de sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return <Login onLogin={(id) => setUserId(id)} />;
  }

  return (
    <App
      userId={userId}
      onLogout={async () => {
        setUserId(null);
        await supabase.auth.signOut();
      }}
    />
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
